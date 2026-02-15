import { Github, Linkedin, Shield, Heart } from "lucide-react";

const GITHUB_URL = "https://github.com/techVasanthsmart";
const LINKEDIN_URL = "https://www.linkedin.com/in/vasanthkumar-s-0995a5185/";
const PROFILE_IMAGE = "/svk.png";
const AUTHOR_NAME = "Vasanth Kumar";

export default function Footer() {
  return (
    <footer className="w-full mt-auto border-t border-white/5 bg-slate-900/30 backdrop-blur-sm shrink-0">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-3">
        <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1.5 text-xs text-slate-500">
          <span className="inline-flex items-center gap-1.5 shrink-0">
            <Shield className="w-3.5 h-3.5 text-emerald-400 shrink-0" aria-hidden />
            <span>Secure · No data leaves your device</span>
          </span>
          <span className="text-white/20 shrink-0">·</span>
          <span className="shrink-0">No login</span>
          <span className="text-white/20 shrink-0">·</span>
          <span className="shrink-0">Free forever</span>
          <span className="text-white/20 shrink-0">·</span>
          <a
            href={GITHUB_URL}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 group shrink-0 text-slate-400 hover:text-white transition-colors"
            aria-label={`${AUTHOR_NAME} on GitHub`}
          >
            <img
              src={PROFILE_IMAGE}
              alt=""
              className="w-6 h-6 rounded-full object-cover border border-white/10 group-hover:border-indigo-400/50 transition-colors shrink-0"
            />
            <span className="font-medium">{AUTHOR_NAME}</span>
          </a>
          <div className="inline-flex items-center gap-1 shrink-0">
            <a
              href={GITHUB_URL}
              target="_blank"
              rel="noreferrer"
              className="p-1 rounded-md text-slate-500 hover:text-white hover:bg-white/5 transition-colors"
              aria-label="GitHub"
            >
              <Github size={14} />
            </a>
            <a
              href={LINKEDIN_URL}
              target="_blank"
              rel="noreferrer"
              className="p-1 rounded-md text-slate-500 hover:text-white hover:bg-white/5 transition-colors"
              aria-label="LinkedIn"
            >
              <Linkedin size={14} />
            </a>
          </div>
          <span className="text-white/20 shrink-0">·</span>
          <span className="inline-flex items-center gap-1 text-slate-600 shrink-0">
            <Heart size={10} className="text-rose-500/80 fill-rose-500/80 shrink-0" aria-hidden />
            by {AUTHOR_NAME}
          </span>
        </div>
      </div>
    </footer>
  );
}
