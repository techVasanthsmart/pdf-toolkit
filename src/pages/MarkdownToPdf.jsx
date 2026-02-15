import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileCode,
  Download,
  Check,
  AlertCircle,
  Info,
  ChevronDown,
  Eye,
  FileEdit,
} from "lucide-react";
import clsx from "clsx";
import { SEO } from "../components/SEO";
import { getRouteByPath } from "../config/siteRoutes";
import { UploadZone } from "../components/UploadZone";
import { markdownToHtml, markdownToFullDocument, PREVIEW_STYLE } from "../markdown/markdownToHtml";
import {
  MAX_MARKDOWN_LENGTH,
  MAX_MARKDOWN_LENGTH_LABEL,
  ALLOWED_MD_TYPES,
  ALLOWED_MD_EXTENSIONS,
} from "../constants";

const PREVIEW_DEBOUNCE_MS = 200;
const SUPPORTED =
  "Paragraphs, headings (h1–h6), **bold**, *italic*, `code`, fenced code blocks, lists, blockquotes, tables (GFM), links.";
const LIMITS = `Max content length ${MAX_MARKDOWN_LENGTH_LABEL}. Best for documents under ~50 pages.`;

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.05 },
  },
  exit: { opacity: 0 },
};

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0 },
};

export default function MarkdownToPdf() {
  const location = useLocation();
  const seoProps = getRouteByPath(location.pathname) ?? { path: "/markdown-to-pdf" };
  const [content, setContent] = useState("");
  const [previewHtml, setPreviewHtml] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [mobileTab, setMobileTab] = useState("edit");
  const [supportsOpen, setSupportsOpen] = useState(false);

  useEffect(() => {
    if (!content.trim()) {
      setPreviewHtml("");
      return;
    }
    const t = setTimeout(() => {
      try {
        setPreviewHtml(markdownToHtml(content.trim()));
      } catch {
        setPreviewHtml("");
      }
    }, PREVIEW_DEBOUNCE_MS);
    return () => clearTimeout(t);
  }, [content]);

  const handleFileSelect = (files) => {
    setError(null);
    setSuccess(false);
    if (files.length) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result ?? "";
        if (text.length > MAX_MARKDOWN_LENGTH) {
          setError(`Content is too long. Max ${MAX_MARKDOWN_LENGTH_LABEL}.`);
          return;
        }
        setContent(text);
      };
      reader.readAsText(files[0]);
    }
  };

  const handleConvert = async () => {
    const trimmed = content.trim();
    if (!trimmed) {
      setError("Enter or upload Markdown.");
      return;
    }
    if (trimmed.length > MAX_MARKDOWN_LENGTH) {
      setError(`Content is too long. Max ${MAX_MARKDOWN_LENGTH_LABEL}.`);
      return;
    }
    setError(null);
    setSuccess(false);
    setIsProcessing(true);

    let overlay = null;
    let iframe = null;

    try {
      const fullDocumentHtml = markdownToFullDocument(trimmed);

      overlay = document.createElement("div");
      overlay.setAttribute("aria-live", "polite");
      overlay.style.cssText =
        "position:fixed;inset:0;z-index:99999;background:rgba(2,6,23,0.9);display:flex;align-items:center;justify-content:center;" +
        "font-family:system-ui,sans-serif;font-size:1.125rem;color:#e2e8f0;";
      overlay.textContent = "Generating PDF…";
      document.body.appendChild(overlay);

      iframe = document.createElement("iframe");
      iframe.setAttribute("data-pdf-capture", "true");
      iframe.style.cssText =
        "position:fixed;left:0;top:0;width:595px;height:100vh;border:0;z-index:99998;visibility:hidden;";
      document.body.appendChild(iframe);

      const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
      if (!iframeDoc) {
        throw new Error("Iframe document not available");
      }
      iframeDoc.open();
      iframeDoc.write(fullDocumentHtml);
      iframeDoc.close();

      await new Promise((resolve) => {
        if (iframe.contentWindow && iframeDoc.readyState !== "complete") {
          iframe.onload = () => resolve();
        } else {
          resolve();
        }
      });
      await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
      await new Promise((r) => setTimeout(r, 150));

      // Use native browser print instead of html2pdf.js
      overlay.textContent = "Preparing print...";
      
      // Listen for beforeprint/afterprint to know when the dialog opens/closes
      const afterPrintCallback = () => {
        document.body.removeChild(iframe);
        document.body.removeChild(overlay);
        setSuccess(true);
      };
      
      iframeDoc.defaultView.addEventListener("afterprint", afterPrintCallback, { once: true });
      
      // Open print dialog — do not remove iframe/overlay here; afterprint will clean up
      iframeDoc.defaultView.print();
    } catch (err) {
      console.error("Markdown to PDF error:", err);
      // Clean up if we threw before or during print
      if (iframe && document.body.contains(iframe)) document.body.removeChild(iframe);
      if (overlay && document.body.contains(overlay)) document.body.removeChild(overlay);
      setError(
        err?.message?.includes("print") || err?.message?.includes("denied")
          ? "Print dialog was blocked or unavailable. Allow popups for this site and try again."
          : "Conversion failed. If the print dialog did not open, try again or use a different browser."
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const hasContent = content.trim().length > 0;

  return (
    <>
      <SEO {...seoProps} />
      <div className="max-w-6xl mx-auto px-4 pb-20 pt-10">
        <motion.header
          className="mb-10 text-center relative"
          variants={itemVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
            className="w-20 h-20 mx-auto bg-linear-to-br from-indigo-500 to-purple-600 rounded-3xl flex items-center justify-center mb-6 shadow-2xl shadow-indigo-500/30 rotate-3 ring-2 ring-white/10"
          >
            <FileCode size={40} className="text-white" />
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-linear-to-r from-indigo-200 via-white to-indigo-200 mb-4"
          >
            Markdown to PDF
          </motion.h1>
          <p className="text-slate-400 text-lg max-w-lg mx-auto leading-relaxed">
            Paste Markdown or upload a .md file. We convert to PDF with a fixed, readable layout.
          </p>
        </motion.header>

        <motion.div
          className="space-y-6"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Two-column: input (left) | preview (right) on lg; stack on small with Edit/Preview tabs */}
          <div className="lg:grid lg:grid-cols-2 lg:gap-6 space-y-6 lg:space-y-0">
            {/* Input column */}
            <motion.div variants={itemVariants} className="min-w-0">
              <div className="backdrop-blur-xl border border-white/10 rounded-3xl p-6 bg-black/20 hover:border-white/15 focus-within:ring-1 focus-within:ring-indigo-500/30 transition-all">
                <div className="mb-4">
                  <UploadZone
                    compact
                    accept=".md,text/markdown,text/plain"
                    multiple={false}
                    onSelect={handleFileSelect}
                    allowedTypes={ALLOWED_MD_TYPES}
                    allowedExtensions={ALLOWED_MD_EXTENSIONS}
                    title="Upload .md"
                    subtitle="Drop .md here or click to upload"
                  />
                </div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Paste or type Markdown
                </label>
                <textarea
                  value={content}
                  onChange={(e) => {
                    setContent(e.target.value);
                    setError(null);
                    setSuccess(false);
                  }}
                  placeholder="# Title\n\nParagraph with **bold** and *italic*.\n\n- List item"
                  maxLength={MAX_MARKDOWN_LENGTH + 1}
                  className="w-full h-64 px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 placeholder-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 outline-none resize-y font-mono text-sm"
                  aria-label="Markdown content"
                />
                <p className="mt-2 text-xs text-slate-500">
                  {content.length.toLocaleString()} / {MAX_MARKDOWN_LENGTH.toLocaleString()} chars
                  (max {MAX_MARKDOWN_LENGTH_LABEL})
                </p>
              </div>
            </motion.div>

            {/* Preview column: hidden on small by default; show via tab or always on lg */}
            <motion.div variants={itemVariants} className="min-w-0">
              {/* Mobile tabs: Edit | Preview */}
              <div className="lg:hidden flex gap-2 mb-3">
                <button
                  type="button"
                  onClick={() => setMobileTab("edit")}
                  className={clsx(
                    "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all",
                    mobileTab === "edit"
                      ? "bg-white/10 text-white border border-white/20"
                      : "bg-white/5 text-slate-400 border border-white/10 hover:bg-white/10",
                  )}
                  aria-pressed={mobileTab === "edit"}
                >
                  <FileEdit size={18} />
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => setMobileTab("preview")}
                  className={clsx(
                    "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all",
                    mobileTab === "preview"
                      ? "bg-white/10 text-white border border-white/20"
                      : "bg-white/5 text-slate-400 border border-white/10 hover:bg-white/10",
                  )}
                  aria-pressed={mobileTab === "preview"}
                >
                  <Eye size={18} />
                  Preview
                </button>
              </div>

              <div
                className={clsx(
                  "lg:block",
                  mobileTab === "preview" ? "block" : "hidden",
                )}
              >
                <div className="backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden bg-black/20 hover:border-white/15 transition-all">
                  <div className="px-4 py-3 border-b border-white/10 flex items-center gap-2">
                    <Eye size={18} className="text-slate-400" />
                    <span className="text-sm font-medium text-slate-300">Preview</span>
                  </div>
                  <div
                    className="min-h-[280px] max-h-[400px] lg:max-h-[520px] overflow-auto bg-slate-50 dark:bg-slate-900/80 p-6"
                    aria-label="Rendered Markdown preview"
                  >
                    {hasContent && previewHtml ? (
                      <>
                        <style>{PREVIEW_STYLE}</style>
                        <div
                          className="md-body text-slate-800"
                          dangerouslySetInnerHTML={{ __html: previewHtml }}
                        />
                      </>
                    ) : (
                      <p className="text-slate-400 text-sm text-center py-12 px-4">
                        Preview will appear here when you paste or type Markdown.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {error && (
            <motion.p
              className="flex items-center gap-2 text-sm text-red-400"
              role="alert"
              variants={itemVariants}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <AlertCircle size={16} />
              {error}
            </motion.p>
          )}

          <motion.div variants={itemVariants}>
            <button
              onClick={handleConvert}
              disabled={isProcessing || !content.trim()}
              className={clsx(
                "w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all duration-200",
                isProcessing || !content.trim()
                  ? "bg-white/5 text-slate-500 cursor-not-allowed"
                  : "bg-linear-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40 hover:-translate-y-0.5 hover:shadow-xl active:translate-y-0",
              )}
            >
              {isProcessing ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Converting...
                </>
              ) : (
                <>
                  <Download size={20} />
                  Convert to PDF
                </>
              )}
            </button>
          </motion.div>

          {/* Collapsible: What's supported? */}
          <motion.div variants={itemVariants}>
            <button
              type="button"
              onClick={() => setSupportsOpen((o) => !o)}
              className="w-full flex items-center justify-between gap-2 p-4 rounded-2xl bg-white/5 border border-white/10 text-left hover:bg-white/10 transition-colors"
              aria-expanded={supportsOpen}
            >
              <span className="flex items-center gap-2 font-semibold text-slate-300">
                <Info size={16} />
                What&apos;s supported?
              </span>
              <ChevronDown
                size={18}
                className={clsx("text-slate-400 transition-transform", supportsOpen && "rotate-180")}
              />
            </button>
            <AnimatePresence>
              {supportsOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="p-4 pt-2 rounded-b-2xl bg-white/5 border border-t-0 border-white/10 text-sm text-slate-400">
                    <p className="font-semibold text-slate-300 mb-1">Supports</p>
                    <p className="mb-3">{SUPPORTED}</p>
                    <p className="font-semibold text-slate-300 mb-1">Limits</p>
                    <p>{LIMITS}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>

        <AnimatePresence>
          {success && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="mt-8 p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-3"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.1, type: "spring", stiffness: 400, damping: 15 }}
                className="w-12 h-12 rounded-full bg-emerald-500 flex items-center justify-center text-white"
              >
                <Check size={24} />
              </motion.div>
              <div>
                <h4 className="font-bold text-emerald-400 text-lg">PDF downloaded</h4>
                <p className="text-emerald-200/60 text-sm">Check your downloads folder.</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
