'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { LanguageSelect } from '@/components/LanguageSelect';
import { blogIndexPath, getLangFromPathname, homePath, UI_TRANSLATIONS, SITE } from '@/lib/site';

export function SiteHeader() {
  const pathname = usePathname() ?? '/';
  const lang = getLangFromPathname(pathname);
  const t = UI_TRANSLATIONS[lang];

  const home = homePath(lang);
  const blog = blogIndexPath(lang);

  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <header className="header">
      <div className="header-inner">
        <Link aria-label={SITE.brandName} className="brand" href={home}>
          <img
            alt={`${SITE.brandName} logo`}
            className="brand-logo"
            decoding="async"
            height={28}
            src="/images/logo.png"
            width={140}
          />
          <span className="sr-only">{SITE.brandName}</span>
        </Link>

        <div className="header-right">
          <button
            aria-controls="site-nav"
            aria-expanded={open}
            aria-label={t.menu}
            className="burger"
            onClick={() => setOpen((v) => !v)}
            type="button"
          >
            <span />
            <span />
            <span />
          </button>

          <nav aria-label="Primary" className={`nav ${open ? 'open' : ''}`} id="site-nav">
            <Link href={blog}>{t.blog}</Link>
            <Link className="btn cta" href={blog}>
              {t.cta}
            </Link>
          </nav>

          <LanguageSelect />
        </div>
      </div>
    </header>
  );
}
