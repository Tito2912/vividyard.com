/* ==========================================================================
   Vividyard — assets/main.js
   Vanilla JS only. Light, accessible, Netlify-ready.
   Features:
   - Language auto-redirect (FR) on 1st visit + persistent user preference
   - One-button language switcher with ARIA updates
   - Cookie banner (Consent Mode v2): default denied, accept/reject/settings
   - YouTube (nocookie) click-to-play with lazy iframe
   - Small parallax helper (respects prefers-reduced-motion)
   - GA4 safety stubs when blocked by CSP; never errors
   - IndexNow stub (disabled)
   ========================================================================== */

(function () {
  'use strict';

  /* ----------------------------------------
     Utilities
  ---------------------------------------- */
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));
  const on = (el, ev, fn, opts) => el && el.addEventListener(ev, fn, opts);
  const prefersReducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;

  const DOMAIN = location.origin.replace(/\/$/, '');
  const CONSENT_COOKIE = 'vyd_consent';
  const CONSENT_LS_KEY = 'vyd_consent';
  const LANG_LS_KEY = 'langPref';
  const REDIR_SESSION_FLAG = 'vyd_lang_redirect_done';

  function setCookie(name, value, days = 180) {
    const maxAge = days * 24 * 60 * 60;
    document.cookie = `${encodeURIComponent(name)}=${encodeURIComponent(value)}; Max-Age=${maxAge}; Path=/; SameSite=Lax; Secure`;
  }

  function getCookie(name) {
    return document.cookie
      .split(';')
      .map(s => s.trim())
      .filter(Boolean)
      .map(s => s.split('=').map(decodeURIComponent))
      .reduce((acc, [k, v]) => (acc[k] = v, acc), {})[name];
  }

  function isFrenchPath(pathname) {
    return pathname === '/fr/' || pathname.startsWith('/fr/');
  }

  function getPathLang() {
    return isFrenchPath(location.pathname) ? 'fr' : 'en';
  }

  function getNavigatorLangStartsWithFr() {
    const langs = navigator.languages && navigator.languages.length ? navigator.languages : [navigator.language || ''];
    return (langs[0] || '').toLowerCase().startsWith('fr');
  }

  /* ----------------------------------------
     GA4 / Consent Mode v2 helpers
     - Default to denied
     - Update on Accept/Reject
     - Safe even if GA blocked by CSP
  ---------------------------------------- */
  // Ensure dataLayer/gtag exist to avoid runtime errors if CSP blocks inline snippet
  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function gtag(){ dataLayer.push(arguments); };

  function setConsentDefaultDenied() {
    try {
      // Deny all ad storages; allow only essential functionality/security.
      gtag('consent', 'default', {
        'ad_user_data': 'denied',
        'ad_personalization': 'denied',
        'ad_storage': 'denied',
        'analytics_storage': 'denied',
        'functionality_storage': 'granted',
        'security_storage': 'granted'
      });
    } catch (_) {}
  }

  function setConsentGrantedAnalytics() {
    try {
      gtag('consent', 'update', {
        'analytics_storage': 'granted',
        // Keep ads denied (we do not use ad tags)
        'ad_user_data': 'denied',
        'ad_personalization': 'denied',
        'ad_storage': 'denied'
      });
    } catch (_) {}
  }

  function setConsentDeniedAnalytics() {
    try {
      gtag('consent', 'update', {
        'analytics_storage': 'denied',
        'ad_user_data': 'denied',
        'ad_personalization': 'denied',
        'ad_storage': 'denied'
      });
    } catch (_) {}
  }

  function readStoredConsent() {
    // Priority: cookie, then localStorage
    const c = getCookie(CONSENT_COOKIE) || localStorage.getItem(CONSENT_LS_KEY);
    if (c === 'granted' || c === 'denied') return c;
    return null;
  }

  function storeConsent(value) {
    setCookie(CONSENT_COOKIE, value);
    try { localStorage.setItem(CONSENT_LS_KEY, value); } catch (_) {}
  }

  /* ----------------------------------------
     Cookie Banner (Accept / Reject / Settings)
  ---------------------------------------- */
  function initCookieBanner() {
    const banner = $('#cookie-banner');
    if (!banner) return;

    const btnAccept = $('#cookie-accept', banner);
    const btnReject = $('#cookie-reject', banner);
    const btnSettings = $('#cookie-settings', banner);

    // Inject minimal settings panel on demand
    let settingsOpen = false;
    let settingsWrap = null;
    function ensureSettingsUI() {
      if (settingsWrap) return settingsWrap;
      settingsWrap = document.createElement('div');
      settingsWrap.className = 'cookie-settings';
      settingsWrap.style.cssText = 'width:100%;padding-top:8px;border-top:1px solid #E2E8F0;display:none;';
      settingsWrap.innerHTML = `
        <form id="cookie-form" aria-label="Cookie settings" style="display:flex;gap:12px;align-items:center;flex-wrap:wrap">
          <label style="display:flex;align-items:center;gap:8px">
            <input type="checkbox" id="cookie-analytics" />
            <span>Analytics</span>
          </label>
          <div style="display:flex;gap:8px">
            <button type="submit" class="btn secondary">Save</button>
            <button type="button" id="cookie-cancel" class="btn ghost">Cancel</button>
          </div>
        </form>
      `;
      $('.cookie-inner', banner).appendChild(settingsWrap);

      const form = $('#cookie-form', settingsWrap);
      const chk = $('#cookie-analytics', settingsWrap);
      const current = readStoredConsent();
      if (current) chk.checked = current === 'granted';

      on(form, 'submit', function (e) {
        e.preventDefault();
        if (chk.checked) {
          storeConsent('granted');
          setConsentGrantedAnalytics();
        } else {
          storeConsent('denied');
          setConsentDeniedAnalytics();
        }
        hideBanner();
      }, { passive: false });

      on($('#cookie-cancel', settingsWrap), 'click', function () {
        settingsOpen = false;
        settingsWrap.style.display = 'none';
      });
      return settingsWrap;
    }

    function showBanner() {
      banner.hidden = false;
      banner.setAttribute('aria-hidden', 'false');
    }
    function hideBanner() {
      banner.hidden = true;
      banner.setAttribute('aria-hidden', 'true');
    }

    // Expose a tiny API to reopen banner
    window.VividyardConsent = {
      open() {
        showBanner();
        try { localStorage.removeItem(CONSENT_LS_KEY); } catch(_) {}
        setCookie(CONSENT_COOKIE, '', -1); // expire cookie to force choice again
      },
      status() {
        return readStoredConsent() || 'unset';
      }
    };

    // Wire buttons
    on(btnAccept, 'click', function () {
      storeConsent('granted');
      setConsentGrantedAnalytics();
      hideBanner();
    });

    on(btnReject, 'click', function () {
      storeConsent('denied');
      setConsentDeniedAnalytics();
      hideBanner();
    });

    on(btnSettings, 'click', function () {
      ensureSettingsUI();
      settingsOpen = !settingsOpen;
      settingsWrap.style.display = settingsOpen ? 'block' : 'none';
    });

    // Show if no decision stored
    const stored = readStoredConsent();
    if (!stored) {
      // Default denied immediately (defense in depth)
      setConsentDefaultDenied();
      showBanner();
    } else {
      // Apply stored choice on each load
      if (stored === 'granted') setConsentGrantedAnalytics();
      else setConsentDeniedAnalytics();
      hideBanner();
    }
  }

  /* ----------------------------------------
     Language: initial FR auto-redirect + toggle
  ---------------------------------------- */
  function initLanguage() {
    try {
      // One-time auto-redirect to /fr/ on first visit without preference
      const hasPref = !!localStorage.getItem(LANG_LS_KEY);
      const redirDone = !!sessionStorage.getItem(REDIR_SESSION_FLAG);
      if (!hasPref && !redirDone) {
        sessionStorage.setItem(REDIR_SESSION_FLAG, '1');
        if (getNavigatorLangStartsWithFr() && location.pathname === '/') {
          // Keep query/hash if present
          const q = location.search || '';
          const h = location.hash || '';
          location.replace(`/fr/${q}${h}`);
          return; // stop further init on this page
        }
      }

      // Language toggle button
      const btn = $('#lang-toggle');
      if (btn) {
        const target = btn.getAttribute('data-target') || '/';
        // Update ARIA label dynamically for clarity
        const goingToFr = target.startsWith('/fr/');
        btn.setAttribute('aria-label', goingToFr ? 'Switch language to French' : 'Switch language to English');
        btn.setAttribute('aria-pressed', 'false');

        on(btn, 'click', function () {
          // Persist user preference based on the target
          try {
            localStorage.setItem(LANG_LS_KEY, goingToFr ? 'fr' : 'en');
          } catch (_) {}
          btn.setAttribute('aria-pressed', 'true');
          location.href = target;
        });
      }
    } catch (_) {}
  }

  /* ----------------------------------------
     YouTube (nocookie) click-to-play
  ---------------------------------------- */
  function initVideo() {
    const wraps = $$('.video-wrap');
    if (!wraps.length) return;

    wraps.forEach(wrap => {
      const id = wrap.getAttribute('data-youtube-id');
      const title = wrap.getAttribute('data-youtube-title') || 'Video';
      if (!id) return;
      const posterBtn = $('.video-poster', wrap);
      if (!posterBtn) return;

      on(posterBtn, 'click', function () {
        // Build iframe lazily on user gesture
        const lang = getPathLang() === 'fr' ? 'fr' : 'en';
        const iframe = document.createElement('iframe');
        iframe.setAttribute('title', title);
        iframe.width = '560';
        iframe.height = '315';
        iframe.loading = 'lazy';
        iframe.decoding = 'async';
        iframe.setAttribute('allowfullscreen', '');
        iframe.setAttribute('referrerpolicy', 'strict-origin-when-cross-origin');
        iframe.setAttribute('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share');
        iframe.src = `https://www.youtube-nocookie.com/embed/${encodeURIComponent(id)}?autoplay=1&rel=0&modestbranding=1&hl=${lang}`;

        // Replace poster with iframe
        wrap.innerHTML = '';
        wrap.appendChild(iframe);
      }, { passive: true });
    });
  }

  /* ----------------------------------------
     Affiliate links hardening (safety)
  ---------------------------------------- */
  function hardenAffiliateLinks() {
    $$('a[href*="AFFILIATE_URL_PLACEHOLDER"]').forEach(a => {
      a.setAttribute('target', '_blank');
      // Keep rel list idempotent
      const rel = (a.getAttribute('rel') || '').split(/\s+/).filter(Boolean);
      ['nofollow', 'noopener', 'sponsored'].forEach(t => { if (!rel.includes(t)) rel.push(t); });
      a.setAttribute('rel', rel.join(' ').trim());
    });
  }

  /* ----------------------------------------
     Lightweight Parallax (optional)
  ---------------------------------------- */
  function initParallax() {
    if (prefersReducedMotion) return;
    const layers = $$('.parallax-layer');
    if (!layers.length) return;

    let ticking = false;
    function onScroll() {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const y = window.scrollY || 0;
          // Parallax factor per layer via data-speed (defaults small)
          layers.forEach(el => {
            const f = parseFloat(el.getAttribute('data-speed') || '0.08');
            el.style.transform = `translate3d(0, ${Math.round(y * f)}px, 0)`;
          });
          ticking = false;
        });
        ticking = true;
      }
    }
    on(window, 'scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ----------------------------------------
     Boot sequence
  ---------------------------------------- */
  // Apply default denied as early as possible (defense-in-depth)
  setConsentDefaultDenied();

  // When DOM is ready, init features
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start, { once: true });
  } else {
    start();
  }

  function start() {
    try {
      initLanguage();
      initCookieBanner();
      initVideo();
      hardenAffiliateLinks();
      initParallax();

      // If a consent decision already exists, reflect immediately
      const stored = readStoredConsent();
      if (stored === 'granted') setConsentGrantedAnalytics();
      if (stored === 'denied') setConsentDeniedAnalytics();
    } catch (_) {}
  }

  /* ----------------------------------------
     IndexNow Stub (disabled)
     To activate later, provide a key & enable fetch.
  ---------------------------------------- */
  /*
  function initIndexNow() {
    const endpoints = [
      'https://api.indexnow.org/indexnow',
      'https://www.bing.com/indexnow',
      'https://search.seznam.cz/indexnow'
    ];
    const urls = [`${DOMAIN}${location.pathname}`];

    endpoints.forEach(ep => {
      fetch(ep, {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({
          host: location.host,
          key: 'YOUR_INDEXNOW_KEY',
          keyLocation: `${DOMAIN}/YOUR_INDEXNOW_KEY.txt`,
          urlList: urls
        })
      }).catch(()=>{});
    });
  }
  // initIndexNow(); // <- disabled by requirement
  */

  /* ----------------------------------------
     Accessibility: keyboard focus visible tweak for language button
  ---------------------------------------- */
  on(document, 'keyup', function (e) {
    if (e.key === 'Tab') {
      document.body.classList.add('kbd-nav');
    }
  }, { passive: true });
})();
