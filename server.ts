import express, { Request, Response } from 'express';
import compression from 'compression';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { Claim, DecisionPointsConfig, TriageStats } from './src/types';
import { initialClaims } from './src/data/seedClaims';
import { evaluateRiskFlags } from './src/utils/riskAnalyzer';

const app = express();
const PORT = 3000;

// High-speed compression for CSS, JS, HTML, and API payloads
app.use(compression());
app.use(express.json());

// In-memory data store for claims and editorial policy
let claimsStore: Claim[] = [...initialClaims];

let policyStore: DecisionPointsConfig = {
  feedOrder: 'risk', // DP1 default: high risk first to combat viral contagion
  visibility: 'all', // DP2 default: show unverified claims with prominent warning badge
  allowEditing: true, // DP3 default: editing permitted with audit trail & flag re-calculation
};

// Compute high-velocity stats
function getStats(): TriageStats {
  const totalClaims = claimsStore.length;
  const unverifiedCount = claimsStore.filter(c => c.status === 'Unverified').length;
  const highRiskCount = claimsStore.filter(c => c.isHighRisk).length;
  const debunkedFalseCount = claimsStore.filter(c => c.status === 'False').length;
  const verifiedTrueCount = claimsStore.filter(c => c.status === 'Verified True').length;
  const misleadingCount = claimsStore.filter(c => c.status === 'Misleading').length;

  return {
    totalClaims,
    unverifiedCount,
    highRiskCount,
    debunkedFalseCount,
    verifiedTrueCount,
    misleadingCount,
  };
}

// -------------------------------------------------------------
// API ROUTES
// -------------------------------------------------------------

// Health check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', time: new Date().toISOString(), claimsCount: claimsStore.length });
});

// Stats summary endpoint
app.get('/api/stats', (req: Request, res: Response) => {
  res.json(getStats());
});

// Policy configuration (DP1, DP2, DP3)
app.get('/api/policy', (req: Request, res: Response) => {
  res.json(policyStore);
});

app.post('/api/policy', (req: Request, res: Response) => {
  const { feedOrder, visibility, allowEditing } = req.body;
  if (feedOrder) policyStore.feedOrder = feedOrder;
  if (visibility) policyStore.visibility = visibility;
  if (typeof allowEditing === 'boolean') policyStore.allowEditing = allowEditing;
  res.json({ success: true, policy: policyStore });
});

// 1. GET claims (supports search, category, status filter, and DP1/DP2 logic)
app.get('/api/claims', (req: Request, res: Response) => {
  const { q, category, status, sortBy, visibility } = req.query;

  let results = [...claimsStore];

  // DP2 visibility policy: If set to quarantine, hide unverified claims from public feed
  const activeVisibility = (visibility as string) || policyStore.visibility;
  if (activeVisibility === 'quarantine_unverified') {
    results = results.filter(c => c.status !== 'Unverified');
  }

  // Category filter
  if (category && category !== 'All') {
    results = results.filter(c => c.category.toLowerCase() === (category as string).toLowerCase());
  }

  // Status filter
  if (status && status !== 'All') {
    if (status === 'High Risk') {
      results = results.filter(c => c.isHighRisk);
    } else {
      results = results.filter(c => c.status.toLowerCase() === (status as string).toLowerCase());
    }
  }

  // Search query (claims text, reviewer note, region, source platform)
  if (q && typeof q === 'string' && q.trim()) {
    const term = q.toLowerCase().trim();
    results = results.filter(
      c =>
        c.text.toLowerCase().includes(term) ||
        (c.reviewerNote && c.reviewerNote.toLowerCase().includes(term)) ||
        (c.region && c.region.toLowerCase().includes(term)) ||
        c.sourcePlatform.toLowerCase().includes(term)
    );
  }

  // DP1 Sort order
  const activeSort = (sortBy as string) || policyStore.feedOrder;
  if (activeSort === 'risk') {
    // High risk first, then by flag count, then by recency
    results.sort((a, b) => {
      if (a.isHighRisk !== b.isHighRisk) return a.isHighRisk ? -1 : 1;
      if (b.flags.length !== a.flags.length) return b.flags.length - a.flags.length;
      return new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime();
    });
  } else if (activeSort === 'recency') {
    results.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
  } else if (activeSort === 'status') {
    // Group: Unverified first (needs action), then False, then Misleading, then Verified True
    const rank: Record<Claim['status'], number> = {
      'Unverified': 1,
      'False': 2,
      'Misleading': 3,
      'Verified True': 4,
    };
    results.sort((a, b) => (rank[a.status] || 5) - (rank[b.status] || 5));
  }

  res.json({
    count: results.length,
    total: claimsStore.length,
    policy: {
      appliedOrder: activeSort,
      appliedVisibility: activeVisibility,
    },
    claims: results,
  });
});

// 2. GET single claim by ID
app.get('/api/claims/:id', (req: Request, res: Response) => {
  const claim = claimsStore.find(c => c.id === req.params.id);
  if (!claim) {
    return res.status(404).json({ error: 'Claim not found' });
  }
  res.json(claim);
});

// 3. POST new claim (FEATURE 1 + FEATURE 2)
app.post('/api/claims', (req: Request, res: Response) => {
  const { text, sourcePlatform, sourceUrl, category, region } = req.body;

  if (!text || typeof text !== 'string' || text.trim().length < 5) {
    return res.status(400).json({ error: 'Claim text must be at least 5 characters long' });
  }

  const validPlatforms = ['WhatsApp', 'X', 'Instagram', 'Facebook', 'Telegram', 'Other'];
  const platform = validPlatforms.includes(sourcePlatform) ? sourcePlatform : 'WhatsApp';

  const validCategories = ['Politics', 'Health', 'Finance', 'Other'];
  const cat = validCategories.includes(category) ? category : 'Other';

  // Feature 2: Evaluate risk flags automatically
  const { flags, isHighRisk } = evaluateRiskFlags(text, sourceUrl);

  const newClaim: Claim = {
    id: `claim-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    text: text.trim(),
    sourcePlatform: platform,
    sourceUrl: (sourceUrl || '').trim(),
    category: cat,
    region: region && region.trim() ? region.trim() : 'Pan-India',
    status: 'Unverified',
    flags,
    isHighRisk,
    submittedAt: new Date().toISOString(),
    revisions: [],
    upvotes: 1,
  };

  // Prepend new claim
  claimsStore.unshift(newClaim);

  res.status(201).json(newClaim);
});

// 4. PATCH review workflow (FEATURE 3)
app.patch('/api/claims/:id/review', (req: Request, res: Response) => {
  const claimIndex = claimsStore.findIndex(c => c.id === req.params.id);
  if (claimIndex === -1) {
    return res.status(404).json({ error: 'Claim not found' });
  }

  const { status, reviewerNote, reviewerName, verificationSourceUrl } = req.body;

  const validStatuses: Claim['status'][] = ['Unverified', 'Verified True', 'False', 'Misleading'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: 'Invalid status provided' });
  }

  claimsStore[claimIndex] = {
    ...claimsStore[claimIndex],
    status,
    reviewerNote: reviewerNote || claimsStore[claimIndex].reviewerNote || '',
    reviewerName: reviewerName || claimsStore[claimIndex].reviewerName || 'Triage Fact-Checker',
    verificationSourceUrl: verificationSourceUrl || claimsStore[claimIndex].verificationSourceUrl || '',
    reviewedAt: new Date().toISOString(),
  };

  res.json(claimsStore[claimIndex]);
});

// 5. PUT edit claim text/source (DECISION POINT 3: Audited Editing & Flag Recomputation)
app.put('/api/claims/:id', (req: Request, res: Response) => {
  if (!policyStore.allowEditing) {
    return res.status(403).json({
      error: 'Editorial Policy DP3: Post-submission edits are currently disabled in policy settings.',
    });
  }

  const claimIndex = claimsStore.findIndex(c => c.id === req.params.id);
  if (claimIndex === -1) {
    return res.status(404).json({ error: 'Claim not found' });
  }

  const currentClaim = claimsStore[claimIndex];
  const { text, sourceUrl, editReason } = req.body;

  const newText = text ? text.trim() : currentClaim.text;
  const newSourceUrl = sourceUrl !== undefined ? sourceUrl.trim() : currentClaim.sourceUrl;

  // DP3 core logic: Re-evaluate risk flags when edited!
  const { flags, isHighRisk } = evaluateRiskFlags(newText, newSourceUrl);

  const revisions = currentClaim.revisions || [];
  revisions.push({
    editedAt: new Date().toISOString(),
    previousText: currentClaim.text,
    newText: newText,
    note: editReason || 'Correction/update made to claim text or source link',
  });

  claimsStore[claimIndex] = {
    ...currentClaim,
    text: newText,
    sourceUrl: newSourceUrl,
    flags,
    isHighRisk,
    revisions,
  };

  res.json(claimsStore[claimIndex]);
});

// 6. Reset or seed endpoint
app.post('/api/reset', (req: Request, res: Response) => {
  claimsStore = [...initialClaims];
  policyStore = {
    feedOrder: 'risk',
    visibility: 'all',
    allowEditing: true,
  };
  res.json({ success: true, message: 'Reset to initial Indian seed claims dataset.' });
});

// -------------------------------------------------------------
// VITE OR STATIC SERVING
// -------------------------------------------------------------
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    // Cache minified & concatenated static assets with immutable cache headers to decrease HTTP requests
    app.use(
      '/assets',
      express.static(path.join(distPath, 'assets'), {
        maxAge: '1y',
        immutable: true,
      })
    );
    app.use(express.static(distPath, { maxAge: '1h' }));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Truth Lens Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
