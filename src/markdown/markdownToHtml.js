import { marked } from "marked";

const MARKED_OPTIONS = {
  gfm: true,
  breaks: true,
};

/** PDF/iframe: full-document styles including html, body (so PDF stays white). */
const TEMPLATE_STYLE = `
  html, body { background: #ffffff !important; color: #1e293b !important; margin: 0 !important; padding: 0 !important; overflow: visible !important; }
  .md-body { font-family: Outfit, Inter, system-ui, sans-serif; font-size: 11pt; line-height: 1.5; color: #1e293b; padding: 40px; max-width: 100%; box-sizing: border-box; background: #ffffff !important; overflow: visible; orphans: 2; widows: 2; }
  .md-body h1 { font-size: 24pt; line-height: 1.25; margin: 0 0 12px; padding: 24px 0 4px; font-weight: 700; page-break-after: avoid; }
  .md-body h2 { font-size: 20pt; line-height: 1.25; margin: 0 0 10px; padding: 20px 0 4px; font-weight: 700; page-break-after: avoid; }
  .md-body h3 { font-size: 16pt; line-height: 1.3; margin: 0 0 8px; padding: 16px 0 4px; font-weight: 600; page-break-after: avoid; }
  .md-body h4, .md-body h5, .md-body h6 { font-size: 12pt; line-height: 1.3; margin: 0 0 6px; padding: 12px 0 4px; font-weight: 600; page-break-after: avoid; }
  .md-body p { margin: 0 0 12px; page-break-inside: avoid; }
  .md-body ul, .md-body ol { margin: 0 0 12px; padding-left: 24px; }
  .md-body li { margin: 4px 0; page-break-inside: avoid; }
  .md-body pre { margin: 12px 0; padding: 12px; background: #f1f5f9; border-radius: 6px; overflow-x: auto; font-family: ui-monospace, monospace; font-size: 10pt; page-break-inside: avoid; }
  .md-body code { font-family: ui-monospace, monospace; font-size: 10pt; background: #f1f5f9; padding: 2px 6px; border-radius: 4px; page-break-inside: avoid; }
  .md-body pre code { background: none; padding: 0; }
  .md-body blockquote { margin: 12px 0; padding-left: 16px; border-left: 4px solid #94a3b8; color: #475569; page-break-inside: avoid; }
  .md-body table { border-collapse: collapse; width: 100%; margin: 12px 0; page-break-inside: avoid; }
  .md-body th, .md-body td { border: 1px solid #cbd5e1; padding: 8px 12px; text-align: left; }
  .md-body th { background: #f1f5f9; font-weight: 600; }
  .md-body a { color: #6366f1; text-decoration: none; }
  .md-body hr { border: none; height: 0; margin: 20px 0; padding: 0; line-height: 0; font-size: 0; box-sizing: border-box; border-top: 1px solid #e2e8f0; }
`;

/** In-page preview only: .md-body typography, no html/body (avoids overriding app theme). */
export const PREVIEW_STYLE = `
  .md-body { font-family: Outfit, Inter, system-ui, sans-serif; font-size: 11pt; line-height: 1.5; color: #1e293b; padding: 40px; max-width: 100%; box-sizing: border-box; background: #ffffff; }
  .md-body h1 { font-size: 24pt; margin: 24px 0 12px; font-weight: 700; }
  .md-body h2 { font-size: 20pt; margin: 20px 0 10px; font-weight: 700; }
  .md-body h3 { font-size: 16pt; margin: 16px 0 8px; font-weight: 600; }
  .md-body h4, .md-body h5, .md-body h6 { font-size: 12pt; margin: 12px 0 6px; font-weight: 600; }
  .md-body p { margin: 0 0 12px; }
  .md-body ul, .md-body ol { margin: 0 0 12px; padding-left: 24px; }
  .md-body li { margin: 4px 0; }
  .md-body pre { margin: 12px 0; padding: 12px; background: #f1f5f9; border-radius: 6px; overflow-x: auto; font-family: ui-monospace, monospace; font-size: 10pt; }
  .md-body code { font-family: ui-monospace, monospace; font-size: 10pt; background: #f1f5f9; padding: 2px 6px; border-radius: 4px; }
  .md-body pre code { background: none; padding: 0; }
  .md-body blockquote { margin: 12px 0; padding-left: 16px; border-left: 4px solid #94a3b8; color: #475569; }
  .md-body table { border-collapse: collapse; width: 100%; margin: 12px 0; }
  .md-body th, .md-body td { border: 1px solid #cbd5e1; padding: 8px 12px; text-align: left; }
  .md-body th { background: #f1f5f9; font-weight: 600; }
  .md-body a { color: #6366f1; text-decoration: none; }
  .md-body hr { border: none; border-top: 1px solid #e2e8f0; margin: 16px 0; }
`;

/**
 * Convert Markdown string to HTML using a fixed pipeline (marked + template).
 * Used by the Markdown to PDF page and by tests.
 * @param {string} markdown - Raw markdown content
 * @returns {string} HTML string (wrapper div with class "md-body"; use with TEMPLATE_STYLE in page)
 */
export function markdownToHtml(markdown) {
  if (typeof markdown !== "string") return "";
  const raw = marked(markdown.trim(), MARKED_OPTIONS);
  const escaped = typeof raw === "string" ? raw : "";
  return `<div class="md-body">${escaped}</div>`;
}

/** Full document HTML (for tests or iframe). */
export function markdownToFullDocument(markdown) {
  const body = markdownToHtml(markdown);
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><style>${TEMPLATE_STYLE}</style></head><body>${body}</body></html>`;
}

export { MARKED_OPTIONS, TEMPLATE_STYLE };
