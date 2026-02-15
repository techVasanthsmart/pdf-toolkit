import { useState } from "react";
import { useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Scissors,
  FileText,
  Download,
  Check,
  AlertCircle,
  FileArchive,
} from "lucide-react";
import { PDFDocument } from "pdf-lib";
import clsx from "clsx";
import { saveAs } from "file-saver";
import { SEO } from "../components/SEO";
import { getRouteByPath } from "../config/siteRoutes";
import { UploadZone } from "../components/UploadZone";
import {
  MAX_PDF_SIZE_BYTES,
  MAX_PDF_SIZE_LABEL,
  ALLOWED_PDF_TYPES,
} from "../constants";

/**
 * Parse range string "1-3, 5, 7-9" to array of 1-based page indices.
 * Returns { ok: true, indices } or { ok: false, error }.
 */
function parsePageRanges(input, pageCount) {
  if (!input?.trim()) return { ok: false, error: "Enter a page range." };
  const parts = input.split(",").map((s) => s.trim()).filter(Boolean);
  const indices = [];
  for (const part of parts) {
    if (part.includes("-")) {
      const [a, b] = part.split("-").map((s) => parseInt(s.trim(), 10));
      if (Number.isNaN(a) || Number.isNaN(b) || a < 1 || b < 1 || a > pageCount || b > pageCount) {
        return { ok: false, error: `Invalid range "${part}". Use numbers between 1 and ${pageCount}.` };
      }
      const low = Math.min(a, b);
      const high = Math.max(a, b);
      for (let i = low; i <= high; i++) indices.push(i);
    } else {
      const n = parseInt(part, 10);
      if (Number.isNaN(n) || n < 1 || n > pageCount) {
        return { ok: false, error: `Invalid page "${part}". Use numbers between 1 and ${pageCount}.` };
      }
      indices.push(n);
    }
  }
  return { ok: true, indices };
}

export default function Splitter() {
  const location = useLocation();
  const seoProps = getRouteByPath(location.pathname) ?? { path: "/split" };
  const [file, setFile] = useState(null);
  const [mode, setMode] = useState("every"); // "every" | "range"
  const [rangeInput, setRangeInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null); // { type: 'every', urls: [] } | { type: 'range', url }

  const handleSelect = (files) => {
    if (files.length) {
      const f = files[0];
      setFile({ file: f, name: f.name, size: f.size });
      setError(null);
      setResult(null);
    }
  };

  const clearFile = () => {
    setFile(null);
    setResult(null);
    setError(null);
    setRangeInput("");
  };

  const splitPdf = async () => {
    if (!file) return;
    setError(null);
    setResult(null);
    setIsProcessing(true);

    try {
      const bytes = await file.file.arrayBuffer();
      const pdf = await PDFDocument.load(bytes);
      const pageCount = pdf.getPageCount();
      if (pageCount === 0) {
        setError("This PDF has no pages.");
        return;
      }

      if (mode === "every") {
        const urls = [];
        const blobs = [];
        for (let i = 0; i < pageCount; i++) {
          const newPdf = await PDFDocument.create();
          const [copied] = await newPdf.copyPages(pdf, [i]);
          newPdf.addPage(copied);
          const pdfBytes = await newPdf.save();
          const blob = new Blob([pdfBytes], { type: "application/pdf" });
          blobs.push(blob);
          urls.push(URL.createObjectURL(blob));
        }
        setResult({ type: "every", urls, blobs, pageCount });
      } else {
        const parsed = parsePageRanges(rangeInput, pageCount);
        if (!parsed.ok) {
          setError(parsed.error);
          return;
        }
        const indices = parsed.indices;
        const newPdf = await PDFDocument.create();
        const zeroBased = indices.map((i) => i - 1);
        const copied = await newPdf.copyPages(pdf, zeroBased);
        copied.forEach((p) => newPdf.addPage(p));
        const pdfBytes = await newPdf.save();
        const blob = new Blob([pdfBytes], { type: "application/pdf" });
        const url = URL.createObjectURL(blob);
        setResult({ type: "range", url, blob });
      }
    } catch (err) {
      console.error("Split error:", err);
      setError("This file doesn't appear to be a valid PDF.");
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadPage = (index, blob) => {
    const base = file?.name?.replace(/\.pdf$/i, "") || "document";
    saveAs(blob, `${base}-page-${index + 1}.pdf`);
  };

  const downloadAllAsZip = async () => {
    if (!result?.blobs?.length) return;
    try {
      const JSZip = (await import("jszip")).default;
      const zip = new JSZip();
      const base = file?.name?.replace(/\.pdf$/i, "") || "document";
      result.blobs.forEach((blob, i) => {
        zip.file(`${base}-page-${i + 1}.pdf`, blob);
      });
      const zipBlob = await zip.generateAsync({ type: "blob" });
      saveAs(zipBlob, `${base}-split-pages.zip`);
    } catch (e) {
      setError("Could not create ZIP. Try downloading pages individually.");
    }
  };

  return (
    <>
      <SEO {...seoProps} />
      <div className="max-w-4xl mx-auto px-4 pb-20 pt-10">
        <header className="mb-12 text-center relative">
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-20 h-20 mx-auto bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl flex items-center justify-center mb-6 shadow-2xl shadow-indigo-500/30 rotate-3"
          >
            <Scissors size={40} className="text-white" />
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-200 via-white to-indigo-200 mb-4"
          >
            Split PDF
          </motion.h1>
          <p className="text-slate-400 text-lg max-w-lg mx-auto leading-relaxed">
            Upload one PDF and split by every page or by custom ranges (e.g. 1-3, 5, 7). Max {MAX_PDF_SIZE_LABEL}.
          </p>
        </header>

        {!file ? (
          <UploadZone
            accept=".pdf"
            multiple={false}
            onSelect={handleSelect}
            maxSize={MAX_PDF_SIZE_BYTES}
            allowedTypes={ALLOWED_PDF_TYPES}
            sizeLabel={MAX_PDF_SIZE_LABEL}
            title="Drop PDF here"
            subtitle="or click to browse (one file, max 100 MB)"
          />
        ) : (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="space-y-6"
          >
            <div className="backdrop-blur-xl border border-white/8 rounded-3xl p-6 bg-black/20">
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                    <FileText size={24} />
                  </div>
                  <div>
                    <p className="font-semibold text-white">{file.name}</p>
                    <p className="text-sm text-slate-500">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <button
                  onClick={clearFile}
                  className="text-sm text-red-400 hover:text-red-300 hover:bg-red-400/10 px-3 py-2 rounded-lg transition-colors"
                >
                  Remove file
                </button>
              </div>

              <div className="mt-6 flex flex-wrap gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="mode"
                    checked={mode === "every"}
                    onChange={() => setMode("every")}
                    className="rounded-full border-white/20 text-indigo-500"
                  />
                  <span className="text-slate-300">Split every page</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="mode"
                    checked={mode === "range"}
                    onChange={() => setMode("range")}
                    className="rounded-full border-white/20 text-indigo-500"
                  />
                  <span className="text-slate-300">Custom range</span>
                </label>
              </div>

              {mode === "range" && (
                <div className="mt-4">
                  <label className="block text-sm text-slate-400 mb-2">
                    Page range (e.g. 1-3, 5, 7-9)
                  </label>
                  <input
                    type="text"
                    value={rangeInput}
                    onChange={(e) => {
                      setRangeInput(e.target.value);
                      setError(null);
                    }}
                    placeholder="1-3, 5, 7"
                    className="w-full md:max-w-sm px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
                  />
                </div>
              )}

              {error && (
                <p className="mt-4 flex items-center gap-2 text-sm text-red-400" role="alert">
                  <AlertCircle size={16} />
                  {error}
                </p>
              )}

              <div className="mt-6 flex items-center gap-4">
                <button
                  onClick={splitPdf}
                  disabled={isProcessing || (mode === "range" && !rangeInput.trim())}
                  className={clsx(
                    "px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all",
                    isProcessing || (mode === "range" && !rangeInput.trim())
                      ? "bg-white/5 text-slate-500 cursor-not-allowed"
                      : "bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:shadow-lg hover:shadow-indigo-500/20",
                  )}
                >
                  {isProcessing ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Splitting...
                    </>
                  ) : (
                    <>
                      <Scissors size={18} />
                      Split PDF
                    </>
                  )}
                </button>
              </div>
            </div>

            <AnimatePresence>
              {result && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/20"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-full bg-emerald-500 flex items-center justify-center text-white">
                      <Check size={24} />
                    </div>
                    <div>
                      <h4 className="font-bold text-emerald-400 text-lg">Done</h4>
                      <p className="text-emerald-200/60 text-sm">
                        {result.type === "every"
                          ? `${result.pageCount} PDFs created. Download below or as ZIP.`
                          : "Your PDF is ready."}
                      </p>
                    </div>
                  </div>
                  {result.type === "every" && (
                    <div className="flex flex-wrap gap-3">
                      {result.urls.map((url, i) => (
                        <button
                          key={i}
                          onClick={() => downloadPage(i, result.blobs[i])}
                          className="px-4 py-2 rounded-lg bg-white/10 text-white text-sm font-medium hover:bg-white/20 flex items-center gap-2"
                        >
                          <Download size={14} />
                          Page {i + 1}
                        </button>
                      ))}
                      {result.blobs?.length > 0 && (
                        <button
                          onClick={downloadAllAsZip}
                          className="px-4 py-2 rounded-lg bg-indigo-500/20 text-indigo-300 text-sm font-medium hover:bg-indigo-500/30 flex items-center gap-2"
                        >
                          <FileArchive size={14} />
                          Download all as ZIP
                        </button>
                      )}
                    </div>
                  )}
                  {result.type === "range" && (
                    <a
                      href={result.url}
                      download={`${file?.name?.replace(/\.pdf$/i, "") || "document"}-extract.pdf`}
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-500 text-white font-bold hover:bg-emerald-400 transition-colors"
                    >
                      <Download size={18} />
                      Download PDF
                    </a>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </>
  );
}
