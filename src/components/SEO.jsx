

const SITE_NAME = 'Free PDF Toolkit';
const DEFAULT_TITLE = 'Free PDF Merger & Tools — No Login Required, Free for Life, Secure';
const DEFAULT_DESCRIPTION =
  'Merge, split, reorder PDFs and convert images or Markdown to PDF. No login required. Free for lifetime. Secure Core: client-side processing. No data leaves your device.';
const DEFAULT_KEYWORDS =
  'free pdf merger, merge pdf online, split pdf, no login pdf tools, secure pdf, client-side pdf, pdf converter, images to pdf, markdown to pdf, free forever, no signup, privacy';

const AUTHOR_NAME = 'Vasanth Kumar';

export const SEO = ({ title, description, keywords, path = '/' }) => {
  const finalTitle = title ? `${title} | ${SITE_NAME}` : DEFAULT_TITLE;
  const finalDescription = description || DEFAULT_DESCRIPTION;
  const finalKeywords = keywords || DEFAULT_KEYWORDS;
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
  const canonicalUrl = `${baseUrl}${path}`;
  const isHome = path === '/';
  const pageName = title || SITE_NAME;

  const schemaOrg = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: SITE_NAME,
    description: DEFAULT_DESCRIPTION,
    applicationCategory: 'ProductivityApplication',
    operatingSystem: 'Web Browser',
    author: {
      '@type': 'Person',
      name: AUTHOR_NAME,
    },
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock',
      priceValidUntil: '2099-12-31',
    },
    featureList: [
      'Merge PDFs',
      'Split PDF',
      'Reorder PDF pages',
      'Images to PDF',
      'Markdown to PDF',
    ],
    slogan: 'No login required. Free for life. Secure Core — no data leaves your device.',
  };

  const webPageSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: finalTitle,
    description: finalDescription,
    url: canonicalUrl,
  };

  const breadcrumbSchema =
    !isHome &&
    ({
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: `${baseUrl}/` },
        { '@type': 'ListItem', position: 2, name: pageName, item: canonicalUrl },
      ],
    });

  const webSiteSchema = isHome && {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    description: DEFAULT_DESCRIPTION,
    url: canonicalUrl,
  };


  return (
    <>
      <title>{finalTitle}</title>
      <meta name="description" content={finalDescription} />
      <meta name="keywords" content={finalKeywords} />
      <meta name="author" content={AUTHOR_NAME} />
      <link rel="canonical" href={canonicalUrl} />
      <meta name="robots" content="index, follow" />

      {/* Open Graph */}
      <meta property="og:title" content={finalTitle} />
      <meta property="og:description" content={finalDescription} />
      <meta property="og:type" content="website" />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:site_name" content={SITE_NAME} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={finalTitle} />
      <meta name="twitter:description" content={finalDescription} />

      {/* Structured data */}
      <script type="application/ld+json">{JSON.stringify(schemaOrg)}</script>
      <script type="application/ld+json">{JSON.stringify(webPageSchema)}</script>
      {breadcrumbSchema && (
        <script type="application/ld+json">{JSON.stringify(breadcrumbSchema)}</script>
      )}
      {webSiteSchema && (
        <script type="application/ld+json">{JSON.stringify(webSiteSchema)}</script>
      )}
    </>
  );
};
