import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  motion,
  AnimatePresence,
  useMotionTemplate,
  useMotionValue,
  useSpring,
} from "framer-motion";
import {
  Merge,
  ArrowRight,
  Github,
  Zap,
  Shield,
  Star,
  Scissors,
  ListOrdered,
  Image as ImageIcon,
  FileCode,
  Bookmark,
} from "lucide-react";
import { SEO } from "../components/SEO";
import { getRouteByPath } from "../config/siteRoutes";

const FeatureCard = ({ to, icon: Icon, title, desc, color }) => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseX = useSpring(x, { stiffness: 500, damping: 100 });
  const mouseY = useSpring(y, { stiffness: 500, damping: 100 });

  function onMouseMove({ currentTarget, clientX, clientY }) {
    const { left, top } = currentTarget.getBoundingClientRect();
    x.set(clientX - left);
    y.set(clientY - top);
  }

  const maskImage = useMotionTemplate`radial-gradient(240px at ${mouseX}px ${mouseY}px, white, transparent)`;
  const style = { maskImage, WebkitMaskImage: maskImage };

  return (
    <Link to={to} className="group relative block h-full">
      <div
        onMouseMove={onMouseMove}
        className="relative h-full overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-8 transition-colors hover:bg-white/10 group-hover:border-white/20"
      >
        {/* Glow Effect */}
        <motion.div
          className="pointer-events-none absolute -inset-px opacity-0 transition duration-300 group-hover:opacity-100"
          style={style}
        >
          <div
            className={`absolute inset-0 bg-gradient-to-br ${color} opacity-20`}
          />
        </motion.div>

        <div className="relative z-10 flex flex-col h-full">
          <div
            className={`mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-white/5 border border-white/10 shadow-inner group-hover:scale-110 transition-transform duration-500`}
          >
            <Icon size={28} className="text-white" />
          </div>

          <h3 className="mb-3 text-2xl font-bold text-white">{title}</h3>
          <p className="mb-6 text-slate-400 leading-relaxed font-light">
            {desc}
          </p>

          <div className="mt-auto flex items-center gap-2 text-sm font-semibold text-white/50 group-hover:text-white transition-colors">
            <span>Launch Tool</span>
            <ArrowRight
              size={16}
              className="transition-transform group-hover:translate-x-1"
            />
          </div>
        </div>
      </div>
    </Link>
  );
};

export default function Home() {
  const location = useLocation();
  const seoProps = getRouteByPath(location.pathname) ?? { path: "/" };
  const [bookmarkMessage, setBookmarkMessage] = useState(null);

  const handleBookmark = async () => {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      const isMac =
        typeof navigator !== "undefined" &&
        navigator.platform?.toUpperCase().includes("MAC");
      setBookmarkMessage(
        isMac
          ? "Link copied! Press Cmd+D to bookmark in your browser."
          : "Link copied! Press Ctrl+D to bookmark in Chrome or your browser.",
      );
    } catch {
      setBookmarkMessage(
        "Press Ctrl+D (or Cmd+D on Mac) to bookmark this page in your browser.",
      );
    }
    setTimeout(() => setBookmarkMessage(null), 4000);
  };

  return (
    <>
      <SEO {...seoProps} />

      <div className="pt-10 pb-20 px-4 md:px-6">
        {/* Hero Section */}
        <section className="relative text-center mb-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900/70 backdrop-blur-md border border-white/10 text-sm font-medium text-indigo-300 mb-8 mx-auto"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
            </span>
            <span>v2.0 Now Available</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", duration: 0.8 }}
            className="text-6xl md:text-8xl font-black mb-8 tracking-tighter"
          >
            <span className="block text-transparent bg-clip-text bg-gradient-to-b from-white to-white/60 pb-2">
              Master Your
            </span>
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">
              PDF Workflow
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-slate-400 max-w-2xl mx-auto mb-6 leading-relaxed font-light"
          >
            Secure, client-side PDF manipulation tools. Merge, convert, and
            organize documents without ever leaving your browser.
          </motion.p>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="text-sm text-slate-500 max-w-xl mx-auto mb-12 flex flex-wrap items-center justify-center gap-x-4 gap-y-1"
          >
            <span className="inline-flex items-center gap-1.5">
              <Shield size={14} className="text-emerald-400" />
              Secure Core — No data leaves your device
            </span>
            <span>·</span>
            <span>No login required</span>
            <span>·</span>
            <span>Free for lifetime</span>
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-wrap justify-center gap-4"
          >
            <Link
              to="/merge"
              className="group relative px-8 py-4 bg-white text-slate-900 rounded-2xl font-bold text-lg overflow-hidden transition-all hover:scale-105 active:scale-95"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-0 group-hover:opacity-10 transition-opacity" />
              <div className="relative flex items-center gap-2">
                <span>Start Merging</span>
                <ArrowRight
                  size={20}
                  className="group-hover:translate-x-1 transition-transform"
                />
              </div>
            </Link>

            <a
              href="https://github.com/techVasanthsmart/pdf-toolkit"
              target="_blank"
              rel="noreferrer"
              className="px-8 py-4 rounded-2xl bg-slate-900/60 backdrop-blur-xl shadow-md border border-white/10 text-white font-bold text-lg hover:bg-white/10 transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
            >
              <Github size={20} />
              <span>GitHub</span>
            </a>

            <button
              type="button"
              onClick={handleBookmark}
              className="px-6 py-4 rounded-2xl bg-slate-900/60 backdrop-blur-xl border border-white/10 text-slate-300 font-semibold text-base hover:text-white hover:bg-white/10 hover:border-white/20 transition-all hover:scale-105 active:scale-95 flex items-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
              aria-label="Bookmark this site in your browser"
            >
              <Bookmark size={20} />
              <span>Bookmark this site</span>
            </button>
          </motion.div>

          <AnimatePresence>
            {bookmarkMessage && (
              <motion.p
                key="bookmark-msg"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mt-4 text-sm text-emerald-300/90 text-center max-w-md mx-auto"
              >
                {bookmarkMessage}
              </motion.p>
            )}
          </AnimatePresence>
        </section>

        {/* Tools Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-32 max-w-6xl mx-auto">
          <FeatureCard
            to="/merge"
            icon={Merge}
            title="Fusion Core"
            desc="Drag, drop, and merge multiple PDF documents into a single, organized file instantly."
            color="from-indigo-500 to-blue-500"
          />
          <FeatureCard
            to="/split"
            icon={Scissors}
            title="Split PDF"
            desc="Split one PDF by every page or by custom page ranges (e.g. 1-3, 5, 7)."
            color="from-purple-500 to-pink-500"
          />
          <FeatureCard
            to="/reorder"
            icon={ListOrdered}
            title="Reorder Pages"
            desc="Reorder or remove pages from a PDF, then download the result."
            color="from-cyan-500 to-blue-500"
          />
          <FeatureCard
            to="/images-to-pdf"
            icon={ImageIcon}
            title="Images to PDF"
            desc="Convert one or many images (JPEG, PNG, WebP) into a single PDF."
            color="from-amber-500 to-orange-500"
          />
          <FeatureCard
            to="/markdown-to-pdf"
            icon={FileCode}
            title="Markdown to PDF"
            desc="Paste or upload Markdown and convert to a clean, readable PDF."
            color="from-emerald-500 to-teal-500"
          />
        </div>

        {/* Stats / Trust */}
        <section className="border-t border-white/10 pt-20 max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-8 rounded-3xl bg-white/5 border border-white/5 text-center hover:bg-white/10 transition-colors">
              <div className="w-12 h-12 mx-auto rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 mb-4 font-bold">
                <Shield size={24} />
              </div>
              <h3 className="text-xl font-bold mb-2">100% Secure</h3>
              <p className="text-slate-400 text-sm">
                No servers. No uploads. Your files never leave your device.
              </p>
            </div>

            <div className="p-8 rounded-3xl bg-white/5 border border-white/5 text-center hover:bg-white/10 transition-colors">
              <div className="w-12 h-12 mx-auto rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 mb-4">
                <Zap size={24} />
              </div>
              <h3 className="text-xl font-bold mb-2">Blazing Fast</h3>
              <p className="text-slate-400 text-sm">
                Powered by WebAssembly for native-like performance in browser.
              </p>
            </div>

            <div className="p-8 rounded-3xl bg-white/5 border border-white/5 text-center hover:bg-white/10 transition-colors">
              <div className="w-12 h-12 mx-auto rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400 mb-4">
                <Star size={24} />
              </div>
              <h3 className="text-xl font-bold mb-2">Forever Free</h3>
              <p className="text-slate-400 text-sm">
                Open source project. No hidden fees, watermarks, or limits.
              </p>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
