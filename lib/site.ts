export const SITE = {
  baseUrl: 'https://vividyard.com',
  domain: 'vividyard.com',
  brandName: 'Vividyard',
  productName: 'AI Creative Tools',
  ga4Id: 'G-PLACEHOLDER',
  affiliates: {
    vecteezy:    'VECTEEZY_AFFILIATE_URL_PLACEHOLDER',
    rawpixel:    'RAWPIXEL_AFFILIATE_URL_PLACEHOLDER',
    shutterstock:'SHUTTERSTOCK_AFFILIATE_URL_PLACEHOLDER',
    placeit:     'PLACEIT_AFFILIATE_URL_PLACEHOLDER',
    adobe:       'ADOBE_AFFILIATE_URL_PLACEHOLDER',
  },
  companyName: 'E-Com Shop',
  companyAddress: '60 rue François 1er, 75008 PARIS',
  companyId: 'SIREN 934934308',
  managerName: 'Tony CARON',
  hostName: 'Netlify',
  contactEmail: 'contact.ecomshopfrance@gmail.com',
  supportedLangs: ['fr', 'en', 'es', 'de'] as const,
};

export type Lang = (typeof SITE.supportedLangs)[number];

export const UI_TRANSLATIONS: Record<
  Lang,
  {
    blog: string;
    about: string;
    sources: string;
    contact: string;
    legal: string;
    privacy: string;
    manageCookies: string;
    cookie: string;
    accept: string;
    refuse: string;
    language: string;
    menu: string;
    cta: string;
    jumpTo: string;
    quickAnswer: string;
    nextSteps: string;
    toc: string;
    onThisPage: string;
  }
> = {
  fr: {
    blog: 'Blog',
    about: 'À propos',
    sources: 'Sources',
    contact: 'Contact',
    legal: 'Mentions légales',
    privacy: 'Politique de confidentialité',
    manageCookies: 'Gérer les cookies',
    cookie: 'Nous utilisons des cookies analytiques (Google Analytics 4) pour améliorer le site.',
    accept: 'Accepter',
    refuse: 'Refuser',
    language: 'Langue',
    menu: 'Menu',
    cta: 'Voir les meilleurs outils IA',
    jumpTo: 'Aller à',
    quickAnswer: 'Réponse rapide',
    nextSteps: 'Étapes suivantes',
    toc: 'Sommaire',
    onThisPage: 'Sur cette page',
  },
  en: {
    blog: 'Blog',
    about: 'About',
    sources: 'Sources',
    contact: 'Contact',
    legal: 'Legal notice',
    privacy: 'Privacy policy',
    manageCookies: 'Manage cookies',
    cookie: 'We use analytics cookies (Google Analytics 4) to improve the site.',
    accept: 'Accept',
    refuse: 'Refuse',
    language: 'Language',
    menu: 'Menu',
    cta: 'Best AI creative tools',
    jumpTo: 'Jump to',
    quickAnswer: 'Quick answer',
    nextSteps: 'Next steps',
    toc: 'Table of contents',
    onThisPage: 'On this page',
  },
  es: {
    blog: 'Blog',
    about: 'Acerca de',
    sources: 'Fuentes',
    contact: 'Contacto',
    legal: 'Aviso legal',
    privacy: 'Política de privacidad',
    manageCookies: 'Gestionar cookies',
    cookie: 'Usamos cookies analíticas (Google Analytics 4) para mejorar el sitio.',
    accept: 'Aceptar',
    refuse: 'Rechazar',
    language: 'Idioma',
    menu: 'Menú',
    cta: 'Mejores herramientas IA creativas',
    jumpTo: 'Ir a',
    quickAnswer: 'Respuesta rápida',
    nextSteps: 'Siguientes pasos',
    toc: 'Tabla de contenidos',
    onThisPage: 'En esta página',
  },
  de: {
    blog: 'Blog',
    about: 'Über uns',
    sources: 'Quellen',
    contact: 'Kontakt',
    legal: 'Impressum',
    privacy: 'Datenschutz',
    manageCookies: 'Cookies verwalten',
    cookie: 'Wir verwenden Analyse-Cookies (Google Analytics 4), um die Website zu verbessern.',
    accept: 'Akzeptieren',
    refuse: 'Ablehnen',
    language: 'Sprache',
    menu: 'Menü',
    cta: 'Beste KI-Kreativtools',
    jumpTo: 'Springe zu',
    quickAnswer: 'Kurzantwort',
    nextSteps: 'Nächste Schritte',
    toc: 'Inhaltsverzeichnis',
    onThisPage: 'Auf dieser Seite',
  },
};

export function normalizeLang(lang: unknown): Lang {
  const normalized = String(lang ?? '').toLowerCase();
  return (SITE.supportedLangs as readonly string[]).includes(normalized) ? (normalized as Lang) : 'fr';
}

function normalizePathname(pathname: string): string {
  let path = pathname || '/';
  if (path !== '/') path = path.replace(/\/+$/, '');
  return path.replace(/\.html$/, '');
}

export function getLangFromPathname(pathname: string): Lang {
  const path = normalizePathname(pathname);
  if (path === '/en' || path.startsWith('/en/')) return 'en';
  if (path === '/es' || path.startsWith('/es/')) return 'es';
  if (path === '/de' || path.startsWith('/de/')) return 'de';
  return 'fr';
}

export function prefixPath(lang: Lang): string {
  return lang === 'fr' ? '' : `/${lang}`;
}

type TranslationKey = 'home' | 'blog_index' | 'legal_notice' | 'privacy_policy' | 'contact' | 'about';

const ROUTE_BY_KEY: Record<TranslationKey, Record<Lang, string>> = {
  home: { fr: '/', en: '/en', es: '/es', de: '/de' },
  blog_index: { fr: '/blog', en: '/en/blog', es: '/es/blog', de: '/de/blog' },
  legal_notice: {
    fr: '/mentions-legales',
    en: '/en/legal-notice',
    es: '/es/legal-notice',
    de: '/de/impressum',
  },
  privacy_policy: {
    fr: '/politique-de-confidentialite',
    en: '/en/privacy-policy',
    es: '/es/privacy-policy',
    de: '/de/datenschutz',
  },
  contact: { fr: '/contact', en: '/en/contact', es: '/es/contact', de: '/de/contact' },
  about: { fr: '/a-propos', en: '/en/about', es: '/es/about', de: '/de/about' },
};

export function getAlternateRoutes(key: TranslationKey): Record<Lang, string> {
  return ROUTE_BY_KEY[key];
}

export function getCanonicalForKey(key: TranslationKey, lang: Lang): string {
  return SITE.baseUrl + ROUTE_BY_KEY[key][lang];
}

export function homePath(lang: Lang): string {
  return ROUTE_BY_KEY.home[lang];
}

export function blogIndexPath(lang: Lang): string {
  return ROUTE_BY_KEY.blog_index[lang];
}

export function aboutPath(lang: Lang): string {
  return ROUTE_BY_KEY.about[lang];
}

export function contactPath(lang: Lang): string {
  return ROUTE_BY_KEY.contact[lang];
}

export function legalNoticePath(lang: Lang): string {
  return ROUTE_BY_KEY.legal_notice[lang];
}

export function privacyPath(lang: Lang): string {
  return ROUTE_BY_KEY.privacy_policy[lang];
}

export function localizedUrl(pathname: string, lang: Lang): string {
  const path = normalizePathname(pathname);
  const withoutPrefix =
    path === '/en' || path.startsWith('/en/')
      ? path.replace(/^\/en\b/, '') || '/'
      : path === '/es' || path.startsWith('/es/')
        ? path.replace(/^\/es\b/, '') || '/'
        : path === '/de' || path.startsWith('/de/')
          ? path.replace(/^\/de\b/, '') || '/'
          : path;

  if (withoutPrefix === '/' || withoutPrefix === '') return homePath(lang);
  const cleaned = withoutPrefix.startsWith('/') ? withoutPrefix : `/${withoutPrefix}`;
  return `${prefixPath(lang)}${cleaned}`;
}
