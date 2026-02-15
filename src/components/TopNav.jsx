import { useState, useEffect } from "react";
import { NavLink, Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Merge,
  Menu,
  X,
  Shield,
  Github,
  Linkedin,
  Zap,
  Box,
  Scissors,
  ListOrdered,
  Image as ImageIcon,
  FileCode,
} from "lucide-react";
import clsx from "clsx";

const GITHUB_URL = "https://github.com/techVasanthsmart";
const LINKEDIN_URL = "https://www.linkedin.com/in/vasanthkumar-s-0995a5185/";
const PROFILE_IMAGE = "/svk.png";

const navItems = [
  { path: "/", name: "Dashboard", icon: Box },
  { path: "/merge", name: "Fusion Core", icon: Merge, desc: "Merge PDFs" },
  { path: "/split", name: "Split PDF", icon: Scissors, desc: "Split by page" },
  { path: "/reorder", name: "Reorder Pages", icon: ListOrdered, desc: "Reorder or remove" },
  { path: "/images-to-pdf", name: "Images to PDF", icon: ImageIcon, desc: "Convert images" },
  { path: "/markdown-to-pdf", name: "Markdown to PDF", icon: FileCode, desc: "Convert .md" },
];

export default function TopNav() {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  const closeMenu = () => setMenuOpen(false);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  return (
    <>
      <header
        className={clsx(
          "sticky top-0 z-50 w-full",
          "bg-slate-900/70 backdrop-blur-xl border-b border-white/10",
          "shadow-[0_4px_24px_-4px_rgba(0,0,0,0.3)]"
        )}
      >
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="flex items-center justify-between h-16 md:h-14">
            {/* Logo / Brand */}
            <Link
              to="/"
              className="flex items-center gap-2.5 text-white font-bold tracking-tight focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 rounded-lg transition-opacity hover:opacity-90"
              aria-label="PDF Toolkit home"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/25">
                <Zap size={18} className="text-white fill-white" />
              </div>
              <span className="text-lg bg-clip-text text-transparent bg-gradient-to-r from-indigo-200 to-purple-200">
                PDF Toolkit
              </span>
            </Link>

            {/* Desktop nav */}
            <nav className="hidden md:flex items-center gap-1" aria-label="Main navigation">
              {navItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    clsx(
                      "relative px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                      "text-slate-400 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900",
                      isActive && "text-white bg-white/10"
                    )
                  }
                >
                  {({ isActive }) => (
                    <>
                      <span className="relative z-10">{item.name}</span>
                      {isActive && (
                        <motion.div
                          layoutId="topnav-active"
                          className="absolute inset-0 rounded-xl bg-indigo-500/20 border border-indigo-400/30"
                          transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
                        />
                      )}
                    </>
                  )}
                </NavLink>
              ))}
            </nav>

            {/* Right: Secure Core pill + social */}
            <div className="hidden md:flex items-center gap-3">
              <span
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-emerald-300 bg-emerald-500/10 border border-emerald-400/20"
                title="Client-side processing. No data leaves your device."
              >
                <Shield size={12} aria-hidden />
                Secure Core
              </span>
              <a
                href={GITHUB_URL}
                target="_blank"
                rel="noreferrer"
                className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 border border-transparent hover:border-white/10 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
                aria-label="GitHub profile"
              >
                <Github size={18} />
              </a>
              <a
                href={LINKEDIN_URL}
                target="_blank"
                rel="noreferrer"
                className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 border border-transparent hover:border-white/10 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
                aria-label="LinkedIn profile"
              >
                <Linkedin size={18} />
              </a>
            </div>

            {/* Mobile: hamburger */}
            <button
              type="button"
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden p-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
              aria-expanded={menuOpen}
              aria-label={menuOpen ? "Close menu" : "Open menu"}
            >
              {menuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile menu overlay */}
      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={closeMenu}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
              aria-hidden
            />
            <motion.div
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ type: "spring", bounce: 0.2, duration: 0.35 }}
              className="fixed top-16 left-4 right-4 z-50 md:hidden rounded-2xl border border-white/10 bg-slate-900/95 backdrop-blur-xl shadow-2xl overflow-hidden"
            >
              <nav className="py-4 px-2" aria-label="Mobile navigation">
                {navItems.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={closeMenu}
                    className={({ isActive }) =>
                      clsx(
                        "flex items-center gap-3 px-4 py-3.5 rounded-xl text-left transition-colors duration-200",
                        isActive
                          ? "bg-white/10 text-white"
                          : "text-slate-400 hover:text-white hover:bg-white/5"
                      )
                    }
                  >
                    <item.icon size={20} className="shrink-0 text-indigo-400" />
                    <div className="flex flex-col min-w-0">
                      <span className="font-semibold text-sm">{item.name}</span>
                      {item.desc && (
                        <span className="text-xs text-slate-500">{item.desc}</span>
                      )}
                    </div>
                  </NavLink>
                ))}
              </nav>
              <div className="border-t border-white/10 p-4 flex items-center justify-between">
                <span className="inline-flex items-center gap-2 text-xs text-emerald-300">
                  <Shield size={14} />
                  Secure Core — No data leaves your device
                </span>
                <div className="flex gap-2">
                  <a
                    href={GITHUB_URL}
                    target="_blank"
                    rel="noreferrer"
                    onClick={closeMenu}
                    className="p-2.5 rounded-full bg-white/5 text-slate-400 hover:text-white transition-colors"
                    aria-label="GitHub"
                  >
                    <Github size={20} />
                  </a>
                  <a
                    href={LINKEDIN_URL}
                    target="_blank"
                    rel="noreferrer"
                    onClick={closeMenu}
                    className="p-2.5 rounded-full bg-white/5 text-slate-400 hover:text-white transition-colors"
                    aria-label="LinkedIn"
                  >
                    <Linkedin size={20} />
                  </a>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
