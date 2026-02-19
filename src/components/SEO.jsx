

const SITE_NAME = 'Free PDF Toolkit';
const SITE_URL = 'https://pdf-toolkit.vasanthubs.co.in';
const OG_IMAGE = `${SITE_URL}/og-image.svg`;
const DEFAULT_TITLE = 'Free PDF Merger & Tools — No Login Required, Free for Life, Secure';
const DEFAULT_DESCRIPTION =
  'Merge, split, reorder PDFs and convert images or Markdown to PDF. No login required. Free for lifetime. Secure Core: client-side processing. No data leaves your device.';
const DEFAULT_KEYWORDS =
  'free pdf merger, merge pdf online, split pdf, reorder pdf pages, no login pdf tools, secure pdf, client-side pdf, pdf converter, images to pdf, markdown to pdf, free forever, no signup, privacy, pdf toolkit, combine pdf';

const AUTHOR_NAME = 'Vasanth Kumar';

export const SEO = ({ title, description, keywords, path = '/' }) => {
  const finalTitle = title ? `${title} | ${SITE_NAME}` : DEFAULT_TITLE;
  const finalDescription = description || DEFAULT_DESCRIPTION;
  const finalKeywords = keywords || DEFAULT_KEYWORDS;
  const canonicalUrl = `${SITE_URL}${path}`;
  const isHome = path === '/';
  const pageName = title || SITE_NAME;

  const schemaOrg = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: SITE_NAME,
    url: SITE_URL,
    description: DEFAULT_DESCRIPTION,
    applicationCategory: 'ProductivityApplication',
    operatingSystem: 'Web Browser',
    screenshot: OG_IMAGE,
    author: {
      '@type': 'Person',
      name: AUTHOR_NAME,
      url: 'https://vasanthubs.co.in',
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
    image: OG_IMAGE,
  };

  const breadcrumbSchema =
    !isHome &&
    ({
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_URL}/` },
        { '@type': 'ListItem', position: 2, name: pageName, item: canonicalUrl },
      ],
    });

  const webSiteSchema = isHome && {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    description: DEFAULT_DESCRIPTION,
    url: SITE_URL,
  };

  const faqSchema = isHome && {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'Is PDF Toolkit really free?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes! PDF Toolkit is completely free, with no hidden fees, watermarks, or usage limits. It will remain free forever.',
        },
      },
      {
        '@type': 'Question',
        name: 'Is it safe to use? Where is my data stored?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'All processing happens 100% client-side in your browser. Your files never leave your device and are never uploaded to any server.',
        },
      },
      {
        '@type': 'Question',
        name: 'Do I need to create an account?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'No account or login is required. Just open the tool and start working with your PDFs immediately.',
        },
      },
    ],
  };


  return (
    <>
      <title>{finalTitle}</title>
      <meta name="description" content={finalDescription} />
      <meta name="keywords" content={finalKeywords} />
      <meta name="author" content={AUTHOR_NAME} />
      <link rel="canonical" href={canonicalUrl} />
      <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />

      {/* Open Graph */}
      <meta property="og:title" content={finalTitle} />
      <meta property="og:description" content={finalDescription} />
      <meta property="og:type" content="website" />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:image" content={OG_IMAGE} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:locale" content="en_US" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={finalTitle} />
      <meta name="twitter:description" content={finalDescription} />
      <meta name="twitter:image" content={OG_IMAGE} />

      {/* Structured data */}
      <script type="application/ld+json">{JSON.stringify(schemaOrg)}</script>
      <script type="application/ld+json">{JSON.stringify(webPageSchema)}</script>
      {breadcrumbSchema && (
        <script type="application/ld+json">{JSON.stringify(breadcrumbSchema)}</script>
      )}
      {webSiteSchema && (
        <script type="application/ld+json">{JSON.stringify(webSiteSchema)}</script>
      )}
      {faqSchema && (
        <script type="application/ld+json">{JSON.stringify(faqSchema)}</script>
      )}
    </>
  );
};
