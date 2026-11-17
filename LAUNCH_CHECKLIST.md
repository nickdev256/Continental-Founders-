# Continental Founders — pre-launch checklist

Last reviewed: 17 November 2026

## Done in the launch-readiness pass

### Mobile

- [x] All 24 public pages measured at 375px and 320px. Nothing scrolls sideways, and headings stay at 30–42px.
- [x] Every link and button people tap on phones is now at least 44px tall: footer links, "Explore…" links, back links, tabs, video controls, slideshow dots and icon buttons.
- [x] Insight articles have readable labels (12px instead of 10.4px) and the same 20px side margin as the rest of the site.
- [x] On phones, a slim "Apply now" bar appears on the fellowship pages after the hero. It hides at the footer and can be dismissed.

### Speed

- [x] Pages load on demand. The first download is 496 KB instead of 1.16 MB (162 KB compressed, down from 305 KB), and the first stylesheet is 73 KB instead of 684 KB.
- [x] The browser-tab icon is 4–18 KB instead of 1.2 MB.
- [x] Two unused fonts were removed. Montserrat now loads straight from `index.html` instead of through a slower CSS import.
- [x] The homepage video doesn't play automatically for visitors with data saver on or a slow connection.
- [x] The remaining small images and the gallery slideshow images load only when needed.

### SEO

- [x] The sitemap lists all 25 public pages, at the `www` address.
- [x] robots.txt points to the right sitemap and keeps `/admin/` and the application receipt page out of search results.
- [x] Event, insight and venture pages use their own title, summary and image for Google, browser tabs and link previews.
- [x] Event pages include structured event data (name, date, place), so Google can show them in event results.

### Conversion

- [x] The navbar's gold button is now "Apply now" and leads to the application.
- [x] Tracking is ready but switched off until an analytics ID is added (see below). It records:
  - page visits
  - Apply clicks
  - application started and submitted
  - contact form sent
  - newsletter sign-ups
  - clicks to other websites

---

## Before launch — must do

- [ ] **Turn on analytics.** In Vercel → Project → Settings → Environment Variables, add ONE of these, then redeploy:
  - `VITE_PLAUSIBLE_DOMAIN = www.continentalfounders.org` (recommended: no cookies, so no cookie banner is needed), or
  - `VITE_GA_ID = G-XXXXXXXXXX` (Google Analytics 4: free, but sets cookies, so EU visitors would need a consent banner).

  The Privacy page updates its wording to match automatically.
- [ ] **Set up goals** in the analytics dashboard: `application_submit`, `application_start`, `contact_submit`, `newsletter_subscribe` and `apply_click`.
- [ ] **Compress the homepage video** (`public/assets/tech-web.mp4`, 43 MB). Re-export it at 720p H.264, aiming for under 8 MB; HandBrake is a free tool for this. Keep the same file name.
- [ ] **Backend speed.** The API runs on Render's free plan, which goes to sleep. The first visitor after a quiet period waits 30–60 seconds for events, insights and the gallery to load. Upgrade to a paid instance, or add an uptime ping every 10 minutes.
- [ ] **Check the production API address:** `VITE_API_URL` in Vercel must point to the Render backend.
- [ ] **Send real test submissions from a phone:**
  - [ ] the contact form
  - [ ] the footer newsletter
  - [ ] the Insights newsletter
  - [ ] a full CFCV application with a real CV

  Confirm each one arrives in the admin and that any emails go out.
- [ ] **Legal:**
  - [ ] Have the Privacy policy reviewed (Uganda and US law).
  - [ ] Write the Terms of use and Accessibility statement. They currently say "being prepared".
- [ ] **Fix the Facebook link.** The footer icon points to `facebook.com/YOUR_PAGE`. Send the real page address or remove the icon.
- [ ] **One contact email.** Find Your Lane uses `hello@continentalfounders.org`; Contact and Privacy use `continentalfounders.info@gmail.com`. Pick one.
- [ ] **Admin security:** remove test accounts, use strong passwords, and check that one-time-code emails arrive quickly.
- [ ] **Domain:** confirm `continentalfounders.org` redirects to `www.continentalfounders.org` and that HTTPS works on both.

## Right after launch

- [ ] **Google Search Console:** the verification file (`googlee9ddb9124169be35.html`) is already in `public/`. Verify the domain, then submit `https://www.continentalfounders.org/sitemap.xml`.
- [ ] **PageSpeed Insights:** run `https://pagespeed.web.dev` on the homepage, `/cfcv` and `/cfcv/apply`, using the mobile results. Aim for a score of at least 80, with LCP under 2.5 s and CLS under 0.1.
- [ ] **Link previews:** paste a few links into LinkedIn's Post Inspector and the Facebook Sharing Debugger.
  - Social sites don't run JavaScript, so every page shares the homepage's title and image.
  - To give each page its own preview, add prerendering (for example `vite-plugin-prerender`) or move to server rendering later.
- [ ] **Search titles:** the homepage title is 72 characters, so Google cuts it off at about 60. Seven page descriptions are slightly over 160 characters. Shorten them if they look truncated in results.
- [ ] **Uptime and error alerts:** for example UptimeRobot (free) for the site and API, and Sentry for errors.

## Test on real devices

- [ ] iPhone (Safari) and Android (Chrome):
  - [ ] the navbar menu
  - [ ] the slideshow
  - [ ] the video
  - [ ] the apply bar
  - [ ] each form, with the keyboard open
  - [ ] the sticky Back/Continue bar in the application
- [ ] A small phone (320px wide, such as iPhone SE) and a tablet.
- [ ] Desktop: Chrome, Safari, Edge and Firefox.
- [ ] Turn on "Reduce motion" in phone settings; the site should be still and fully readable.
- [ ] Keyboard only: Tab through the navbar, a form and the footer; focus should always be visible.

## Content

- [ ] Proofread every page once more, especially names, titles and dates.
- [ ] Past events (US Africa Business Week, 23 September 2026) now show "Past event". Add the next event in the admin.
- [ ] Optional: replace the AI-generated stock photos with real Continental Founders photos when you have them.
- [ ] Publish at least one venture in the admin, so `/ventures` shows real companies instead of "featured here soon".

## Keep improving conversion (after 2–4 weeks of data)

- [ ] Compare how many people start the application with how many submit it, and see which step they leave on.
- [ ] Check which pages lead to the most Apply clicks, and strengthen the ones that don't.
- [ ] Add trust signals where they're real: partner logos, fellow testimonials, press mentions.
- [ ] Re-run PageSpeed Insights after every major content change.
