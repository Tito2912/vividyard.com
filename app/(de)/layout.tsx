import type { Metadata, Viewport } from 'next';
import '../globals.css';
import { SITE } from '@/lib/site';
import { SiteShell } from '@/components/SiteShell';

export const viewport: Viewport = {
  themeColor: '#ffffff',
};

const DESC_DE =
  'Vividyard: Vergleiche und Tests der besten KI-Kreativtools — Stockfotos, Design, Bild. Affiliate-Links zu Vecteezy, Shutterstock und Adobe.';

export const metadata: Metadata = {
  title: {
    default: SITE.brandName,
    template: `%s | ${SITE.brandName}`,
  },
  description: DESC_DE,
  metadataBase: new URL(SITE.baseUrl),
  icons: {
    icon: [{ url: '/favicon.ico' }],
  },
  openGraph: {
    type: 'website',
    title: SITE.brandName,
    description: DESC_DE,
    url: `${SITE.baseUrl}/de`,
    images: [{ url: '/images/og-image.png' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: SITE.brandName,
    description: DESC_DE,
    images: ['/images/og-image.png'],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de" suppressHydrationWarning>
      <body>
        <SiteShell>{children}</SiteShell>
      </body>
    </html>
  );
}
