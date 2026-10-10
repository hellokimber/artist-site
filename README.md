# Kimberillo

Static portfolio for Kimber Helm. HTML, CSS, local fonts, and responsive WebP images. No application runtime, build dependencies, or build command. A small local script enhances the sketchbook gallery with arrow controls; native horizontal scrolling works without JavaScript.

## Preview

Run `python3 -m http.server 8765 --directory public` from the repository and open http://localhost:8765.

## Netlify

Use `public` as the publish directory and leave the build command empty. The checked-in `netlify.toml` defines this setting, legacy URL redirects, caching, and security headers. Use kimberillo.com as the primary domain. Configure the www hostname as a redirect to the primary domain in Netlify. Confirm domain ownership and DNS before publishing.

The deployment is intentionally limited to `public/`; the older site, original assets, and reconciliation notes remain outside the published directory for reference.

## Content and provenance

See [docs/rebuild-notes.md](docs/rebuild-notes.md). The source Framer archive is an editor snapshot, not a complete published site export. Some artwork assets are limited to 512 pixels. No missing artwork detail has been synthesized.

## Editing

Edit the static HTML files directly. Update visible content and JSON-LD together when changing artwork facts or artist identity. Canonical, Open Graph, JSON-LD, robots, and sitemap URLs currently assume https://kimberillo.com. If the primary domain changes, update all of them. Use descriptive image alt text and retain intrinsic width/height values. Existing original images remain under the root assets directory.

## Validation

Run `python3 scripts/check_site.py` to validate local links, image dimensions, page metadata, JSON-LD references, sitemap URLs, and semantic structure. This is a structural check, not a substitute for browser or deployed Netlify testing.

## Newsletter integration

The homepage newsletter submits directly to Kit form 10021383 using its public signup endpoint. Local JavaScript provides inline confirmation and error feedback; without JavaScript, the form posts directly to Kit. The Netlify security policy permits this endpoint. No API key is needed. Success asks subscribers to check their inbox for confirmation. A real signup and confirmation email still need verification after deployment.

Run `node scripts/check_newsletter.cjs` to check newsletter response handling with simulated Kit responses. These checks never send a signup to Kit.
