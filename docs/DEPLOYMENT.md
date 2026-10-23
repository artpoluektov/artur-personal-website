# Deployment to Artur's own server

## Review first

Do not deploy over V1 or merge this branch before Artur approves the PR. Build and inspect V2 locally or on a separate staging hostname/directory with HTTP authentication and `X-Robots-Tag: noindex, nofollow`. Never use a staging hostname as the canonical production URL.

## Static hosting

1. Run `npm run build` and `npm test` using Node.js 22+ on the build machine. The production server does not need Node.js.
2. Back up the current production document root and server configuration. Keep the previous release available for rollback.
3. Upload **only the contents of `dist/`** into a new release directory. Do not upload source documents, `.git`, scripts used for building, credentials or `content.json`.
4. Preview that directory independently. Confirm all images, fonts, PDFs, anchors and the contact notice work.
5. After approval, point the website's document root or release symlink at the new directory. Keep the old release intact.
6. Serve HTTPS for www.arturpoluektov.com. Redirect HTTP and the non-www hostname permanently to https://www.arturpoluektov.com/.
7. Serve missing URLs with HTTP 404 and `404.html`, not a 200 SPA fallback. Serve HTML/CSS/JS/font/PDF MIME types correctly.
8. Enable Brotli or gzip for text. Cache HTML with revalidation; use short/revalidated caching for these unversioned asset filenames. Do not mark unversioned assets immutable.
9. Verify the live canonical, sitemap, robots.txt, HTTPS redirects and both PDFs. Remove staging-only noindex headers from production. Verify Search Console/Bing ownership and submit the sitemap separately.
10. Rollback: point the document root/symlink back to the preserved V1 release. DNS changes are unnecessary.

The exact virtual-host syntax depends on the server (Nginx, Apache or hosting panel). No server configuration or DNS was changed by this work.

Suggested security headers: `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, and CSP `default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self'; font-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'self'; frame-ancestors 'none'; form-action 'self'`. Validate the CSP with your server and structured-data processing before enabling. Use HSTS only after HTTPS is confirmed across the relevant hostnames.

## Real contact endpoint: pending integration

No provider, credentials or receiving endpoint were supplied. The website intentionally cannot send yet. The supplied brief names art.cpm@gmail.com; confirm the recipient when configuring delivery.

Implement a same-origin endpoint such as `/api/contact` behind HTTPS, separate from the static server:

- Accept JSON POST only. Validate required name, email, company, role, message and consent on the server. Bound field/body lengths; reject unexpected types and role/interest values. Validate email and normalize company website separately.
- Accept `interest` as an array. Optional keys: timeline, budget, source, event0, event1. Hidden conditional controls are disabled and excluded by the client.
- Reject honeypot `website_confirm` when nonempty, use server-side rate limiting and same-origin checks, and prevent email-header injection. No reCAPTCHA or third-party browser scripts.
- Send the enquiry to the confirmed recipient through the chosen mail provider. Do not store enquiries elsewhere or log raw payloads. Configure credentials in the server environment only.
- Return HTTP 2xx JSON `{ "ok": true }` only after the provider accepts the message. Use non-2xx on failure; do not report success for delivery rejection. The client has a 15-second timeout and shows the approved failure copy.
- Name the processor and actual retention rules in the Privacy Policy. The supplied PDF needs a cookies/privacy review before launch; it currently mentions Google Analytics even though no analytics is installed.
- End-to-end test successful delivery into the recipient inbox, invalid fields, absent consent, honeypot, rate limiting, provider failure and timeout. This has **not** been tested because no backend exists.
- Then set `formEndpoint` in `config.json` to the same-origin `/api/` path and rebuild. The UI will enable the send button. Update the availability assertion in the regression test to match the configured state.

## Analytics and cookies

No analytics, third-party scripts, embeds or tracking pixels are installed. Accept and Reject have equal styling. The only storage is the essential consent choice, timestamp and version; unavailable analytics remains false. The disabled analytics row explains this explicitly. Adding analytics requires an implementation of loading, withdrawal and cookie cleanup, a policy update and a consent-version increment; changing the checkbox alone is insufficient.

## External scheduling

Cal.com and Substack are ordinary outbound links. Confirm the Cal.com event is called Clarity Call, lasts 30 minutes and asks only company website and context. The website does not modify the event.

## Cloudflare Pages contact delivery

Production branch: website-v2. Build: npm run build && npm test. Output: dist.
Set RESEND_API_KEY as an encrypted Production secret (Sending access restricted to arturpoluektov.com). Redeploy after changing secrets. The root functions/api/contact.js is bundled automatically by Pages; dist/_routes.json limits invocation to /api/*.

Enquiries are sent through Resend from contact@arturpoluektov.com to art.cpm@gmail.com; Reply-To is the validated visitor email. The key is never included in browser assets. The endpoint validates required fields, consent, size, same-origin requests, honeypot and signed expiring form tokens. Resend idempotency prevents duplicate sends for the same token. The five-attempt/ten-minute throttle is best-effort per isolate, not a global rate limit; Turnstile or a durable limit is a future hardening option if abuse occurs. No user payloads or secrets are logged. Provider failure returns an error and retains the form for retry. Success confirms provider acceptance, not inbox delivery.

Verify a real test enquiry arrives before launch. Update the privacy notice for Cloudflare/Resend processing before connecting the public domain. Local static preview and Vercel do not execute Pages Functions; test delivery on the Cloudflare pages.dev deployment. No DNS or production-main changes are made by this code.
