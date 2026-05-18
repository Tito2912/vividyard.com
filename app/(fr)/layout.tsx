import type { Metadata, Viewport } from 'next';
import '../globals.css';
import { SITE } from '@/lib/site';
import { SiteShell } from '@/components/SiteShell';

export const viewport: Viewport = {
  themeColor: '#ffffff',
};

const DESC_FR =
  'Vividyard : comparatifs et avis sur les meilleurs outils IA créatifs — images stock, design, photo. Liens affiliés Vecteezy, Shutterstock, Adobe.';

export const metadata: Metadata = {
  title: {
    default: SITE.brandName,
    template: `%s | ${SITE.brandName}`,
  },
  description: DESC_FR,
  metadataBase: new URL(SITE.baseUrl),
  alternates: { canonical: '/' },
  icons: {
    icon: [{ url: '/favicon.ico' }],
  },
  openGraph: {
    type: 'website',
    title: SITE.brandName,
    description: DESC_FR,
    url: SITE.baseUrl,
    images: [{ url: '/images/og-image.png' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: SITE.brandName,
    description: DESC_FR,
    images: ['/images/og-image.png'],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body>
        <SiteShell>{children}</SiteShell>
      </body>
    </html>
  );
}
