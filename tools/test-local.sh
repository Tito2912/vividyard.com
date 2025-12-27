#!/usr/bin/env bash
# tools/test-local.sh — Vividyard local smoke tests
# Purpose:
# - Quick local checks before pushing to Netlify
# - Verifies required files exist
# - Serves the site locally and asserts SEO/UX essentials:
#   * Canonicals (with trailing slash for homes)
#   * Hreflang (x-default/en + fr-FR)
#   * GA4 snippet presence (exact ID)
#   * Consent banner markup
#   * YouTube nocookie setup
#   * Affiliate link placeholder present
#   * Sitemaps & robots reachable
# - Checks redirects config and Netlify headers existence (static validation)
#
# Requirements: bash, grep, curl, python3 (or python fallback)

set -euo pipefail

PORT="${PORT:-8080}"
HOST="127.0.0.1"
ORIGIN="http://${HOST}:${PORT}"
GREEN='\033[0;32m'; RED='\033[0;31m'; YEL='\033[0;33m'; NC='\033[0m'
PASS=0; FAIL=0

title() { printf "\n${YEL}==> %s${NC}\n" "$*"; }
ok()    { printf "  ${GREEN}✓${NC} %s\n" "$*"; PASS=$((PASS+1)); }
bad()   { printf "  ${RED}✗${NC} %s\n" "$*"; FAIL=$((FAIL+1)); }

need() {
  command -v "$1" >/dev/null 2>&1 || { echo "Missing dependency: $1"; exit 2; }
}

get() {
  # usage: get /path
  curl -fsS -A "VividyardTest/1.0" "$ORIGIN$1"
}

has() {
  # usage: has "needle" <<< "$HAYSTACK"
  grep -qE "$1"
}

stop_server() {
  if [[ -n "${SERVER_PID:-}" ]]; then
    kill "$SERVER_PID" >/dev/null 2>&1 || true
    wait "$SERVER_PID" 2>/dev/null || true
  fi
}

cleanup() { stop_server; }
trap cleanup EXIT

title "Checking dependencies"
need curl
need grep
if command -v python3 >/dev/null 2>&1; then PY=python3; else PY=python; fi
ok "curl found"
ok "grep found"
ok "$PY will be used for local server"

title "Verifying required files exist"
FILES=(
  "index.html"
  "legal-notice.html"
  "privacy-policy.html"
  "blog.html"
  "blog-1.html"
  "fr/index.html"
  "fr/mentions-legales.html"
  "fr/politique-de-confidentialite.html"
  "fr/blog.html"
  "fr/blog-1.html"
  "assets/styles.css"
  "assets/main.js"
  "sitemap.xml"
  "sitemaps/sitemap-en.xml"
  "sitemaps/sitemap-fr.xml"
  "robots.txt"
  "netlify.toml"
  "_redirects"
  "tools/test-local.sh"
)
for f in "${FILES[@]}"; do
  if [[ -f "$f" ]]; then ok "$f present"; else bad "$f missing"; fi
done

title "Starting local server on ${ORIGIN}"
$PY -m http.server "$PORT" --bind "$HOST" >/dev/null 2>&1 &
SERVER_PID=$!
sleep 0.6
if kill -0 "$SERVER_PID" >/dev/null 2>&1; then ok "Server started (PID $SERVER_PID)"; else bad "Server failed to start"; fi

title "HTTP reachability"
for path in "/" "/fr/" "/blog.html" "/fr/blog.html" "/robots.txt" "/sitemap.xml" "/sitemaps/sitemap-en.xml" "/sitemaps/sitemap-fr.xml"; do
  if get "$path" >/dev/null; then ok "200 $path"; else bad "Cannot GET $path"; fi
done

title "Home (EN) canonical + hreflang"
HOME_EN="$(get /)"
echo "$HOME_EN" | has 'rel="canonical"[[:space:]]+href="https://vividyard.com/"' && ok "Canonical EN home with trailing slash" || bad "Canonical EN home mismatch"
echo "$HOME_EN" | has 'hreflang="x-default"' && ok "x-default present" || bad "Missing x-default"
echo "$HOME_EN" | has 'hreflang="en"' && ok "en present" || bad "Missing hreflang=en"
echo "$HOME_EN" | has 'hreflang="fr-FR"' && ok "fr-FR present" || bad "Missing hreflang=fr-FR"

title "Home (FR) canonical + hreflang"
HOME_FR="$(get /fr/)"
echo "$HOME_FR" | has 'rel="canonical"[[:space:]]+href="https://vividyard.com/fr/"' && ok "Canonical FR home with trailing slash" || bad "Canonical FR home mismatch"
echo "$HOME_FR" | has 'hreflang="x-default"' && ok "x-default present (FR page points to EN root)" || bad "Missing x-default (FR)"
echo "$HOME_FR" | has 'hreflang="en"' && ok "en present (FR alt)" || bad "Missing hreflang=en on FR"
echo "$HOME_FR" | has 'hreflang="fr-FR"' && ok "fr-FR present" || bad "Missing hreflang=fr-FR on FR"

title "GA4 snippet presence (ID G-MSJJLZS55R)"
for p in "/" "/fr/" "/blog.html" "/fr/blog.html"; do
  PAGE="$(get "$p")"
  echo "$PAGE" | has 'https://www\.googletagmanager\.com/gtag/js\?id=G-MSJJLZS55R' && ok "gtag loader present on $p" || bad "gtag loader missing on $p"
  echo "$PAGE" | has "gtag\\('config',[[:space:]]*'G-MSJJLZS55R'\\)" && ok "gtag config present on $p" || bad "gtag config missing on $p"
done

title "Consent banner markup"
for p in "/" "/fr/" "/blog.html" "/fr/blog.html"; do
  PAGE="$(get "$p")"
  echo "$PAGE" | has 'id="cookie-banner"' && ok "cookie banner present on $p" || bad "cookie banner missing on $p"
done

title "YouTube (privacy-enhanced) video embedding"
echo "$HOME_EN" | has 'youtube-nocookie\.com' && ok "EN home includes youtube-nocookie" || bad "EN home missing youtube-nocookie"
echo "$HOME_FR" | has 'data-youtube-id="K2ikNSRqh8E"' && ok "FR home includes video poster" || bad "FR home missing video poster"

title "Affiliate link placeholder present"
AFF_EN="$(echo "$HOME_EN" | grep -Eo 'href="AFFILIATE_URL_PLACEHOLDER"' || true)"
AFF_FR="$(echo "$HOME_FR" | grep -Eo 'href="AFFILIATE_URL_PLACEHOLDER"' || true)"
[[ -n "$AFF_EN" ]] && ok "Affiliate placeholder found on EN home" || bad "Affiliate placeholder not found on EN home"
[[ -n "$AFF_FR" ]] && ok "Affiliate placeholder found on FR home" || bad "Affiliate placeholder not found on FR home"

title "OG/Twitter basic tags on homes"
echo "$HOME_EN" | has 'property="og:image"[[:space:]]+content="/images/capture-hero-leonardo\.ai-en\.png"' && ok "EN og:image correct" || bad "EN og:image missing/wrong"
echo "$HOME_FR" | has 'property="og:image"[[:space:]]+content="/images/capture-hero-leonardo\.ai-fr\.png"' && ok "FR og:image correct" || bad "FR og:image missing/wrong"

title "Robots & sitemaps"
ROB="$(get /robots.txt)"
echo "$ROB" | has '^Sitemap:[[:space:]]+https://vividyard\.com/sitemap\.xml' && ok "robots.txt references sitemap" || bad "robots.txt missing sitemap reference"

title "Static validation of redirects and headers"
if grep -qE '^/fr[[:space:]]+/fr/[[:space:]]+301!' _redirects; then ok "_redirects has FR trailing-slash rule"; else bad "_redirects missing FR trailing-slash rule"; fi
if grep -qE '^/index\.html[[:space:]]+/[[:space:]]+301!' _redirects; then ok "_redirects canonicalizes /index.html"; else bad "_redirects missing /index.html rule"; fi
if grep -q "Content-Security-Policy" netlify.toml; then ok "CSP defined in netlify.toml"; else bad "CSP not found in netlify.toml"; fi
if grep -q "Strict-Transport-Security" netlify.toml; then ok "HSTS set"; else bad "HSTS not set"; fi

title "No external font loads (system fonts only)"
if ! grep -RiqE 'fonts\.(googleapis|gstatic)\.com|@font-face' .; then
  ok "No external font providers referenced"
else
  bad "External font reference detected"
fi

title "Summary"
TOTAL=$((PASS+FAIL))
printf "${YEL}Tests:${NC} %d  ${GREEN}Passed:${NC} %d  ${RED}Failed:${NC} %d\n" "$TOTAL" "$PASS" "$FAIL"

if [[ "$FAIL" -gt 0 ]]; then
  printf "${RED}Some checks failed. Please review the messages above.${NC}\n"
  exit 1
else
  printf "${GREEN}All checks passed.${NC}\n"
fi
