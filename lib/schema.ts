import type { Post } from '@/lib/types';
import { SITE } from '@/lib/site';

const BASE_URL = SITE.baseUrl;

function normalizeLang(lang: unknown): 'fr' | 'en' | 'es' | 'de' | undefined {
  const l = String(lang ?? '').toLowerCase();
  if (l === 'fr' || l === 'en' || l === 'es' || l === 'de') return l;
  return undefined;
}

function homePathForLang(lang: unknown): string {
  const l = normalizeLang(lang);
  if (l === 'en') return '/en';
  if (l === 'es') return '/es';
  if (l === 'de') return '/de';
  return '/';
}

function homeNameForLang(lang: unknown): string {
  const l = normalizeLang(lang);
  if (l === 'en') return 'Home';
  if (l === 'es') return 'Inicio';
  if (l === 'de') return 'Startseite';
  return 'Accueil';
}

export function buildOrganizationJsonLd() {
  const logoUrl = new URL('/images/logo.png', BASE_URL).toString();

  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${BASE_URL}#organization`,
    name: SITE.brandName,
    url: BASE_URL,
    logo: {
      '@type': 'ImageObject',
      url: logoUrl,
    },
  };
}

export function buildWebsiteJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${BASE_URL}#website`,
    url: BASE_URL,
    name: SITE.brandName,
    publisher: { '@id': `${BASE_URL}#organization` },
  };
}

export function buildArticleJsonLd(post: Post) {
  const url = new URL(post.canonical ?? `/${post.slug}`, BASE_URL).toString();
  const lang = normalizeLang(post.lang);

  if (post.type === 'article') {
    const imageUrl = new URL('/images/og-image.png', BASE_URL).toString();
    const logoUrl = new URL('/images/logo.png', BASE_URL).toString();

    const out: Record<string, unknown> = {
      '@context': 'https://schema.org',
      '@type': 'BlogPosting',
      headline: post.title,
      description: post.description,
      url,
      mainEntityOfPage: { '@type': 'WebPage', '@id': url },
      image: [imageUrl],
      inLanguage: lang,
      author: [{ '@type': 'Organization', name: SITE.brandName, url: BASE_URL }],
      publisher: {
        '@type': 'Organization',
        '@id': `${BASE_URL}#organization`,
        name: SITE.brandName,
        url: BASE_URL,
        logo: { '@type': 'ImageObject', url: logoUrl },
      },
    };

    const published = post.date ?? post.updatedAt;
    if (published) out.datePublished = published;
    if (post.updatedAt) out.dateModified = post.updatedAt;

    return out;
  }

  const type = post.type === 'blogIndex' ? 'CollectionPage' : 'WebPage';
  return {
    '@context': 'https://schema.org',
    '@type': type,
    name: post.title,
    description: post.description,
    url,
    inLanguage: lang,
    isPartOf: { '@id': `${BASE_URL}#website` },
  };
}

export function buildBreadcrumbJsonLd(post: Post) {
  const url = new URL(post.canonical ?? `/${post.slug}`, BASE_URL).toString();
  const homePath = homePathForLang(post.lang);
  const homeUrl = homePath === '/' ? BASE_URL : new URL(homePath, BASE_URL).toString();
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: homeNameForLang(post.lang),
        item: homeUrl,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: post.title,
        item: url,
      },
    ],
  };
}
