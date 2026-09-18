var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// server.ts
var import_express = __toESM(require("express"), 1);
var import_compression = __toESM(require("compression"), 1);
var import_path = __toESM(require("path"), 1);
var import_vite = require("vite");

// src/utils/riskAnalyzer.ts
var SENSATIONAL_KEYWORDS = [
  "breaking",
  "shocking",
  "share before deleted",
  "share before it is deleted",
  "urgent",
  "forwarded as received",
  "forward to all groups",
  "secret",
  "alert",
  "danger",
  "must watch",
  "100% proof",
  "banned news",
  "modi government ordered",
  "rbi urgent notice"
];
function evaluateRiskFlags(text, sourceUrl) {
  const flags = [];
  const lowerText = text.toLowerCase();
  const matchedSensationalWord = SENSATIONAL_KEYWORDS.find((keyword) => lowerText.includes(keyword));
  if (matchedSensationalWord) {
    flags.push({
      type: "Sensational",
      label: "Sensational",
      reason: `Contains viral trigger phrases (e.g., "${matchedSensationalWord}")`
    });
  }
  const letters = text.replace(/[^a-zA-Z]/g, "");
  if (letters.length >= 8) {
    const uppercaseLetters = letters.replace(/[^A-Z]/g, "");
    const capsPercentage = uppercaseLetters.length / letters.length * 100;
    if (capsPercentage > 50) {
      flags.push({
        type: "Shouting",
        label: "Shouting",
        reason: `${Math.round(capsPercentage)}% uppercase text (>50% threshold), typical of viral panic forwards`
      });
    }
  }
  const trimmedUrl = (sourceUrl || "").trim();
  const hasValidUrl = trimmedUrl.startsWith("http://") || trimmedUrl.startsWith("https://");
  if (!hasValidUrl) {
    flags.push({
      type: "Unsourced",
      label: "Unsourced",
      reason: "No verifiable link or publication source provided"
    });
  }
  const isHighRisk = flags.length >= 2;
  return { flags, isHighRisk };
}

// src/data/seedClaims.ts
var rawSeeds = [
  {
    id: "claim-101",
    text: "BREAKING: RBI ANNOUNCES THAT ALL \u20B9500 NOTES WITH STAR MARKS WILL BE INVALID NEXT MONTH! URGENT SHARE TO ALL FAMILY GROUPS BEFORE DELETED!",
    sourcePlatform: "WhatsApp",
    sourceUrl: "",
    category: "Finance",
    region: "Pan-India",
    status: "False",
    submittedAt: new Date(Date.now() - 1e3 * 60 * 35).toISOString(),
    // 35m ago
    reviewedAt: new Date(Date.now() - 1e3 * 60 * 15).toISOString(),
    reviewerNote: "RBI officially clarified that \u20B9500 banknotes with a star symbol in the number panel are 100% genuine and legal tender. The star mark denotes a replacement for a defectively printed note during batch production.",
    reviewerName: "Priya Sharma (Fact-Check Lead)",
    verificationSourceUrl: "https://rbi.org.in"
  },
  {
    id: "claim-102",
    text: "SHOCKING SECRET: BOILING RAW PAPAYA LEAF WATER CURES SEVERE DENGUE IN 6 HOURS! HOSPITALS ARE CONCEALING THIS! SHARE BEFORE DELETED!",
    sourcePlatform: "WhatsApp",
    sourceUrl: "",
    category: "Health",
    region: "Delhi NCR",
    status: "False",
    submittedAt: new Date(Date.now() - 1e3 * 60 * 80).toISOString(),
    // 80m ago
    reviewedAt: new Date(Date.now() - 1e3 * 60 * 45).toISOString(),
    reviewerNote: "Medical authorities and the Indian Medical Association (IMA) caution that dengue requires strict clinical platelet monitoring and IV hydration. Home remedies do not cure viral dengue in hours; delaying medical care can cause dangerous hemorrhage.",
    reviewerName: "Dr. A. Sen (Civic Health Desk)",
    verificationSourceUrl: "https://mohfw.gov.in"
  },
  {
    id: "claim-103",
    text: "Ministry of Railways has restored the 20% senior citizen fare concession on all Vande Bharat and Rajdhani express trains starting from next week.",
    sourcePlatform: "X",
    sourceUrl: "",
    category: "Other",
    region: "Pan-India",
    status: "Misleading",
    submittedAt: new Date(Date.now() - 1e3 * 60 * 130).toISOString(),
    reviewedAt: new Date(Date.now() - 1e3 * 60 * 60).toISOString(),
    reviewerNote: "While a Parliamentary standing committee recommended reconsidering fare concessions for senior citizens, the Ministry of Railways has not issued any gazette notification or order restoring discounts.",
    reviewerName: "Rohan Deshmukh (Civic Reporter)",
    verificationSourceUrl: "https://pib.gov.in"
  },
  {
    id: "claim-104",
    text: "PM Surya Ghar Muft Bijli Yojana provides central financial assistance of up to \u20B978,000 for installing 3kW rooftop solar systems in residential homes. Registration is open at the official portal.",
    sourcePlatform: "Instagram",
    sourceUrl: "https://pmsuryaghar.gov.in",
    category: "Finance",
    region: "Pan-India",
    status: "Verified True",
    submittedAt: new Date(Date.now() - 1e3 * 60 * 240).toISOString(),
    reviewedAt: new Date(Date.now() - 1e3 * 60 * 190).toISOString(),
    reviewerNote: "Claim verified directly against the Ministry of New and Renewable Energy (MNRE) guidelines for PM Surya Ghar Scheme launched in 2024.",
    reviewerName: "Kavita Iyer (Editorial Desk)",
    verificationSourceUrl: "https://pmsuryaghar.gov.in"
  },
  {
    id: "claim-105",
    text: "ALERT: Tap this link to claim \u20B94,500 festive financial aid credited by Government into your UPI account. Only valid for 24 hours for registered mobile numbers.",
    sourcePlatform: "WhatsApp",
    sourceUrl: "",
    category: "Finance",
    region: "Uttar Pradesh",
    status: "False",
    submittedAt: new Date(Date.now() - 1e3 * 60 * 18).toISOString(),
    reviewedAt: new Date(Date.now() - 1e3 * 60 * 5).toISOString(),
    reviewerNote: "Known phishing lure designed to steal UPI credentials. No government department dispenses cash grants via random SMS or WhatsApp links asking users to enter their UPI PIN.",
    reviewerName: "Cyber Crime Triage Desk",
    verificationSourceUrl: "https://cybercrime.gov.in"
  },
  {
    id: "claim-106",
    text: "IMD issues orange alert for heavy to very heavy rainfall in Mumbai and Thane coastal belt over the next 36 hours. Disaster management teams deployed.",
    sourcePlatform: "X",
    sourceUrl: "https://mausam.imd.gov.in",
    category: "Other",
    region: "Mumbai",
    status: "Unverified",
    submittedAt: new Date(Date.now() - 1e3 * 60 * 12).toISOString()
  },
  {
    id: "claim-107",
    text: "ELECTION COMMISSION EXTENDS POLLING HOURS TILL 8 PM IN RURAL CONSTITUENCIES DUE TO SUMMER HEATWAVE! SHARE TO INFORM VOTERS!",
    sourcePlatform: "WhatsApp",
    sourceUrl: "",
    category: "Politics",
    region: "Bihar",
    status: "Unverified",
    submittedAt: new Date(Date.now() - 1e3 * 60 * 8).toISOString()
  }
];
var initialClaims = rawSeeds.map((item) => {
  const { flags, isHighRisk } = evaluateRiskFlags(item.text, item.sourceUrl);
  return {
    ...item,
    flags,
    isHighRisk,
    revisions: [],
    upvotes: Math.floor(Math.random() * 24) + 3
  };
});

// server.ts
var app = (0, import_express.default)();
var PORT = 3e3;
app.use((0, import_compression.default)());
app.use(import_express.default.json());
var claimsStore = [...initialClaims];
var policyStore = {
  feedOrder: "risk",
  // DP1 default: high risk first to combat viral contagion
  visibility: "all",
  // DP2 default: show unverified claims with prominent warning badge
  allowEditing: true
  // DP3 default: editing permitted with audit trail & flag re-calculation
};
function getStats() {
  const totalClaims = claimsStore.length;
  const unverifiedCount = claimsStore.filter((c) => c.status === "Unverified").length;
  const highRiskCount = claimsStore.filter((c) => c.isHighRisk).length;
  const debunkedFalseCount = claimsStore.filter((c) => c.status === "False").length;
  const verifiedTrueCount = claimsStore.filter((c) => c.status === "Verified True").length;
  const misleadingCount = claimsStore.filter((c) => c.status === "Misleading").length;
  return {
    totalClaims,
    unverifiedCount,
    highRiskCount,
    debunkedFalseCount,
    verifiedTrueCount,
    misleadingCount
  };
}
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", time: (/* @__PURE__ */ new Date()).toISOString(), claimsCount: claimsStore.length });
});
app.get("/api/stats", (req, res) => {
  res.json(getStats());
});
app.get("/api/policy", (req, res) => {
  res.json(policyStore);
});
app.post("/api/policy", (req, res) => {
  const { feedOrder, visibility, allowEditing } = req.body;
  if (feedOrder) policyStore.feedOrder = feedOrder;
  if (visibility) policyStore.visibility = visibility;
  if (typeof allowEditing === "boolean") policyStore.allowEditing = allowEditing;
  res.json({ success: true, policy: policyStore });
});
app.get("/api/claims", (req, res) => {
  const { q, category, status, sortBy, visibility } = req.query;
  let results = [...claimsStore];
  const activeVisibility = visibility || policyStore.visibility;
  if (activeVisibility === "quarantine_unverified") {
    results = results.filter((c) => c.status !== "Unverified");
  }
  if (category && category !== "All") {
    results = results.filter((c) => c.category.toLowerCase() === category.toLowerCase());
  }
  if (status && status !== "All") {
    if (status === "High Risk") {
      results = results.filter((c) => c.isHighRisk);
    } else {
      results = results.filter((c) => c.status.toLowerCase() === status.toLowerCase());
    }
  }
  if (q && typeof q === "string" && q.trim()) {
    const term = q.toLowerCase().trim();
    results = results.filter(
      (c) => c.text.toLowerCase().includes(term) || c.reviewerNote && c.reviewerNote.toLowerCase().includes(term) || c.region && c.region.toLowerCase().includes(term) || c.sourcePlatform.toLowerCase().includes(term)
    );
  }
  const activeSort = sortBy || policyStore.feedOrder;
  if (activeSort === "risk") {
    results.sort((a, b) => {
      if (a.isHighRisk !== b.isHighRisk) return a.isHighRisk ? -1 : 1;
      if (b.flags.length !== a.flags.length) return b.flags.length - a.flags.length;
      return new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime();
    });
  } else if (activeSort === "recency") {
    results.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
  } else if (activeSort === "status") {
    const rank = {
      "Unverified": 1,
      "False": 2,
      "Misleading": 3,
      "Verified True": 4
    };
    results.sort((a, b) => (rank[a.status] || 5) - (rank[b.status] || 5));
  }
  res.json({
    count: results.length,
    total: claimsStore.length,
    policy: {
      appliedOrder: activeSort,
      appliedVisibility: activeVisibility
    },
    claims: results
  });
});
app.get("/api/claims/:id", (req, res) => {
  const claim = claimsStore.find((c) => c.id === req.params.id);
  if (!claim) {
    return res.status(404).json({ error: "Claim not found" });
  }
  res.json(claim);
});
app.post("/api/claims", (req, res) => {
  const { text, sourcePlatform, sourceUrl, category, region } = req.body;
  if (!text || typeof text !== "string" || text.trim().length < 5) {
    return res.status(400).json({ error: "Claim text must be at least 5 characters long" });
  }
  const validPlatforms = ["WhatsApp", "X", "Instagram", "Facebook", "Telegram", "Other"];
  const platform = validPlatforms.includes(sourcePlatform) ? sourcePlatform : "WhatsApp";
  const validCategories = ["Politics", "Health", "Finance", "Other"];
  const cat = validCategories.includes(category) ? category : "Other";
  const { flags, isHighRisk } = evaluateRiskFlags(text, sourceUrl);
  const newClaim = {
    id: `claim-${Date.now()}-${Math.floor(Math.random() * 1e3)}`,
    text: text.trim(),
    sourcePlatform: platform,
    sourceUrl: (sourceUrl || "").trim(),
    category: cat,
    region: region && region.trim() ? region.trim() : "Pan-India",
    status: "Unverified",
    flags,
    isHighRisk,
    submittedAt: (/* @__PURE__ */ new Date()).toISOString(),
    revisions: [],
    upvotes: 1
  };
  claimsStore.unshift(newClaim);
  res.status(201).json(newClaim);
});
app.patch("/api/claims/:id/review", (req, res) => {
  const claimIndex = claimsStore.findIndex((c) => c.id === req.params.id);
  if (claimIndex === -1) {
    return res.status(404).json({ error: "Claim not found" });
  }
  const { status, reviewerNote, reviewerName, verificationSourceUrl } = req.body;
  const validStatuses = ["Unverified", "Verified True", "False", "Misleading"];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: "Invalid status provided" });
  }
  claimsStore[claimIndex] = {
    ...claimsStore[claimIndex],
    status,
    reviewerNote: reviewerNote || claimsStore[claimIndex].reviewerNote || "",
    reviewerName: reviewerName || claimsStore[claimIndex].reviewerName || "Triage Fact-Checker",
    verificationSourceUrl: verificationSourceUrl || claimsStore[claimIndex].verificationSourceUrl || "",
    reviewedAt: (/* @__PURE__ */ new Date()).toISOString()
  };
  res.json(claimsStore[claimIndex]);
});
app.put("/api/claims/:id", (req, res) => {
  if (!policyStore.allowEditing) {
    return res.status(403).json({
      error: "Editorial Policy DP3: Post-submission edits are currently disabled in policy settings."
    });
  }
  const claimIndex = claimsStore.findIndex((c) => c.id === req.params.id);
  if (claimIndex === -1) {
    return res.status(404).json({ error: "Claim not found" });
  }
  const currentClaim = claimsStore[claimIndex];
  const { text, sourceUrl, editReason } = req.body;
  const newText = text ? text.trim() : currentClaim.text;
  const newSourceUrl = sourceUrl !== void 0 ? sourceUrl.trim() : currentClaim.sourceUrl;
  const { flags, isHighRisk } = evaluateRiskFlags(newText, newSourceUrl);
  const revisions = currentClaim.revisions || [];
  revisions.push({
    editedAt: (/* @__PURE__ */ new Date()).toISOString(),
    previousText: currentClaim.text,
    newText,
    note: editReason || "Correction/update made to claim text or source link"
  });
  claimsStore[claimIndex] = {
    ...currentClaim,
    text: newText,
    sourceUrl: newSourceUrl,
    flags,
    isHighRisk,
    revisions
  };
  res.json(claimsStore[claimIndex]);
});
app.post("/api/reset", (req, res) => {
  claimsStore = [...initialClaims];
  policyStore = {
    feedOrder: "risk",
    visibility: "all",
    allowEditing: true
  };
  res.json({ success: true, message: "Reset to initial Indian seed claims dataset." });
});
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await (0, import_vite.createServer)({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = import_path.default.join(process.cwd(), "dist");
    app.use(
      "/assets",
      import_express.default.static(import_path.default.join(distPath, "assets"), {
        maxAge: "1y",
        immutable: true
      })
    );
    app.use(import_express.default.static(distPath, { maxAge: "1h" }));
    app.get("*", (req, res) => {
      res.sendFile(import_path.default.join(distPath, "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Truth Lens Server running on http://0.0.0.0:${PORT}`);
  });
}
startServer();
//# sourceMappingURL=server.cjs.map
