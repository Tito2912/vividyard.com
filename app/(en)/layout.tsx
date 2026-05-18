import type { Metadata, Viewport } from 'next';
import '../globals.css';
import { SITE } from '@/lib/site';
import { SiteShell } from '@/components/SiteShell';

export const viewport: Viewport = {
  themeColor: '#ffffff',
};

const DESC_EN =
  'Vividyard: reviews and comparisons of the best AI creative tools — stock images, design, photo. Affiliate links to Vecteezy, Shutterstock, Adobe.';

export const metadata: Metadata = {
  title: {
    default: SITE.brandName,
    template: `%s | ${SITE.brandName}`,
  },
  description: DESC_EN,
  metadataBase: new URL(SITE.baseUrl),
  icons: {
    icon: [{ url: '/favicon.ico' }],
  },
  openGraph: {
    type: 'website',
    title: SITE.brandName,
    description: DESC_EN,
    url: `${SITE.baseUrl}/en`,
    images: [{ url: '/images/og-image.png' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: SITE.brandName,
    description: DESC_EN,
    images: ['/images/og-image.png'],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <SiteShell>{children}</SiteShell>
      </body>
    </html>
  );
}
