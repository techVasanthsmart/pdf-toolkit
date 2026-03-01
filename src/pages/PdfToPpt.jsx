import { useState, useRef } from "react";
import { useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Presentation,
  Download,
  Check,
  AlertCircle,
  FileText,
  X,
} from "lucide-react";
import * as pdfjsLib from "pdfjs-dist";
import PptxGenJS from "pptxgenjs";
import { SEO } from "../components/SEO";
import { getRouteByPath } from "../config/siteRoutes";
import { UploadZone } from "../components/UploadZone";
import {
  MAX_PDF_SIZE_BYTES,
  MAX_PDF_SIZE_LABEL,
  ALLOWED_PDF_TYPES,
} from "../constants";

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).toString();

/** Render a single PDF page to a canvas and return a base64 JPEG data URL. */
async function renderPageToDataUrl(pdfDoc, pageNum, scale = 2) {
  const page = await pdfDoc.getPage(pageNum);
  const viewport = page.getViewport({ scale });
  const canvas = document.createElement("canvas");
  canvas.width = viewport.width;
  canvas.height = viewport.height;
  const ctx = canvas.getContext("2d");

  // Fill with white background first — PDFs without an explicit background
  // produce transparent canvases, which render as blank slides in PowerPoint.
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  await page.render({ canvasContext: ctx, viewport }).promise;
  return canvas.toDataURL("image/jpeg", 0.95);
}

export default function PdfToPpt() {
  const location = useLocation();
  const seoProps = getRouteByPath(location.pathname) ?? { path: "/pdf-to-ppt" };

  const [pdfFile, setPdfFile] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [error, setError] = useState(null);
  const [done, setDone] = useState(false);
  const [scale, setScale] = useState("2");
  const abortRef = useRef(false);

  const handleSelect = (files) => {
    if (!files || files.length === 0) return;
    setError(null);
    setDone(false);
    setPdfFile(files[0]);
    setProgress({ current: 0, total: 0 });
  };

  const clearFile = () => {
    setPdfFile(null);
    setDone(false);
    setError(null);
    setProgress({ current: 0, total: 0 });
  };

  const convert = async () => {
    if (!pdfFile) return;
    setError(null);
    setDone(false);
    setIsProcessing(true);
    abortRef.current = false;
    setProgress({ current: 0, total: 0 });

    try {
      const arrayBuffer = await pdfFile.arrayBuffer();
      const pdfDoc = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      const numPages = pdfDoc.numPages;
      setProgress({ current: 0, total: numPages });

      // Determine slide dimensions from the first page
      const firstPage = await pdfDoc.getPage(1);
      const firstViewport = firstPage.getViewport({ scale: 1 });
      const aspectRatio = firstViewport.width / firstViewport.height;

      // Standard pptx slide width is 10 inches; derive height to preserve aspect ratio
      const slideWidth = 10;
      const slideHeight = parseFloat((slideWidth / aspectRatio).toFixed(4));

      const pptx = new PptxGenJS();
      pptx.defineLayout({ name: "CUSTOM", width: slideWidth, height: slideHeight });
      pptx.layout = "CUSTOM";

      const renderScale = parseFloat(scale);

      for (let i = 1; i <= numPages; i++) {
        if (abortRef.current) break;
        const dataUrl = await renderPageToDataUrl(pdfDoc, i, renderScale);
        const slide = pptx.addSlide();
        slide.addImage({
          data: dataUrl,
          x: 0,
          y: 0,
          w: slideWidth,
          h: slideHeight,
        });
        setProgress({ current: i, total: numPages });
      }

      if (!abortRef.current) {
        const stem = pdfFile.name.replace(/\.pdf$/i, "");
        await pptx.writeFile({ fileName: `${stem}.pptx` });
        setDone(true);
      }
    } catch (err) {
      console.error("PDF to PPT error:", err);
      setError("Conversion failed. Please make sure the file is a valid PDF.");
    } finally {
      setIsProcessing(false);
    }
  };

  const progressPercent =
    progress.total > 0 ? Math.round((progress.current / progress.total) * 100) : 0;

  return (
    <>
      <SEO {...seoProps} />
      <div className="max-w-4xl mx-auto px-4 pb-20 pt-10">
        {/* Header */}
        <header className="mb-12 text-center relative">
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-20 h-20 mx-auto bg-gradient-to-br from-rose-500 to-pink-600 rounded-3xl flex items-center justify-center mb-6 shadow-2xl shadow-rose-500/30 rotate-3"
          >
            <Presentation size={40} className="text-white" />
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-rose-200 via-white to-pink-200 mb-4"
          >
            PDF to PowerPoint
          </motion.h1>
          <p className="text-slate-400 text-lg max-w-lg mx-auto leading-relaxed">
            Convert every page of a PDF into a PowerPoint slide. Max{" "}
            {MAX_PDF_SIZE_LABEL}. Fully client-side — no upload.
          </p>
        </header>

        {/* Upload zone */}
        {!pdfFile && (
          <UploadZone
            accept="application/pdf"
            multiple={false}
            onSelect={handleSelect}
            maxSize={MAX_PDF_SIZE_BYTES}
            maxCount={1}
            allowedTypes={ALLOWED_PDF_TYPES}
            sizeLabel={MAX_PDF_SIZE_LABEL}
            title="Drop your PDF here"
            subtitle="or click to browse (single PDF file)"
          />
        )}

        <AnimatePresence>
          {pdfFile && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-8 space-y-6"
            >
              {/* File card */}
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/10">
                <div className="w-12 h-12 rounded-xl bg-rose-500/20 flex items-center justify-center text-rose-400 shrink-0">
                  <FileText size={24} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-slate-200 truncate">
                    {pdfFile.name}
                  </p>
                  <p className="text-xs text-slate-500">
                    {(pdfFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
                <button
                  type="button"
                  onClick={clearFile}
                  disabled={isProcessing}
                  className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Quality selector */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-3 text-slate-300 text-sm w-full bg-white/5 p-4 rounded-2xl border border-white/10">
                  <label htmlFor="quality-select" className="font-medium whitespace-nowrap">
                    Render quality:
                  </label>
                  <div className="relative w-full">
                    <select
                      id="quality-select"
                      value={scale}
                      onChange={(e) => setScale(e.target.value)}
                      disabled={isProcessing}
                      className="w-full bg-slate-900/60 border border-white/10 rounded-xl pl-4 pr-10 py-2.5 text-white focus:border-rose-500 focus:ring-1 focus:ring-rose-500 outline-none transition-colors disabled:opacity-50 cursor-pointer appearance-none"
                    >
                      <option value="1" className="bg-slate-900 text-white">Low (1×) — Faster</option>
                      <option value="2" className="bg-slate-900 text-white">Medium (2×) — Recommended</option>
                      <option value="3" className="bg-slate-900 text-white">High (3×) — Better quality</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-400">
                      <svg className="h-4 w-4 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                        <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              {/* Progress bar */}
              <AnimatePresence>
                {isProcessing && (
                  <motion.div
                    key="progress"
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="space-y-2"
                  >
                    <div className="flex justify-between text-sm text-slate-400">
                      <span>
                        {progress.total === 0
                          ? "Loading PDF…"
                          : `Converting page ${progress.current} of ${progress.total}`}
                      </span>
                      <span>{progressPercent}%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-white/5 overflow-hidden">
                      <motion.div
                        className="h-full rounded-full bg-gradient-to-r from-rose-500 to-pink-500"
                        animate={{ width: `${progressPercent}%` }}
                        transition={{ ease: "linear", duration: 0.3 }}
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Error */}
              {error && (
                <p
                  className="flex items-center gap-2 text-sm text-red-400"
                  role="alert"
                >
                  <AlertCircle size={16} />
                  {error}
                </p>
              )}

              {/* Convert button */}
              <button
                onClick={convert}
                disabled={isProcessing}
                className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-3 transition-all ${
                  isProcessing
                    ? "bg-white/5 text-slate-500 cursor-not-allowed"
                    : "bg-gradient-to-r from-rose-600 to-pink-600 text-white shadow-lg shadow-rose-500/20 hover:shadow-rose-500/40 hover:-translate-y-1"
                }`}
              >
                {isProcessing ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Converting…
                  </>
                ) : (
                  <>
                    <Download size={20} />
                    Convert to PowerPoint
                  </>
                )}
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Success banner */}
        <AnimatePresence>
          {done && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-8 p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-4"
            >
              <div className="w-12 h-12 rounded-full bg-emerald-500 flex items-center justify-center text-white shrink-0">
                <Check size={24} />
              </div>
              <div>
                <h4 className="font-bold text-emerald-400 text-lg">
                  Conversion complete!
                </h4>
                <p className="text-emerald-200/60 text-sm">
                  Your .pptx file has been downloaded. Open it in PowerPoint or
                  LibreOffice Impress.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* How it works */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-16 grid sm:grid-cols-3 gap-6"
        >
          {[
            {
              step: "1",
              title: "Upload PDF",
              desc: "Select any PDF file up to 100 MB.",
              color: "rose",
            },
            {
              step: "2",
              title: "Convert",
              desc: "Each page is rendered in-browser and packed into a slide.",
              color: "pink",
            },
            {
              step: "3",
              title: "Download .pptx",
              desc: "Open in PowerPoint or Google Slides instantly.",
              color: "fuchsia",
            },
          ].map(({ step, title, desc, color }) => (
            <div
              key={step}
              className="p-6 rounded-2xl bg-white/5 border border-white/8 text-center"
            >
              <div
                className={`w-10 h-10 mx-auto rounded-full bg-${color}-500/20 text-${color}-400 flex items-center justify-center font-black text-lg mb-3`}
              >
                {step}
              </div>
              <h3 className="font-bold text-white mb-1">{title}</h3>
              <p className="text-slate-400 text-sm">{desc}</p>
            </div>
          ))}
        </motion.section>
      </div>
    </>
  );
}
