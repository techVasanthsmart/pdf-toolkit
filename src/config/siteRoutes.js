/**
 * Single source of truth for site routes and SEO metadata.
 * Used by pages for SEO props, sitemap generation, and BreadcrumbList.
 */
export const SITE_NAME = 'Free PDF Toolkit';

export const siteRoutes = [
  {
    path: '/',
    title: null,
    description:
      'Merge, split, reorder PDFs and convert images or Markdown to PDF. No login required. Free for lifetime. Secure Core: client-side processing. No data leaves your device.',
    keywords:
      'free pdf merger, merge pdf online, split pdf, no login pdf tools, secure pdf, client-side pdf, pdf converter, images to pdf, markdown to pdf, free forever, no signup, privacy',
  },
  {
    path: '/merge',
    title: 'Fusion Core - Merge PDFs',
    description: 'Combine PDF files securely in your browser. No upload to server.',
    keywords: 'merge pdf online, combine pdf, join pdf, pdf merger free, client-side merge',
  },
  {
    path: '/split',
    title: 'Split PDF',
    description: 'Split a PDF by every page or by custom page ranges. Secure, client-side.',
    keywords: 'split pdf, split pdf by page, extract pdf pages, pdf splitter free',
  },
  {
    path: '/reorder',
    title: 'Reorder PDF Pages',
    description: 'Reorder or remove pages from a PDF. Drag to reorder, remove unwanted pages, download.',
    keywords: 'reorder pdf pages, rearrange pdf, remove pdf pages, pdf page order',
  },
  {
    path: '/images-to-pdf',
    title: 'Images to PDF',
    description: 'Convert one or many images to a single PDF. Choose page size: A4, Letter, or match first image.',
    keywords: 'images to pdf, convert images to pdf, jpg to pdf, png to pdf, photo to pdf',
  },
  {
    path: '/markdown-to-pdf',
    title: 'Markdown to PDF',
    description: 'Convert Markdown to PDF in your browser. Supports headings, code, lists, tables.',
    keywords: 'markdown to pdf, md to pdf, convert markdown pdf, markdown converter',
  },
  {
    path: '/pdf-to-ppt',
    title: 'PDF to PowerPoint',
    description: 'Convert any PDF to a PowerPoint presentation in your browser. Each page becomes a slide. Fully client-side, no upload required.',
    keywords: 'pdf to ppt, pdf to powerpoint, convert pdf to pptx, pdf to presentation, pdf slides converter',
  },
];

/**
 * Get route config by path (exact match). Use for SEO and BreadcrumbList.
 * @param {string} pathname - e.g. location.pathname
 * @returns {{ path: string, title: string | null, description: string, keywords: string } | null}
 */
export function getRouteByPath(pathname) {
  const route = siteRoutes.find((r) => r.path === pathname);
  if (!route) return null;
  return {
    path: route.path,
    title: route.title,
    description: route.description,
    keywords: route.keywords,
  };
}
