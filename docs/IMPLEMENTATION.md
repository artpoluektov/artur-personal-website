# V2 implementation and review record

Date: 22 October 2026. Single project, no delegated threads.

## Sources and decisions

- [Drive source folder](https://drive.google.com/drive/folders/1gEbBxxxbF5tPbVzkK7QD169xTM5cHHM1): all ten relevant files audited (three Markdown briefs/copy files, two legal PDFs and five images).
- [Figma R8 desktop, node 43:8](https://www.figma.com/design/qtOSxMAvBIAQ4iX9RUAhy8/?node-id=43-8), [mobile, node 43:313](https://www.figma.com/design/qtOSxMAvBIAQ4iX9RUAhy8/?node-id=43-313).
- [Existing master brief](https://app.notion.com/p/2ad93fee82c580048c07c2bcf6528efb), [Brand](https://app.notion.com/p/2ad93fee82c580668d77c96b35c5162b).

The user selected R8 as the implementation baseline while explicitly saying it is near-final, not final. Figma MCP reached its Starter usage limit. The user authorized direct browser inspection instead; no further design gate was imposed. Current R8 was visible and inspected, including actual typography properties. An earlier audit describing desktop R8 as hidden is superseded.

HTML/CSS/JS with a dependency-free build is sufficient for this single content-led page and the existing static repository. It avoids a runtime hosting dependency. Copy is delivered in HTML, including closed accordions.

## Design mapping

| R8 block | Implementation |
|---|---|
| hero 43:9 | Header, one H1, coral CTA, transparent B&W portrait, curved transition |
| situations | Five cards; two wide then three columns on desktop, stacked on mobile |
| bets 43:63 | Indigo section, full intro paragraphs, three expandable alternatives, framework and sign-off |
| how 43:91 | Coral Clarity Call card; four format disclosures showing title and first sentence |
| testimonials | Two supplied quotes only, indigo background |
| about 43:131 | Serif headline beside complete biography, approved company names strip |
| thinking 43:147 | Supplied stage photo, five topic disclosures, speaking and Substack links |
| mentoring | Indigo block and inline contact link |
| faq | Seven native disclosures, first open |
| contact 43:222 | Coral invitation beside accessible conditional form |
| footer | Explore, Follow, Legal and local PDF links |

Instrument Serif and IBM Plex Sans were confirmed in Figma and are hosted locally with OFL licenses. Tokens: Deep Indigo #2C1E4A, Electric Violet #5B3BB6, Coral Red #E94F37, Charcoal #222, White #FFF. Desktop content width 1264px, section margins/padding informed by R8's 88px spacing. Responsive adaptations preserve copy and avoid clipping.

The current implementation follows R8's composition and disclosure patterns. It is not a claim of pixel-perfect parity: noise/complex background artwork is approximated with CSS gradients, transitions are responsive curves, and full copy makes some sections taller. R8's shortened previews never delete text. The two Strategic bets intro paragraphs remain fully visible. Header CTA follows R8's light treatment. Bright small text on dark backgrounds uses lighter accessible shades; normal text pairs meet 4.5:1.

## Copy and deliberate functional additions

No marketing paragraphs were rewritten or cut. Copy v3 overrides older R7/Notion wording. No invented claims, metrics, logos, cases, third quote, video or podcast. Missing logo assets use the expressly permitted company-name strip.

`content.json` holds all visible copy. Functional additions are limited to the honest unavailable-form notice/email fallback, analytics-not-installed notice and accessibility labels (Menu, Close, Skip to content). These are documented exceptions needed to make the unfinished integration clear. The approved marketing text is unchanged. Metadata and image alt text follow the separate SEO brief.

Legal PDFs are the supplied originals, unchanged. The available Privacy PDF does not include the requested explicit cookies section and mentions Google Analytics. It needs review against the actual launch setup. The share image is a draft using exactly the two specified text lines; visual approval is pending with the overall design.

## Verification

- Build succeeds with Node 24; no package dependencies. Static source and dist generated.
- Regression checks pass: 78 approved text groups plus all substantive source paragraphs, local assets, anchors, one H1, unique IDs, metadata JSON, required counts, no fake sending, no third-party scripts/embeds.
- Measured normal text contrast pairs: white/indigo 15.09:1; charcoal/light gray 14.47:1; dark/coral 4.54:1; white/violet 7.65:1; light coral/indigo 7.77:1; tag purple/light violet 8.12:1.
- Browser review at 360px and 1440px: no horizontal overflow. Mobile menu opens/closes; anchor navigation works; Speaking preselects and displays event fields; Mentoring hides timeline/budget; invalid email shows inline approved error; send remains disabled without endpoint.
- Cookie dialog opens/saves; Reject persists across navigation. No analytics integration exists, so acceptance does not start tracking.
- Cal.com and Substack return HTTP 200. LinkedIn automated check returns HTTP 999 (platform restriction); URL retained from V1, not claimed independently verified.
- Both hosted PDF assets return HTTP 200; unknown preview route returns HTTP 404. No browser console warnings/errors observed during interaction checks.

## Outstanding before production

Artur's visual approval, real form provider/endpoint and delivery tests, accurate launch Privacy Policy, final share-image approval, server-specific HTTPS/canonical setup and post-deployment performance/search-console checks. No Lighthouse/Core Web Vitals field measurements, external schema-validator submission or live backend delivery are claimed. V1/main remains unchanged; V2 is for PR review only.

## Feedback preview — 23 October 2026

Implemented the completed feedback batch: sticky header and serif wordmark; brand coral accents; About immediately after hero with full biography preserved in a wider centered block; all 13 supplied monochrome company logos with slow rightward motion, pause control and reduced-motion fallback; matched service preview/body type sizes; testimonial credits; speaking introduction beside photo on desktop and above on mobile; linked mentoring programs; purple FAQ accents; compact two-column desktop interest choices; coral submit; aligned footer rows.

Footer uses a light purple tint (#b79aef) for legibility on its dark background. Coral emphasis links/credits use 19px semibold to meet large-text contrast. Marketing content.json and approved-copy.md are unchanged. Product Circle asset was not substituted for Productized.

Pending before launch: connect and test a real same-origin Cloudflare contact endpoint and email delivery provider. The unavailable notice and disabled submission remain until that connection is working; no successful delivery is simulated. No production deployment, DNS change or main merge authorized at this review stage.
