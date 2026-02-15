/**
 * Shared validation limits and MIME types for PDF toolkit tools.
 * Use these in every tool for consistent validation and UI copy.
 */

export const MAX_PDF_SIZE_BYTES = 100 * 1024 * 1024; // 100 MB
export const MAX_IMAGE_SIZE_BYTES = 20 * 1024 * 1024; // 20 MB per image
export const MAX_IMAGE_COUNT = 50;
export const MAX_MARKDOWN_LENGTH = 500 * 1024; // 500 KB for textarea

export const ALLOWED_PDF_TYPES = ["application/pdf"];
export const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
export const ALLOWED_MD_TYPES = ["text/markdown", "text/plain"];
export const ALLOWED_MD_EXTENSIONS = [".md"];

/** Human-readable max sizes for UI */
export const MAX_PDF_SIZE_LABEL = "100 MB";
export const MAX_IMAGE_SIZE_LABEL = "20 MB";
export const MAX_IMAGE_COUNT_LABEL = "50";
export const MAX_MARKDOWN_LENGTH_LABEL = "500 KB";
