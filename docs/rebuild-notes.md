# Source reconciliation and remaining review

## What was used

- Authoritative source: framer-export.zip recovered from the referenced ChatGPT conversation attachment. `/mnt/data` belongs to the earlier conversation environment; its attachment is now accessible through the local cached file path.
- Existing project: Kimberillo Website, artist-site. Initial tracked working tree was clean; the only untracked file was .DS_Store.
- The Framer desktop canvas is 1280px wide, with larger desktop, tablet, and mobile variants. The design uses white, olive #babd63, lavender #d3c7f3, coral #ff9696, GT Walsheim, and Young Serif.
- Preserved Framer section order: introduction, Nature’s Dance triptych, digital illustration, printmaking, sketchbook, photography, footer. Preserved artwork titles, media, and years.
- Existing repository contributes local fonts, higher-resolution artwork for Song of the Sea, Promise of the Wind, and Liminal Spaces, biography and artist statement, greeting-card promotion, Shopify URL, and social links.
- Original root files and assets remain for reference. Previous index and about snapshots are also under docs. Only public/ is published.

## Deliberate changes

- Native semantic HTML replaces the Framer canvas, generated layout wrappers, React runtime, and analytics.
- Responsive CSS preserves the desktop spacing, olive triptych, lavender printmaking section, rotated portrait, and coral footer. Mobile artwork stacks in reading order.
- Sketchbook slides are displayed as a crawlable three-image gallery rather than hiding images inside a carousel. All images remain available without JavaScript.
- Added the existing shop promotion after the artwork, and an FAQ based only on supported facts.
- Artist identity and current media are explicit. Page metadata, Person/WebSite/WebPage/VisualArtwork JSON-LD, sitemap, robots, internal links, legacy route redirects, and custom 404 are included.
- No FAQPage JSON-LD, llms.txt, artificial AI-specific markup, invented artwork prices, shipping policies, commission availability, or contact email.
- The biography preserves the original substance while shortening the influence discussion and omitting its long quotation. Original wording remains in docs/previous-about.html.

## Content review still required

- No published Framer URL was supplied. The supplied domain could not be retrieved with the web reader. Biography uses existing repo copy and user-provided identity details. Contact uses verified-in-repo social/shop destinations instead of inventing an email address. The original Framer secondary-page wording and FAQ were not recoverable from the archive.
- FAQ answers are new factual copy, not recovered original FAQ text. Confirm desired additional questions and policies before adding them.
- Confirm the shop promotion still reflects the current offering. The link and collection wording are carried from the existing repository; live checkout and product availability were not tested.
- Archive caps several images at 512px. Responsive derivatives never upscale; obtain original files for sharper large displays. Where available, larger originals from the existing repo were used.
- Actual Core Web Vitals require real traffic or deployed testing; no performance score is claimed.
- Netlify redirects, security headers, custom-domain behavior, and production 404 behavior require a deployment check. Nothing has been deployed.

## Applying this staged rebuild

This copy was prepared in the chat workspace because access to write the original project was not granted. Compare the added public/, netlify.toml, README.md, docs/, and scripts/ with the original repository before copying them in. No originals need to be deleted, and no Git commits have been made.

## Validation completed

- Structural checker passed on four HTML pages and all three sitemap routes, including local links and anchors, image alt text/dimensions/loading policies, CSS assets, canonical/Open Graph consistency, JSON-LD parsing and entity references, and visible artwork anchors.
- All 32 generated WebP images decoded successfully with Pillow.
- Published folder is approximately 2.48 MiB including all image variants and fonts. Combined HTML/CSS is approximately 36.8 KiB. These are file sizes, not browser performance scores.
- Visual QA is unverified: the sandbox blocked local server binding and launching a headless browser. The browser tool also rejected file:// URLs under its URL security policy. No alternative browser route was used after that rejection.
- Keyboard interactions and responsive rendering require browser verification. FAQ uses native details/summary, navigation remains visible at small sizes, and the CSS includes visible focus states and a skip link.

## Codex application and browser review, October 8, 2026

- Applied the package to the `rebuild` branch of `artist-site`, preserving original root files and assets.
- Re-ran the structural checker successfully on all four HTML pages and three sitemap routes.
- Reviewed homepage, biography, and contact layouts in the in-app browser at desktop (1440 × 1000) and mobile (390 × 844) widths. Checked homepage image loading and horizontal overflow on mobile pages.
- Confirmed the first native FAQ disclosure opens with a click and closes with Enter.
- This is an initial browser review, not a comprehensive accessibility, cross-browser, or production deployment audit. Existing content and image-resolution review items above still apply.

## Sketchbook gallery update

- Replaced the three-column sketchbook layout with a horizontal, scroll-snapping gallery based on the supplied reference. All spreads remain in the HTML and can be scrolled without JavaScript.
- Added local JavaScript for previous/next buttons, disabled end states, resize handling, and reduced-motion support. Netlify permits same-origin scripts for these controls.
- Checked the layout at 1080px desktop and 390px mobile widths, arrow navigation, keyboard button activation, and absence of page-level horizontal overflow.
- Existing source images are capped at 512px wide and look soft in the enlarged desktop gallery. Higher-resolution originals are needed for sharper rendering.
