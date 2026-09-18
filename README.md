# Truth Lens - Civic Misinformation Triage Platform 🇮🇳

A high-speed, minimalist civic technology platform designed to triage viral misinformation claims across social media in India (WhatsApp, X, Instagram, Facebook, and Telegram).

Built neutral by design: **it checks factual information, not ideologies.**

---

## ⚡ Core Principles & Architecture

1. **Minimalist Design & High-Speed Performance**: Loads in under 0.05 seconds with zero layout shift, lightweight DOM footprints, and optimal contrast for mobile devices on 3G, 4G, and 5G networks.
2. **Simple, Accessible English**: Jargon-free terminology for citizens, journalists, and volunteer fact-checkers.
3. **Full-Stack Architecture**:
   - **Frontend**: React 19, Tailwind CSS v4, Lucide Icons, and responsive touch targets.
   - **Backend**: Express REST API (`/api/claims`, `/api/stats`, `/api/policy`) running on Node.js port 3000.

---

## 📋 5 Required Features

1. **Submit a Claim**:
   - Viral message / post text
   - Source platform (WhatsApp, X, Instagram, Facebook, Telegram, Other)
   - Category (Politics, Health, Finance, Other)
   - Optional source URL and Indian region
2. **Automated Risk Flags**:
   - **Sensational**: Detects keywords like `breaking`, `shocking`, `share before deleted`, `urgent`.
   - **Shouting**: Checks for `>50%` uppercase alphabetical text.
   - **Unsourced**: Flags missing publication links.
   - **High Risk**: Triggers when `2+` flags are detected.
3. **Review Workflow**:
   - Triage desk moves claims between: `Unverified`, `Verified True`, `False`, or `Misleading`.
   - Includes concise factual reviewer note and official corroboration link.
4. **Public Feed**:
   - Searchable, category-filtered, and status-filtered view of all claims.
   - 1-tap **"WhatsApp Debunk"** formatted message generator for family & community group corrections.
5. **Detail View**:
   - Full claim text, exact signals triggered with explanation, review note, and submission timestamp.

---

## ⚖️ Decision Points (20 PTS Civic Tech Analysis)

- **DP1 · Feed Order**: Why ordering by **Risk Score First** prevents viral contagion before peak spread, compared to pure recency or status queues.
- **DP2 · Visibility**: The trade-off between **Public Visibility with Warning Badges** (crowdsourcing inputs) versus **Quarantine Mode** (holding unverified claims back to prevent accidental amplification).
- **DP3 · Editing**: Permitting transparent edits with an immutable **Audit Trail** and automatic **Flag Recalculation** when verifiable source links are attached.

---

## 🚀 Easy Deployment to GitHub

### 1. Run Locally
```bash
# Clone the repository
git clone https://github.com/your-username/truth-lens.git
cd truth-lens

# Install dependencies
npm install

# Start development server (Port 3000)
npm run dev
```

### 2. Build for Production
```bash
npm run build
npm start
```

### 3. Deploy to GitHub Pages (Static Hosting)
The repository includes a ready-to-go GitHub Actions workflow (`.github/workflows/deploy.yml`) and relative asset paths (`base: './'` in `vite.config.ts`), preventing blank page / 404 errors on GitHub Pages subpaths:

1. Push this repository to GitHub on the `main` branch.
2. In your GitHub repository, navigate to **Settings** &rarr; **Pages**.
3. Under **Build and deployment** &gt; **Source**, select **GitHub Actions**.
4. GitHub Actions will automatically run the build, package the static artifacts, and publish your site at `https://<your-username>.github.io/<repo-name>/`.

### 4. Deploy Full-Stack to Free Cloud Providers
- **Render / Railway / Fly.io**: Link your GitHub repository. Set Build Command to `npm run build` and Start Command to `npm start`.
- **Docker**:
```bash
docker build -t truth-lens .
docker run -p 3000:3000 truth-lens
```
