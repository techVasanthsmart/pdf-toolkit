import { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { flushSync } from "react-dom";
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
  Presentation,
  Maximize2,
  X,
} from "lucide-react";
import { gsap } from "gsap";
import { Flip } from "gsap/Flip";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import Lenis from "lenis";
import { SEO } from "../components/SEO";
import { getRouteByPath } from "../config/siteRoutes";

gsap.registerPlugin(Flip, ScrollTrigger, useGSAP);

const TOOLS = [
  {
    id: "merge",
    to: "/merge",
    icon: Merge,
    title: "Fusion Core",
    desc: "Drag, drop, and merge multiple PDF documents into a single, organized file instantly.",
    color: "from-indigo-500 to-blue-500",
  },
  {
    id: "split",
    to: "/split",
    icon: Scissors,
    title: "Split PDF",
    desc: "Split one PDF by every page or by custom page ranges (e.g. 1-3, 5, 7).",
    color: "from-purple-500 to-pink-500",
  },
  {
    id: "reorder",
    to: "/reorder",
    icon: ListOrdered,
    title: "Reorder Pages",
    desc: "Reorder or remove pages from a PDF, then download the result.",
    color: "from-cyan-500 to-blue-500",
  },
  {
    id: "images-to-pdf",
    to: "/images-to-pdf",
    icon: ImageIcon,
    title: "Images to PDF",
    desc: "Convert one or many images (JPEG, PNG, WebP) into a single PDF.",
    color: "from-amber-500 to-orange-500",
  },
  {
    id: "markdown-to-pdf",
    to: "/markdown-to-pdf",
    icon: FileCode,
    title: "Markdown to PDF",
    desc: "Paste or upload Markdown and convert to a clean, readable PDF.",
    color: "from-emerald-500 to-teal-500",
  },
  {
    id: "pdf-to-ppt",
    to: "/pdf-to-ppt",
    icon: Presentation,
    title: "PDF to PowerPoint",
    desc: "Convert any PDF into a PowerPoint presentation — one slide per page.",
    color: "from-rose-500 to-pink-500",
  },
];

const FeatureCard = ({ id, to, icon: Icon, title, desc, color, isExpanded, onToggle }) => {
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
    <div
      className={`feature-card group overflow-hidden transition-colors ${
        isExpanded
          ? "fixed inset-4 md:inset-x-20 md:inset-y-10 z-50 rounded-[2rem] bg-slate-900 border border-white/20 shadow-2xl shadow-indigo-500/20 p-8 md:p-12"
          : "absolute inset-0 rounded-3xl bg-white/5 border border-white/10 p-8 hover:bg-white/10 group-hover:border-white/20 cursor-pointer"
      }`}
      data-flip-id={`card-${id}`}
      onMouseMove={onMouseMove}
      onClick={!isExpanded ? onToggle : undefined}
    >
      {/* Glow Effect */}
      <motion.div
        className={`pointer-events-none absolute -inset-px transition duration-300 ${
          isExpanded ? "opacity-100" : "opacity-0 group-hover:opacity-100"
        }`}
        style={style}
      >
        <div className={`absolute inset-0 bg-gradient-to-br ${color} opacity-20`} />
      </motion.div>

      <div className="relative z-10 flex flex-col h-full pointer-events-none">
        <div className="flex justify-between items-start mb-6">
          <div
            className={`inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-white/5 border border-white/10 shadow-inner transition-transform duration-500 ${isExpanded ? '' : 'group-hover:scale-110'}`}
          >
            <Icon size={28} className="text-white" />
          </div>

          <button
            onClick={(e) => {
              if (isExpanded) {
                e.stopPropagation();
                onToggle(e);
              }
            }}
            className={`pointer-events-auto p-3 rounded-full bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/20 transition-all z-20 ${isExpanded ? 'scale-110' : 'group-hover:scale-110'}`}
            aria-label={isExpanded ? "Close widget" : "Expand widget"}
          >
            {isExpanded ? <X size={20} /> : <Maximize2 size={20} />}
          </button>
        </div>

        <h3 className={`font-bold text-white transition-all duration-300 ${isExpanded ? 'text-4xl md:text-5xl mb-4 mt-4' : 'text-2xl mb-3'}`}>
          {title}
        </h3>
        <p className={`text-slate-400 font-light transition-all duration-300 ${isExpanded ? 'text-xl max-w-3xl mb-10 leading-relaxed' : 'text-sm leading-relaxed mb-6'}`}>
          {desc}
        </p>

        {isExpanded && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="pointer-events-auto flex-1 rounded-2xl bg-slate-950/50 border border-white/5 p-8 flex flex-col items-center justify-center text-slate-500 mb-8 min-h-[200px]"
          >
            <Icon size={64} className="mx-auto mb-6 opacity-20 text-white" />
            <h4 className="text-xl font-medium text-slate-300 mb-2">{title} Dashboard</h4>
            <p className="text-center max-w-md">Quick preview or live status for this tool could be placed here.</p>
          </motion.div>
        )}

        <div className={`pointer-events-auto ${isExpanded ? '' : 'mt-auto'}`}>
          <Link
            to={to}
            onClick={(e) => e.stopPropagation()}
            className={`flex items-center gap-2 font-semibold transition-colors ${
              isExpanded
                ? "justify-center px-8 py-4 rounded-xl bg-white text-slate-900 hover:bg-slate-200 text-lg w-full sm:w-auto inline-flex"
                : "text-sm text-white/50 group-hover:text-white"
            }`}
          >
            <span>Launch {isExpanded ? title : 'Tool'}</span>
            <ArrowRight
              size={isExpanded ? 20 : 16}
              className="transition-transform group-hover:translate-x-1"
            />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default function Home() {
  const location = useLocation();
  const seoProps = getRouteByPath(location.pathname) ?? { path: "/" };
  const [bookmarkMessage, setBookmarkMessage] = useState(null);
  const [expandedId, setExpandedId] = useState(null);
  
  const containerRef = useRef(null);

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      direction: 'vertical',
      gestureDirection: 'vertical',
      smooth: true,
      mouseMultiplier: 1,
      smoothTouch: false,
      touchMultiplier: 2,
      infinite: false,
    });

    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => {
      lenis.raf(time * 1000);
    });
    gsap.ticker.lagSmoothing(0);

    return () => {
      lenis.destroy();
      gsap.ticker.remove(lenis.raf);
    };
  }, []);

  useGSAP(() => {
    const tl = gsap.timeline();
    tl.fromTo(".hero-char", { y: 50, opacity: 0 }, {
      y: 0,
      opacity: 1,
      duration: 0.8,
      stagger: 0.1,
      ease: "back.out(1.7)",
      delay: 0.2
    })
    .fromTo(".hero-img-container", 
      { scale: 1.2, opacity: 0 },
      { scale: 1, opacity: 1, duration: 0.8, ease: "power2.out" },
      "-=0.4"
    );

    gsap.from(".feature-card", {
      scrollTrigger: {
        trigger: ".tools-grid",
        start: "top 80%",
        toggleActions: "play reverse play reverse",
      },
      y: 50,
      opacity: 0,
      stagger: 0.1,
      duration: 0.6,
      ease: "power2.out"
    });

    ScrollTrigger.create({
      trigger: ".pinned-section",
      start: "top top",
      end: "bottom bottom",
      pin: ".media-container"
    });

    const textMarkers = gsap.utils.toArray(".text-marker");
    textMarkers.forEach((marker, i) => {
      ScrollTrigger.create({
        trigger: marker,
        start: "top center",
        end: "bottom center",
        onEnter: () => gsap.to(`.feature-img-${i + 1}`, { opacity: 1, duration: 0.5, zIndex: 10 }),
        onLeaveBack: () => gsap.to(`.feature-img-${i + 1}`, { opacity: 0, duration: 0.5, zIndex: 0 }),
        onEnterBack: () => gsap.to(`.feature-img-${i + 1}`, { opacity: 1, duration: 0.5, zIndex: 10 }),
        onLeave: () => { if(i < textMarkers.length - 1) gsap.to(`.feature-img-${i + 1}`, { opacity: 0, duration: 0.5, zIndex: 0 }) }
      });
    });
  }, { scope: containerRef });

  const splitTextToWords = (text) => text.split(" ").map((word, wordIdx) => (
    <span key={wordIdx} className="inline-block whitespace-nowrap mr-4">
      {word.split("").map((char, charIdx) => (
        <span key={charIdx} className="inline-block hero-char opacity-0 bg-transparent text-white font-black" style={{ backgroundImage: "inherit", WebkitTextFillColor: "inherit", WebkitBackgroundClip: "inherit" }}>
          {char === " " ? "\u00A0" : char}
        </span>
      ))}
    </span>
  ));

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

  const toggleExpand = (id, e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    // Capture the current state of all cards before DOM update
    const state = Flip.getState(".feature-card");

    // Force React to flush updates to the DOM synchronously
    flushSync(() => {
      setExpandedId(expandedId === id ? null : id);
    });

    // Run the Flip animation from the captured state
    Flip.from(state, {
      duration: 0.6,
      ease: "power3.inOut",
      absolute: true,
      zIndex: 50,
      nested: true,
    });
  };

  return (
    <div ref={containerRef}>
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

          <h1 className="text-6xl md:text-8xl font-black mb-8 tracking-tighter">
            <span className="flex flex-wrap justify-center text-transparent bg-clip-text bg-gradient-to-b from-white to-white/60 pb-2">
              {splitTextToWords("Master Your")}
            </span>
            <span className="flex flex-wrap justify-center text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">
              {splitTextToWords("PDF Workflow")}
            </span>
          </h1>
          <div className="hero-img-container flex justify-center mt-12 mb-16">
            <div className="relative w-48 h-48 sm:w-64 sm:h-64 rounded-full bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 shadow-[0_0_100px_rgba(139,92,246,0.5)] flex items-center justify-center p-1">
               <div className="absolute inset-1 rounded-full bg-slate-900 flex items-center justify-center">
                 <Merge size={80} className="text-white opacity-80" />
               </div>
            </div>
          </div>

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
        <div className="tools-grid grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-32 max-w-6xl mx-auto relative z-20">
          {TOOLS.map((tool) => (
            <div key={tool.id} className="relative w-full h-[320px] sm:h-[300px]">
              <FeatureCard
                {...tool}
                isExpanded={expandedId === tool.id}
                onToggle={(e) => toggleExpand(tool.id, e)}
              />
            </div>
          ))}

          {/* Overlay background when any card is expanded */}
          <AnimatePresence>
            {expandedId && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
                className="fixed inset-0 z-40 bg-slate-950/80 backdrop-blur-md pointer-events-auto"
                onClick={(e) => toggleExpand(expandedId, e)}
              />
            )}
          </AnimatePresence>
        </div>

        {/* Pinned Scroll Section */}
        <section className="pinned-section flex flex-col md:flex-row w-full max-w-6xl mx-auto py-20 md:py-32 relative gap-10">
          <div className="w-full md:w-1/2 relative h-[400px] md:h-[600px] z-10">
            <div className="media-container w-full h-[300px] md:h-[500px] rounded-3xl overflow-hidden bg-slate-900 border border-white/10 relative shadow-2xl">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 z-0"></div>
                <div className="feature-img-1 absolute inset-0 w-full h-full flex flex-col items-center justify-center bg-slate-800 opacity-100 p-8 z-10">
                   <Merge size={120} className="text-indigo-400 mb-6 drop-shadow-lg" />
                   <h3 className="text-2xl font-bold text-white">Merge Engine</h3>
                </div>
                <div className="feature-img-2 absolute inset-0 w-full h-full flex flex-col items-center justify-center bg-slate-800 opacity-0 p-8 z-0">
                   <Scissors size={120} className="text-pink-400 mb-6 drop-shadow-lg" />
                   <h3 className="text-2xl font-bold text-white">Precision Split</h3>
                </div>
                <div className="feature-img-3 absolute inset-0 w-full h-full flex flex-col items-center justify-center bg-slate-800 opacity-0 p-8 z-0">
                   <Zap size={120} className="text-amber-400 mb-6 drop-shadow-lg" />
                   <h3 className="text-2xl font-bold text-white">Instant Output</h3>
                </div>
            </div>
          </div>
          
          <div className="w-full md:w-1/2 flex flex-col font-sans">
             <div className="text-marker md:h-[600px] flex flex-col justify-center py-20">
                 <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white leading-tight">Combine Documents Effortlessly</h2>
                 <p className="text-slate-400 text-lg md:text-xl leading-relaxed">No need to upload your sensitive files anywhere. Combine as many PDFs as you want directly in your browser with our state-of-the-art secure engine.</p>
             </div>
             <div className="text-marker md:h-[600px] flex flex-col justify-center py-20">
                 <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white leading-tight">Extract Just What You Need</h2>
                 <p className="text-slate-400 text-lg md:text-xl leading-relaxed">Need just a few pages? Our split tool lets you define ranges or separate every single page into individual lightweight files securely and instantly.</p>
             </div>
             <div className="text-marker md:h-[600px] flex flex-col justify-center py-20 pb-40">
                 <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white leading-tight">Lightning Fast Processing</h2>
                 <p className="text-slate-400 text-lg md:text-xl leading-relaxed">Experience native-level performance within your web browser. Converting your markdown and managing your documents has never been faster.</p>
             </div>
          </div>
        </section>

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
    </div>
  );
}
