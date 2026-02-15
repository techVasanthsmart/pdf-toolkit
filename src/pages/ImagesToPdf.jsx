import { useState } from "react";
import { useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Image as ImageIcon,
  FileImage,
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
  MAX_IMAGE_SIZE_BYTES,
  MAX_IMAGE_COUNT,
  MAX_IMAGE_SIZE_LABEL,
  MAX_IMAGE_COUNT_LABEL,
  ALLOWED_IMAGE_TYPES,
} from "../constants";

const PAGE_SIZES = {
  a4: { width: 595.28, height: 841.89, label: "A4" },
  letter: { width: 612, height: 792, label: "Letter" },
  match: { label: "Match first image" },
};

/**
 * Convert image file to PNG bytes (for webp/png) so pdf-lib can embed.
 * Returns { bytes, isJpeg: false }.
 */
async function imageFileToPngBytes(file) {
  const img = await createImageBitmap(file);
  const w = img.width;
  const h = img.height;
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  ctx.drawImage(img, 0, 0);
  img.close();

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("Failed to encode image"));
          return;
        }
        const reader = new FileReader();
        reader.onloadend = () =>
          resolve({ bytes: new Uint8Array(reader.result), isJpeg: false });
        reader.onerror = () => reject(new Error("Failed to read blob"));
        reader.readAsArrayBuffer(blob);
      },
      "image/png",
      0.95,
    );
  });
}

/**
 * For JPEG we can embed directly without canvas to preserve quality.
 */
async function getImageBytes(file) {
  if (file.type === "image/jpeg") {
    const buf = await file.arrayBuffer();
    return { bytes: new Uint8Array(buf), isJpeg: true };
  }
  return imageFileToPngBytes(file);
}

export default function ImagesToPdf() {
  const location = useLocation();
  const seoProps = getRouteByPath(location.pathname) ?? { path: "/images-to-pdf" };
  const [images, setImages] = useState([]); // [{ id, file, name, size }, ...]
  const [pageSizeKey, setPageSizeKey] = useState("a4");
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [resultUrl, setResultUrl] = useState(null);

  const handleSelect = (files) => {
    setError(null);
    setResultUrl(null);
    const newItems = files.map((file) => ({
      id: Math.random().toString(36).slice(2, 9),
      file,
      name: file.name,
      size: file.size,
    }));
    setImages((prev) => [...prev, ...newItems]);
  };

  const removeImage = (id) => {
    setImages((prev) => prev.filter((i) => i.id !== id));
    setResultUrl(null);
  };

  const onDragEnd = (result) => {
    if (!result.destination) return;
    const items = Array.from(images);
    const [removed] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, removed);
    setImages(items);
    setResultUrl(null);
  };

  const createPdf = async () => {
    if (images.length === 0) return;
    setError(null);
    setResultUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
    setIsProcessing(true);

    try {
      const pdf = await PDFDocument.create();
      const pageSize = PAGE_SIZES[pageSizeKey];
      let pageWidth = pageSize.width;
      let pageHeight = pageSize.height;

      for (let i = 0; i < images.length; i++) {
        const { file } = images[i];
        const { bytes, isJpeg } = await getImageBytes(file);
        const image = isJpeg
          ? await pdf.embedJpg(bytes)
          : await pdf.embedPng(bytes);

        if (pageSizeKey === "match" && i === 0) {
          pageWidth = image.width;
          pageHeight = image.height;
        }

        const page = pdf.addPage([pageWidth, pageHeight]);
        const { width: imgW, height: imgH } = image.scaleToFit(pageWidth, pageHeight);
        const x = (pageWidth - imgW) / 2;
        const y = pageHeight - imgH - (pageHeight - imgH) / 2;
        page.drawImage(image, { x, y, width: imgW, height: imgH });
      }

      const pdfBytes = await pdf.save();
      const blob = new Blob([pdfBytes], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      setResultUrl(url);
      saveAs(blob, "images-to-pdf.pdf");
    } catch (err) {
      console.error("Images to PDF error:", err);
      setError("Failed to create PDF. Check that all files are valid images.");
    } finally {
      setIsProcessing(false);
    }
  };

  const clearAll = () => {
    setImages([]);
    setResultUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
    setError(null);
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
            <ImageIcon size={40} className="text-white" />
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-200 via-white to-indigo-200 mb-4"
          >
            Images to PDF
          </motion.h1>
          <p className="text-slate-400 text-lg max-w-lg mx-auto leading-relaxed">
            Upload images (JPEG, PNG, WebP). Max {MAX_IMAGE_COUNT_LABEL} files, {MAX_IMAGE_SIZE_LABEL} each. Drag to reorder.
          </p>
        </header>

        <UploadZone
          accept="image/jpeg,image/png,image/webp"
          multiple
          onSelect={handleSelect}
          maxSize={MAX_IMAGE_SIZE_BYTES}
          maxCount={MAX_IMAGE_COUNT}
          allowedTypes={ALLOWED_IMAGE_TYPES}
          sizeLabel={MAX_IMAGE_SIZE_LABEL}
          title="Drop images here"
          subtitle={`or click to browse (max ${MAX_IMAGE_COUNT_LABEL} images)`}
        />

        <AnimatePresence>
          {images.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-8 space-y-6"
            >
              <div className="flex flex-wrap items-center gap-4">
                <label className="flex items-center gap-2 text-slate-300 text-sm">
                  <span>Page size:</span>
                  <select
                    value={pageSizeKey}
                    onChange={(e) => setPageSizeKey(e.target.value)}
                    className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:border-indigo-500 outline-none"
                  >
                    <option value="a4">A4</option>
                    <option value="letter">Letter</option>
                    <option value="match">Match first image</option>
                  </select>
                </label>
                <button
                  onClick={clearAll}
                  className="text-sm text-red-400 hover:text-red-300 hover:bg-red-400/10 px-3 py-2 rounded-lg transition-colors"
                >
                  Clear all
                </button>
              </div>

              <div className="backdrop-blur-xl border border-white/8 rounded-3xl p-4 bg-black/20">
                <DragDropContext onDragEnd={onDragEnd}>
                  <Droppable droppableId="images">
                    {(provided) => (
                      <div
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        className="space-y-2 max-h-[320px] overflow-y-auto"
                      >
                        {images.map((item, index) => (
                          <Draggable
                            key={item.id}
                            draggableId={item.id}
                            index={index}
                          >
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                className={clsx(
                                  "flex items-center gap-4 p-3 rounded-xl border transition-all select-none",
                                  snapshot.isDragging
                                    ? "bg-indigo-600/30 border-indigo-500 shadow-xl z-50 scale-105"
                                    : "bg-white/5 border-white/5 hover:bg-white/10",
                                )}
                                style={provided.draggableProps.style}
                              >
                                <div
                                  {...provided.dragHandleProps}
                                  className="text-slate-600 hover:text-white cursor-grab active:cursor-grabbing p-1"
                                >
                                  <Move size={16} />
                                </div>
                                <div className="w-12 h-12 rounded-lg bg-white/5 flex items-center justify-center text-indigo-400 shrink-0 overflow-hidden">
                                  <FileImage size={24} />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium text-sm text-slate-200 truncate">
                                    {item.name}
                                  </p>
                                  <p className="text-xs text-slate-500">
                                    {(item.size / 1024).toFixed(1)} KB
                                  </p>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => removeImage(item.id)}
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

              {error && (
                <p className="flex items-center gap-2 text-sm text-red-400" role="alert">
                  <AlertCircle size={16} />
                  {error}
                </p>
              )}

              <button
                onClick={createPdf}
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
                    Creating PDF...
                  </>
                ) : (
                  <>
                    <Download size={20} />
                    Create PDF ({images.length} {images.length === 1 ? "page" : "pages"})
                  </>
                )}
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {resultUrl && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-8 p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex flex-col sm:flex-row items-center justify-between gap-4"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-emerald-500 flex items-center justify-center text-white">
                  <Check size={24} />
                </div>
                <div>
                  <h4 className="font-bold text-emerald-400 text-lg">PDF created</h4>
                  <p className="text-emerald-200/60 text-sm">
                    Your PDF was downloaded. You can download again below.
                  </p>
                </div>
              </div>
              <a
                href={resultUrl}
                download="images-to-pdf.pdf"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-500 text-white font-bold hover:bg-emerald-400 transition-colors shrink-0"
              >
                <Download size={18} />
                Download again
              </a>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
