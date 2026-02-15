import { useState } from "react";
import { useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload,
  FileText,
  X,
  Move,
  Merge,
  Download,
  Check,
  AlertCircle,
} from "lucide-react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { PDFDocument } from "pdf-lib";
import clsx from "clsx";
import { SEO } from "../components/SEO";
import { getRouteByPath } from "../config/siteRoutes";

export default function Merger() {
  const location = useLocation();
  const seoProps = getRouteByPath(location.pathname) ?? { path: "/merge" };
  const [files, setFiles] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isMerging, setIsMerging] = useState(false);
  const [mergedPdfUrl, setMergedPdfUrl] = useState(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFiles = Array.from(e.dataTransfer.files).filter(
      (file) => file.type === "application/pdf",
    );
    addFiles(droppedFiles);
  };

  const handleFileInput = (e) => {
    const selectedFiles = Array.from(e.target.files).filter(
      (file) => file.type === "application/pdf",
    );
    addFiles(selectedFiles);
  };

  const addFiles = (newFiles) => {
    if (newFiles.length === 0) return;

    // Add audio feedback if desired (optional)

    const fileObjects = newFiles.map((file) => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      name: file.name,
      size: (file.size / 1024 / 1024).toFixed(2) + " MB",
    }));
    setFiles((prev) => [...prev, ...fileObjects]);
    setMergedPdfUrl(null);
  };

  const removeFile = (id) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
    setMergedPdfUrl(null);
  };

  const onDragEnd = (result) => {
    if (!result.destination) return;
    const items = Array.from(files);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    setFiles(items);
  };

  const mergePDFs = async () => {
    if (files.length < 2) return;
    setIsMerging(true);

    try {
      const mergedPdf = await PDFDocument.create();

      for (const fileObj of files) {
        const fileBytes = await fileObj.file.arrayBuffer();
        const pdf = await PDFDocument.load(fileBytes);
        const copiedPages = await mergedPdf.copyPages(
          pdf,
          pdf.getPageIndices(),
        );
        copiedPages.forEach((page) => mergedPdf.addPage(page));
      }

      const pdfBytes = await mergedPdf.save();
      const blob = new Blob([pdfBytes], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      setMergedPdfUrl(url);
    } catch (error) {
      console.error("Error merging PDFs:", error);
      alert("Failed to merge PDFs. Please try again.");
    } finally {
      setIsMerging(false);
    }
  };

  return (
    <>
      <SEO {...seoProps} />
      <div className="max-w-4xl mx-auto px-4 pb-20 pt-10">
        {/* Header */}
        <header className="mb-12 text-center relative">
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-20 h-20 mx-auto bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl flex items-center justify-center mb-6 shadow-2xl shadow-indigo-500/30 rotate-3"
          >
            <Merge size={40} className="text-white" />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-200 via-white to-indigo-200 mb-4"
          >
            Fusion Core
          </motion.h1>
          <p className="text-slate-400 text-lg max-w-lg mx-auto leading-relaxed">
            Drag and drop multiple PDFs to combine them into a single, organized
            document.
          </p>
        </header>

        {/* Upload Area */}
        <motion.div
          className={clsx(
            "upload-zone relative group overflow-hidden rounded-3xl border-2 border-dashed transition-all duration-300",
            isDragging
              ? "border-indigo-400 bg-indigo-500/10 scale-[1.02]"
              : "border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10",
          )}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <input
            type="file"
            accept=".pdf"
            multiple
            onChange={handleFileInput}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
          />

          <div className="relative z-10 flex flex-col items-center py-20 px-8 text-center min-h-[300px] justify-center">
            <div
              className={clsx(
                "w-24 h-24 rounded-full bg-white/5 flex items-center justify-center mb-6 transition-all duration-300 pointer-events-none",
                isDragging
                  ? "scale-110 bg-indigo-500/20 text-indigo-300"
                  : "group-hover:scale-105 text-slate-400",
              )}
            >
              <Upload
                size={48}
                className={clsx(
                  "transition-colors",
                  isDragging ? "animate-bounce" : "",
                )}
              />
            </div>

            <h3 className="text-2xl font-bold mb-3 text-white group-hover:text-indigo-200 transition-colors">
              {isDragging ? "Drop it like it's hot!" : "Drop PDFs here"}
            </h3>
            <p className="text-slate-400 text-sm max-w-xs mx-auto">
              or click anywhere to browse your files
            </p>
          </div>

          {/* Animated Background Gradients */}
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-transparent to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
        </motion.div>

        {/* File List & Actions */}
        <AnimatePresence>
          {files.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-8 overflow-hidden"
            >
              <div className="backdrop-blur-xl border border-white/8 shadow-md rounded-3xl p-1 bg-black/20">
                <div className="flex justify-between items-center px-6 py-4 border-b border-white/5">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-400 text-xs font-bold">
                      {files.length}
                    </span>
                    <h3 className="font-semibold text-slate-300">Documents</h3>
                  </div>
                  <button
                    onClick={() => setFiles([])}
                    className="text-xs text-red-400 hover:text-red-300 hover:bg-red-400/10 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    Clear All
                  </button>
                </div>

                <DragDropContext onDragEnd={onDragEnd}>
                  <Droppable droppableId="files">
                    {(provided) => (
                      <div
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        className="p-4 space-y-2 max-h-[400px] overflow-y-auto"
                      >
                        {files.map((file, index) => (
                          <Draggable
                            key={file.id}
                            draggableId={file.id}
                            index={index}
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
                                <div className="w-10 h-10 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400 shrink-0">
                                  <FileText size={20} />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium text-sm text-slate-200 truncate">
                                    {file.name}
                                  </p>
                                  <p className="text-xs text-slate-500">
                                    {file.size}
                                  </p>
                                </div>
                                <button
                                  onClick={() => removeFile(file.id)}
                                  className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
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
              </div>

              {/* Action Bar */}
              <div className="mt-8 grid md:grid-cols-2 gap-4 items-center">
                <div className="text-center md:text-left text-sm text-slate-500 px-2">
                  <AlertCircle size={14} className="inline mr-1 -mt-0.5" />
                  Files are processed securely on your device.
                </div>

                <button
                  onClick={mergePDFs}
                  disabled={files.length < 2 || isMerging}
                  className={clsx(
                    "w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all transform active:scale-[0.98]",
                    files.length < 2
                      ? "bg-white/5 text-slate-500 cursor-not-allowed border border-white/5"
                      : isMerging
                        ? "bg-indigo-500/50 text-white cursor-wait"
                        : "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40 hover:-translate-y-1",
                  )}
                >
                  {isMerging ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Merging...</span>
                    </>
                  ) : (
                    <>
                      <Merge size={20} />
                      <span>Merge {files.length} PDFs</span>
                    </>
                  )}
                </button>
              </div>

              {/* Success Result */}
              {mergedPdfUrl && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-8 p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex flex-col md:flex-row items-center justify-between gap-6"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-emerald-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/30">
                      <Check size={24} />
                    </div>
                    <div>
                      <h4 className="font-bold text-emerald-400 text-lg">
                        Merge Complete!
                      </h4>
                      <p className="text-emerald-200/60 text-sm">
                        Your new PDF is ready for download.
                      </p>
                    </div>
                  </div>

                  <a
                    href={mergedPdfUrl}
                    download="fusion-core-result.pdf"
                    className="w-full md:w-auto px-8 py-3 rounded-xl bg-emerald-500 text-white font-bold text-sm flex items-center justify-center gap-2 hover:bg-emerald-400 transition-colors shadow-lg shadow-emerald-500/20"
                  >
                    <Download size={18} />
                    Download PDF
                  </a>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
