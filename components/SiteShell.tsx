import { buildOrganizationJsonLd, buildWebsiteJsonLd } from '@/lib/schema';
import { CookieBanner } from '@/components/CookieBanner';
import { FaqEnhancer } from '@/components/FaqEnhancer';
import { LangHtmlUpdater } from '@/components/LangHtmlUpdater';
import { SiteFooter } from '@/components/SiteFooter';
import { SiteHeader } from '@/components/SiteHeader';

export function SiteShell({ children }: { children: React.ReactNode }) {
  const organizationJsonLd = buildOrganizationJsonLd();
  const websiteJsonLd = buildWebsiteJsonLd();

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }} />

      <LangHtmlUpdater />
      <FaqEnhancer />
      <SiteHeader />
      <main className="container">{children}</main>
      <SiteFooter />
      <CookieBanner />
    </>
  );
}

