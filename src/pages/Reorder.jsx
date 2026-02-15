import { useState } from "react";
import { useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ListOrdered,
  FileText,
  Download,
  Check,
  AlertCircle,
  Move,
  X,
} from "lucide-react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
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

export default function Reorder() {
  const location = useLocation();
  const seoProps = getRouteByPath(location.pathname) ?? { path: "/reorder" };
  const [file, setFile] = useState(null);
  const [pageIndices, setPageIndices] = useState([]); // zero-based, in display order
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [resultUrl, setResultUrl] = useState(null);

  const handleSelect = (files) => {
    if (files.length) {
      setError(null);
      setResultUrl(null);
      loadPdf(files[0]);
    }
  };

  const loadPdf = async (fileObj) => {
    setFile(null);
    setPageIndices([]);
    setError(null);
    setResultUrl(null);

    try {
      const bytes = await fileObj.arrayBuffer();
      const pdf = await PDFDocument.load(bytes);
      const count = pdf.getPageCount();
      if (count === 0) {
        setError("This PDF has no pages.");
        return;
      }
      setFile({
        file: fileObj,
        name: fileObj.name,
        arrayBuffer: bytes,
        pageCount: count,
      });
      setPageIndices(Array.from({ length: count }, (_, i) => i));
    } catch (err) {
      console.error("Load PDF error:", err);
      setError("This file doesn't appear to be a valid PDF.");
    }
  };

  const clearFile = () => {
    if (resultUrl) URL.revokeObjectURL(resultUrl);
    setFile(null);
    setPageIndices([]);
    setResultUrl(null);
    setError(null);
  };

  const removePage = (listIndex) => {
    setPageIndices((prev) => prev.filter((_, i) => i !== listIndex));
    setResultUrl(null);
  };

  const onDragEnd = (result) => {
    if (!result.destination) return;
    const items = Array.from(pageIndices);
    const [removed] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, removed);
    setPageIndices(items);
    setResultUrl(null);
  };

  const applyAndDownload = async () => {
    if (!file || pageIndices.length === 0) return;
    setError(null);
    setResultUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
    setIsProcessing(true);

    try {
      const pdf = await PDFDocument.load(file.arrayBuffer);
      const newPdf = await PDFDocument.create();
      const copied = await newPdf.copyPages(pdf, pageIndices);
      copied.forEach((p) => newPdf.addPage(p));
      const pdfBytes = await newPdf.save();
      const blob = new Blob([pdfBytes], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      setResultUrl(url);
      saveAs(blob, `${file.name.replace(/\.pdf$/i, "")}-reordered.pdf`);
    } catch (err) {
      console.error("Reorder error:", err);
      setError("Failed to reorder PDF. Please try again.");
    } finally {
      setIsProcessing(false);
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
            <ListOrdered size={40} className="text-white" />
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-200 via-white to-indigo-200 mb-4"
          >
            Reorder Pages
          </motion.h1>
          <p className="text-slate-400 text-lg max-w-lg mx-auto leading-relaxed">
            Upload one PDF, drag to reorder pages, remove ones you don't need, then download. Max {MAX_PDF_SIZE_LABEL}.
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
            subtitle="or click to browse (one file)"
          />
        ) : (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="space-y-6"
          >
            <div className="backdrop-blur-xl border border-white/8 rounded-3xl p-6 bg-black/20">
              <div className="flex items-center justify-between gap-4 flex-wrap mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                    <FileText size={24} />
                  </div>
                  <div>
                    <p className="font-semibold text-white">{file.name}</p>
                    <p className="text-sm text-slate-500">{file.pageCount} pages</p>
                  </div>
                </div>
                <button
                  onClick={clearFile}
                  className="text-sm text-red-400 hover:text-red-300 hover:bg-red-400/10 px-3 py-2 rounded-lg transition-colors"
                >
                  Remove file
                </button>
              </div>

              {error && (
                <p className="mb-4 flex items-center gap-2 text-sm text-red-400" role="alert">
                  <AlertCircle size={16} />
                  {error}
                </p>
              )}

              <p className="text-slate-400 text-sm mb-4">
                Drag to reorder. Click remove to exclude a page from the output.
              </p>

              <DragDropContext onDragEnd={onDragEnd}>
                <Droppable droppableId="pages">
                  {(provided) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      className="space-y-2 max-h-[400px] overflow-y-auto"
                    >
                      {pageIndices.map((zeroBasedIdx, listIndex) => (
                        <Draggable
                          key={zeroBasedIdx}
                          draggableId={String(zeroBasedIdx)}
                          index={listIndex}
                        >
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              className={clsx(
                                "flex items-center gap-4 p-4 rounded-xl border transition-all select-none backdrop-blur-md",
                                snapshot.isDragging
                                  ? "bg-indigo-600/30 border-indigo-500 shadow-xl z-50 scale-105"
                                  : "bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/10",
                              )}
                              style={provided.draggableProps.style}
                            >
                              <div
                                {...provided.dragHandleProps}
                                className="text-slate-600 hover:text-white cursor-grab active:cursor-grabbing p-1"
                              >
                                <Move size={16} />
                              </div>
                              <div className="w-10 h-10 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400 shrink-0 font-bold text-sm">
                                {zeroBasedIdx + 1}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-sm text-slate-200">
                                  Page {zeroBasedIdx + 1}
                                </p>
                              </div>
                              <button
                                type="button"
                                onClick={() => removePage(listIndex)}
                                className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                                aria-label={`Remove page ${zeroBasedIdx + 1} from list`}
                              >
                                <X size={16} />
                              </button>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>

              {pageIndices.length === 0 ? (
                <p className="mt-4 text-amber-400 text-sm">
                  All pages removed. Add pages back by uploading the file again.
                </p>
              ) : (
                <div className="mt-6">
                  <button
                    onClick={applyAndDownload}
                    disabled={isProcessing}
                    className={clsx(
                      "w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all",
                      isProcessing
                        ? "bg-white/5 text-slate-500 cursor-not-allowed"
                        : "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40 hover:-translate-y-1",
                    )}
                  >
                    {isProcessing ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Applying...
                      </>
                    ) : (
                      <>
                        <Download size={20} />
                        Apply &amp; Download ({pageIndices.length} pages)
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>

            <AnimatePresence>
              {resultUrl && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex flex-col sm:flex-row items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-emerald-500 flex items-center justify-center text-white">
                      <Check size={24} />
                    </div>
                    <div>
                      <h4 className="font-bold text-emerald-400 text-lg">Downloaded</h4>
                      <p className="text-emerald-200/60 text-sm">
                        Your reordered PDF was downloaded. You can download again below if needed.
                      </p>
                    </div>
                  </div>
                  <a
                    href={resultUrl}
                    download={`${file?.name?.replace(/\.pdf$/i, "") || "document"}-reordered.pdf`}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-500 text-white font-bold hover:bg-emerald-400 transition-colors shrink-0"
                  >
                    <Download size={18} />
                    Download again
                  </a>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </>
  );
}
