import type { Metadata, Viewport } from 'next';
import '../globals.css';
import { SITE } from '@/lib/site';
import { SiteShell } from '@/components/SiteShell';

export const viewport: Viewport = {
  themeColor: '#ffffff',
};

const DESC_ES =
  'Vividyard: comparativas y reseñas de las mejores herramientas IA creativas — imágenes, diseño y foto. Links afiliados Vecteezy, Shutterstock, Adobe.';

export const metadata: Metadata = {
  title: {
    default: SITE.brandName,
    template: `%s | ${SITE.brandName}`,
  },
  description: DESC_ES,
  metadataBase: new URL(SITE.baseUrl),
  icons: {
    icon: [{ url: '/favicon.ico' }],
  },
  openGraph: {
    type: 'website',
    title: SITE.brandName,
    description: DESC_ES,
    url: `${SITE.baseUrl}/es`,
    images: [{ url: '/images/og-image.png' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: SITE.brandName,
    description: DESC_ES,
    images: ['/images/og-image.png'],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body>
        <SiteShell>{children}</SiteShell>
      </body>
    </html>
  );
}
