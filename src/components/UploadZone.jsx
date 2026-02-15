import { useState } from "react";
import { motion } from "framer-motion";
import { Upload } from "lucide-react";
import clsx from "clsx";

/**
 * Reusable upload zone with validation.
 * @param {string} accept - HTML accept attribute (e.g. ".pdf", "image/*")
 * @param {boolean} multiple - Allow multiple files
 * @param {function(File[]): void} onSelect - Called with validated files
 * @param {number} [maxSize] - Max file size in bytes (per file)
 * @param {number} [maxCount] - Max number of files (when multiple)
 * @param {string[]} [allowedTypes] - MIME types to allow (optional; accept can be used instead)
 * @param {string[]} [allowedExtensions] - File extensions to allow (e.g. [".md"]); used when MIME is missing or generic
 * @param {string} title - Main heading text
 * @param {string} subtitle - Subtitle text
 * @param {string} [sizeLabel] - Human-readable max size for error (e.g. "100 MB")
 * @param {boolean} [compact] - If true, render a slim strip (e.g. for use inside a card)
 */
export function UploadZone({
  accept,
  multiple = false,
  onSelect,
  maxSize,
  maxCount,
  allowedTypes,
  allowedExtensions,
  title = "Drop files here",
  subtitle = "or click to browse",
  sizeLabel,
  compact = false,
}) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState(null);

  const validateFiles = (fileList) => {
    const files = Array.from(fileList);
    setError(null);

    if (files.length === 0) return [];

    if (!multiple && files.length > 1) {
      setError("Please upload only one file.");
      return [];
    }

    if (maxCount && files.length > maxCount) {
      setError(`Maximum ${maxCount} files allowed.`);
      return [];
    }

    for (const file of files) {
      const typeOk =
        !allowedTypes?.length ||
        allowedTypes.includes(file.type) ||
        (allowedExtensions?.length &&
          allowedExtensions.some((ext) =>
            file.name.toLowerCase().endsWith(ext.toLowerCase()),
          ));
      if (!typeOk) {
        const allowed = [accept || (allowedTypes?.length && allowedTypes.join(", ")), allowedExtensions?.length && allowedExtensions.join(", ")].filter(Boolean).join(" or ");
        setError(`Invalid file type. Allowed: ${allowed || "see accept"}`);
        return [];
      }
      if (maxSize && file.size > maxSize) {
        setError(`File "${file.name}" is too large. Max ${sizeLabel || "size"} per file.`);
        return [];
      }
    }

    return files;
  };

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
    const files = validateFiles(e.dataTransfer.files);
    if (files.length > 0) onSelect(files);
  };

  const handleFileInput = (e) => {
    const files = validateFiles(e.target.files || []);
    if (files.length > 0) onSelect(files);
    e.target.value = "";
  };

  if (compact) {
    return (
      <motion.div
        className={clsx(
          "upload-zone relative group overflow-hidden rounded-xl border-2 border-dashed transition-all duration-300",
          isDragging
            ? "border-indigo-400 bg-indigo-500/10"
            : "border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10",
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
      >
        <input
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleFileInput}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
        />
        <div className="relative z-10 flex items-center justify-center gap-3 py-4 px-4 text-center">
          <Upload
            size={20}
            className={clsx(
              "flex-shrink-0 text-slate-400 transition-colors",
              isDragging ? "text-indigo-400 animate-bounce" : "group-hover:text-indigo-300",
            )}
          />
          <div className="min-w-0">
            <p className="text-sm font-medium text-slate-300 group-hover:text-white transition-colors truncate">
              {isDragging ? "Drop here" : subtitle}
            </p>
            {error && (
              <p className="mt-1 text-xs text-red-400 font-medium" role="alert">
                {error}
              </p>
            )}
          </div>
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 via-transparent to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
      </motion.div>
    );
  }

  return (
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
        accept={accept}
        multiple={multiple}
        onChange={handleFileInput}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
      />
      <div className="relative z-10 flex flex-col items-center py-20 px-8 text-center min-h-[280px] justify-center">
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
            className={clsx("transition-colors", isDragging ? "animate-bounce" : "")}
          />
        </div>
        <h3 className="text-2xl font-bold mb-3 text-white group-hover:text-indigo-200 transition-colors">
          {isDragging ? "Drop here" : title}
        </h3>
        <p className="text-slate-400 text-sm max-w-xs mx-auto">{subtitle}</p>
        {error && (
          <p className="mt-4 text-sm text-red-400 font-medium" role="alert">
            {error}
          </p>
        )}
      </div>
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-transparent to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
    </motion.div>
  );
}
