# W1ZZYDEV Company Site

Official static website for W1ZZYDEV, a digital and software development studio.

The site presents W1ZZYDEV services, real projects, reviews, pricing, contact channels and the company positioning in Russian and English.

## Stack

- Static HTML pages
- CSS custom properties and responsive layouts in `styles.css`
- Vanilla JavaScript in `app.js`
- Supabase REST API for reviews and moderation
- GitHub Pages publishing

## Structure

- `index.html` - main landing page and company positioning
- `services/index.html` - service directions and CTAs
- `projects/index.html` - real project case overview
- `projects/*/index.html` - individual case pages
- `pricing/index.html` - project starting points and budgets
- `about/index.html` - studio story, values and technology
- `contact/index.html` - project request form and contact links
- `reviews/index.html` - public reviews and review submission form
- `reviews/moderation/index.html` - private moderation interface
- `reviews/reset-password/index.html` - moderator password reset
- `styles.css` - visual system, responsive layout, themes and components
- `app.js` - language/theme switchers, navigation, forms, reviews and progressive enhancements
- `assets/` - brand images, favicons and project screenshots
- `robots.txt`, `sitemap.xml`, `site.webmanifest` - SEO and PWA metadata
- `supabase-config.json` - public Supabase URL and anon publishable key
- `404.html` - GitHub Pages fallback page
- `supabase/admin-panel-schema.sql` - test SQL schema and RLS policies for expanding the existing Supabase moderation panel

## Local Preview

Serve the project as a static site from the repository root:

```bash
python3 -m http.server 4173
```

Then open:

```text
http://localhost:4173/
```

Use `?test` on reviews pages to test reviews with local IndexedDB instead of Supabase:

```text
http://localhost:4173/reviews/?test
```

## Editing Process

1. Check current state:

```bash
git status --short --branch
```

2. Edit only the pages, styles and scripts related to the change.
3. Keep all visible copy bilingual with `data-ru` and `data-en` attributes.
4. Preserve real contacts, project links, reviews and brand assets.
5. Do not add fictional metrics, clients, awards or project results.
6. Update cache versions in HTML when `styles.css` or `app.js` changes.
7. Test desktop and mobile widths before publishing.

## Publishing

The public site is published from the `main` branch through GitHub Pages.

Before publishing:

```bash
git diff
git status --short
```

Commit only intentional changes, push to `main`, then verify the published site after GitHub Pages updates.

## Production Checklist

- Confirm `CNAME` still points to `w1zzydev.com`.
- Apply and verify `supabase/admin-panel-schema.sql` in a Supabase test project before relying on leads, dialogs, support or client access.
- Confirm `robots.txt`, `sitemap.xml`, canonical URLs and Open Graph images use the production domain.
- Check all external contact links after deploy.
- Check the main request form, contact form, reviews form, RU/EN switcher and mobile menu.
- Verify Supabase Row Level Security for reviews: public insert should create pending reviews only, public select should return published reviews only, moderation actions should require an authenticated moderator.
- The project request forms are static frontend flows. For true server-side validation, durable lead storage, email delivery and stronger rate limiting, connect a backend endpoint or Supabase Edge Function before relying on the form as the only lead channel.

## Environment

See `.env.example` for public configuration notes. Only browser-safe Supabase URL and anon/publishable keys belong in this static frontend. Private keys, service-role keys and passwords must stay outside the repository.

## SEO And Accessibility Notes

- Keep one `h1` per page.
- Keep `title`, `description`, canonical URLs, Open Graph and sitemap entries current.
- Use descriptive `alt` text for meaningful images and empty `alt=""` for decorative icons.
- Preserve keyboard focus states and accessible labels for forms, navigation and controls.
- Respect `prefers-reduced-motion` for animation-heavy effects.

## Security Notes

- Do not place private service-role keys or passwords in frontend files.
- `supabase-config.json` must contain only the public Supabase URL and anon/publishable key.
- Review moderation depends on Supabase auth and database policies; keep Row Level Security configured in Supabase.
