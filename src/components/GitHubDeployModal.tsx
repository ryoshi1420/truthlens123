import React, { useState } from 'react';
import { X, Github, Terminal, Check, Copy, ExternalLink, ShieldCheck, Zap, Server, Globe } from 'lucide-react';

interface GitHubDeployModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GitHubDeployModal: React.FC<GitHubDeployModalProps> = ({ isOpen, onClose }) => {
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  if (!isOpen) return null;

  const copyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedSection(id);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const gitPushCommands = `# Step 1: Create an empty repository on GitHub named "truth-lens"
# Step 2: In this workspace or downloaded project, link and push:
git remote add origin https://github.com/<your-username>/truth-lens.git
git branch -M main
git push -u origin main`;

  const gitCommands = `# 1. Clone your repository
git clone https://github.com/<your-username>/truth-lens.git
cd truth-lens

# 2. Install dependencies
npm install

# 3. Start development server (Port 3000)
npm run dev

# 4. Production build & start
npm run build
npm start`;

  const dockerCommand = `# Run anywhere using Node.js or Docker
docker build -t truth-lens .
docker run -p 3000:3000 truth-lens`;

  return (
    <div
      id="modal-github-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-neutral-900/60 backdrop-blur-xs overflow-y-auto"
      onClick={onClose}
    >
      <div
        id="modal-github"
        onClick={e => e.stopPropagation()}
        className="relative w-full max-w-2xl bg-white rounded-2xl border border-neutral-200 shadow-2xl overflow-hidden my-6"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-neutral-200 flex items-center justify-between bg-neutral-900 text-white">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-neutral-800 flex items-center justify-center">
              <Github className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">GitHub Deployment & Architecture</h2>
              <p className="text-xs text-neutral-400">
                Full-stack Node.js + Express backend + React 19 frontend
              </p>
            </div>
          </div>
          <button
            id="btn-close-github-modal"
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto text-xs text-neutral-700">
          {/* Architecture overview */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-200">
              <div className="flex items-center gap-1.5 font-bold text-neutral-900 mb-1">
                <Server className="w-4 h-4 text-emerald-600" />
                <span>Express API Backend</span>
              </div>
              <p className="text-[11px] text-neutral-500">
                Lightweight REST API (`/api/claims`, `/api/stats`, `/api/policy`) running on port 3000.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-200">
              <div className="flex items-center gap-1.5 font-bold text-neutral-900 mb-1">
                <Zap className="w-4 h-4 text-amber-500" />
                <span>Instant React Frontend</span>
              </div>
              <p className="text-[11px] text-neutral-500">
                Tailwind CSS v4 + Vite + Motion layout animations with zero client lag.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-200">
              <div className="flex items-center gap-1.5 font-bold text-neutral-900 mb-1">
                <ShieldCheck className="w-4 h-4 text-sky-600" />
                <span>Neutral Civic Triage</span>
              </div>
              <p className="text-[11px] text-neutral-500">
                Automated 3-rule risk analyzer: Sensational, Shouting, and Unsourced flags.
              </p>
            </div>
          </div>

          {/* Direct Method 1: AI Studio One-Click Export */}
          <div className="p-4 rounded-xl bg-neutral-900 text-white space-y-2 border border-neutral-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-xs">
                <Github className="w-4 h-4 text-emerald-400" />
                <span>Method 1: Direct 1-Click Export from AI Studio</span>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Recommended
              </span>
            </div>
            <p className="text-[11px] text-neutral-300 leading-relaxed">
              In the Google AI Studio top bar: click the <strong>Settings menu (⋮)</strong> or <strong>Share</strong> button, then select <strong>Export to GitHub</strong>. AI Studio will prompt you to connect your GitHub account and will automatically create the repository with all source code committed.
            </p>
          </div>

          {/* Direct Method 2: Git CLI Push */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-bold text-neutral-900 flex items-center gap-1.5">
                <Terminal className="w-4 h-4 text-neutral-700" />
                <span>Method 2: Push Current Workspace via Git CLI</span>
              </span>
              <button
                onClick={() => copyCode(gitPushCommands, 'push')}
                className="flex items-center gap-1 text-[11px] font-semibold text-neutral-600 hover:text-black cursor-pointer"
              >
                {copiedSection === 'push' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                <span>{copiedSection === 'push' ? 'Copied' : 'Copy Commands'}</span>
              </button>
            </div>
            <pre className="p-3.5 rounded-xl bg-neutral-900 text-neutral-200 font-mono text-[11px] overflow-x-auto leading-relaxed">
              {gitPushCommands}
            </pre>
            <p className="text-[10px] text-neutral-500 mt-1">
              * The local repository is already initialized with branch <code className="bg-neutral-100 px-1 rounded font-bold text-neutral-800">main</code> and the clean initial commit is created.
            </p>
          </div>

          {/* Quick Start Commands */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-bold text-neutral-900 flex items-center gap-1.5">
                <Terminal className="w-4 h-4 text-neutral-700" />
                <span>Clone & Run Locally</span>
              </span>
              <button
                onClick={() => copyCode(gitCommands, 'git')}
                className="flex items-center gap-1 text-[11px] font-semibold text-neutral-600 hover:text-black cursor-pointer"
              >
                {copiedSection === 'git' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                <span>{copiedSection === 'git' ? 'Copied' : 'Copy Commands'}</span>
              </button>
            </div>
            <pre className="p-3.5 rounded-xl bg-neutral-900 text-neutral-200 font-mono text-[11px] overflow-x-auto leading-relaxed">
              {gitCommands}
            </pre>
          </div>

          {/* Easy Deployment Options */}
          <div className="space-y-2">
            <span className="font-bold text-neutral-900 block">
              1-Click Deployment Targets:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
              <div className="p-3 rounded-lg border border-neutral-200 bg-neutral-50 sm:col-span-2">
                <div className="flex items-center justify-between mb-1">
                  <strong className="text-neutral-900 flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-blue-600" />
                    <span>GitHub Pages (Fix for Blank White Page):</span>
                  </strong>
                  <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">
                    Workflow included
                  </span>
                </div>
                <p className="text-neutral-600 leading-relaxed">
                  GitHub Pages serves sites at subpaths like <code className="bg-neutral-200 px-1 rounded">https://user.github.io/repo/</code>. We configured <code className="bg-neutral-200 px-1 rounded font-bold">base: './'</code> and created <code className="bg-neutral-200 px-1 rounded font-bold">.github/workflows/deploy.yml</code>.
                </p>
                <div className="mt-2 text-[10px] text-neutral-700 bg-white p-2 rounded border border-neutral-200">
                  <strong>To enable:</strong> Go to your GitHub repo &rarr; <strong>Settings</strong> &rarr; <strong>Pages</strong> &rarr; under <em>Build and deployment Source</em>, select <strong>GitHub Actions</strong>. It will build and deploy automatically!
                </div>
              </div>

              <div className="p-3 rounded-lg border border-neutral-200 bg-neutral-50">
                <strong className="text-neutral-900 block">Render / Railway / Fly.io:</strong>
                <p className="text-neutral-500 mt-0.5">
                  Connect your GitHub repo. Build Command: <code className="bg-neutral-200 px-1 rounded">npm run build</code>, Start Command: <code className="bg-neutral-200 px-1 rounded">npm start</code>.
                </p>
              </div>

              <div className="p-3 rounded-lg border border-neutral-200 bg-neutral-50">
                <strong className="text-neutral-900 block">Google Cloud Run / Docker:</strong>
                <p className="text-neutral-500 mt-0.5">
                  Production Dockerfile included: <code className="bg-neutral-200 px-1 rounded">docker build -t truth-lens .</code>
                </p>
              </div>
            </div>
          </div>

          {/* Zero Secret Requirement */}
          <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900 text-[11px]">
            <strong>Ready to run out-of-the-box:</strong> No required external API keys or complex database installations are mandatory to get started. The platform operates self-sufficiently with high-speed built-in store and realistic Indian viral dataset seeds.
          </div>
        </div>

        <div className="px-6 py-3.5 border-t border-neutral-200 bg-neutral-50 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-xs font-semibold bg-neutral-900 text-white hover:bg-black transition-colors cursor-pointer"
          >
            Close Guide
          </button>
        </div>
      </div>
    </div>
  );
};
