# Artur Poluektov website V2

Static HTML/CSS/JavaScript built from the approved copy v3 and Figma R8. No framework, package installation, client-side content fetch or hosting platform dependency.

## Build and preview

Requires Node.js 22 or newer. No npm install needed.

```sh
npm run build
npm test
npm run preview
```

Open http://127.0.0.1:4173. Preview responses carry `X-Robots-Tag: noindex, nofollow`. Only deploy the contents of `dist/`, after approval.

- `content.json`: all page copy, form labels, options and functional UI strings.
- `config.json`: canonical domain, external URLs and optional same-origin form endpoint.
- `scripts/build.mjs`: generates static HTML, metadata, sitemap and deployment folder.
- `scripts/site.js`: progressive interactions, form validation and consent preferences.
- `styles/`: responsive layout and self-hosted fonts.
- `docs/approved-copy.md`: unchanged copy source for regression checks.
- `docs/IMPLEMENTATION.md`: source mapping, QA and known limitations.
- `docs/DEPLOYMENT.md`: self-hosting and rollback instructions.

## Production boundary

This branch is `website-v2`. The V1 on `main` remains the production reference. Do not merge or deploy V2 until Artur approves. No GitHub Pages or deployment workflow is added.

## Contact form

The form is **not connected to a receiving backend**. `formEndpoint` is null, the send button is disabled and an explicit email fallback is visible. Fields, validation and interest routing can be reviewed. No fake success state or simulated submission is used.

To enable it, implement and test the server contract in `docs/DEPLOYMENT.md`, name the processor in the Privacy Policy, then configure a same-origin `/api/` URL and rebuild. No secrets belong in this repository.
