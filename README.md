# Couch Flipping Academy — Workshop Landing Page

Live site: **https://www.couchflippingacademy.com**
Owner: Dylan Pabia, Couch Flipping Academy LLC (Fortson, GA)

This is the registration page for the free weekly couch-flipping workshop (a webinar that sells the paid Couch Flipping Academy coaching program). Visitors register here, the lead goes to GoHighLevel (GHL), and GHL sends the email/SMS reminders.

> **For AI assistants / new developers:** this README is the source of truth. Read it fully before editing. This repo is **public**, so never commit passwords, API keys, EINs or other private info.

---

## How it works (60-second version)

1. Static HTML/CSS/JS. No framework, no build step.
2. Push to `main` → Cloudflare Pages project `cfa-workshop` auto-deploys in about a minute.
3. `www.couchflippingacademy.com` is a CNAME to `cfa-workshop.pages.dev`. The root domain redirects to `www` (set in GHL).
4. The registration form POSTs to a GHL Inbound Webhook, then sends the visitor to `thank-you.html`.

## Files

| File | What it is |
|---|---|
| `index.html` | The landing page. Sections, top to bottom: HERO (headline, video, "what you'll learn", countdown, form) → PAIN → TESTIMONIALS → WHY COUCHES → FAIL POINTS → ROADMAP → WHO IT'S FOR → FRAMEWORK → FAQ → FINAL CTA → legal footer. Each section starts with an HTML comment like `<!-- HERO -->`. |
| `thank-you.html` | After registering: confirms the seat, offers add-to-calendar, and has the "showroom" mini-game where visitors walk around and meet students. |
| `game.js` | The thank-you page game (canvas). A furniture showroom with couches, L/U sectionals, a counter, and student "booths". Student lines are in the `STUDENTS` object; the store sign text is drawn in `drawFloor`. Joystick sits on the right side on touch devices. |
| `config.js` | **The settings file.** Workshop schedule, Zoom link, GHL webhook URL, GHL time zone. Most routine changes happen here. |
| `app.js` | Works out the next workshop date, runs the countdowns, YouTube lightbox, and the form submit to GHL. |
| `styles.css` | All styles. Design tokens are at the top (`:root`). Newer additions are appended at the bottom. |
| `privacy.html`, `tos.html` | Privacy Policy and Terms (served at `/privacy` and `/tos`). Both include the SMS/text-messaging sections required for A2P 10DLC. **Don't remove those.** |
| `couch-scene.jpg` | Hero background photo (the gray sectional against a brick wall). |

The logo image is hosted on GHL's CDN (`assets.cdn.filesafe.space/...`), not in this repo.

## Workshop schedule (`config.js`)

- Every **Saturday at 8:00 PM Eastern**, 2 hours, same recurring Zoom link every week.
- The page always shows the next upcoming session. It rolls forward on its own 2 hours after each start, and handles EST/EDT automatically.
- To skip a week, add the date to `schedule.skip`, e.g. `["2026-11-28"]`.
- For a one-off extra session, add it to `workshops`, e.g. `{ start: "2026-12-03T19:00:00-05:00", zoom: "..." }`.
- `ghlTimeZone` **must match** GHL → Settings → Business Profile → Time Zone. It's currently `America/Los_Angeles` (Pacific). If the GHL account is switched to Eastern, change this to `America/New_York`.

## Registration form → GoHighLevel

The form asks for full name, email, phone, and an **optional, unchecked SMS consent checkbox**.

- The phone number is only sent when the SMS box is checked. This is required for A2P compliance; keep it that way.
- The fields are sent form-encoded to `ghlWebhookUrl`:
  - `full_name`, `first_name`, `last_name` (the name is split at the first space)
  - `email`, `phone`, `sms_consent` (`yes`/`no`), `source`, `page`
  - `webinar_datetime` (`MM-DD-YYYY HH:MM` in the GHL account time zone), `webinar_iso`, `webinar_label`, `webinar_link`

GHL sub-account **"Couch Flipping Academy"**. Workflow **"CFA Workshop – Registrations"** (published):

1. Inbound Webhook trigger.
2. Create/Update Contact, including custom fields Webinar Date, Webinar Label and Webinar Link.
3. Add tag `workshop-registrant`.
4. Send the confirmation email and SMS.
5. Remind 1 day before (email), 1 hour before (SMS), and at start (SMS "We're LIVE").

All messages use `{{contact.webinar_label}}` / `{{contact.webinar_link}}`. There are no hard-coded dates. Re-entry is allowed, so people can register again for a later week.

If you rename or add form fields, update the GHL workflow mapping too.

## Email & SMS sending (configured in GHL, not in this repo)

- **Email:** sent through GHL/LeadConnector (Mailgun) from the dedicated sending domain `mg.couchflippingacademy.com`.
  - From: "Dylan from Couch Flipping Academy" `<dylan@couchflippingacademy.com>`.
  - Replies come back into GHL Conversations and are forwarded to Dylan's Gmail.
- **SMS:** A2P 10DLC registered under Couch Flipping Academy LLC; the brand and campaign are approved. It sends from the business's Atlanta (470) number in GHL.
  - The SMS consent wording on `index.html`, `privacy.html` and `tos.html` was submitted as part of that registration. If you change it, keep the same disclosures: message types incl. promotional offers, "msg frequency varies", "msg & data rates may apply", STOP/HELP, "consent not required", and links to Privacy and Terms.
- **DNS** for couchflippingacademy.com is managed in GHL (Settings → Domains). The domain does not support nameserver changes. Records:
  - `www` → Cloudflare Pages
  - Root A record (GHL redirect)
  - Mailgun records on `mg.`

## Brand / design

- Colors (in `:root`): navy `#040a1f`–`#10276a`, blue `#1f8bff`, blue-2 `#38b6ff`, cyan `#5fd4ff`, muted text `#b8c7e6`, red `#ff3b4a`.
- Fonts (Google Fonts): **Bebas Neue** for headlines, **Barlow Condensed** for labels/kickers, **Inter** for body.
- The look matches the webinar slides: dark navy, glowing electric-blue borders, condensed all-caps headlines, a `.grad` blue gradient on key words.
- Reuse existing classes (`.slide`, `.wrap`, `.panel`, `.kicker`, `.grad`, `.blue`, `.btn`) before adding new ones.

## Editing checklist

1. Change the files and preview both desktop (about 1280px wide) and mobile (about 390px wide).
2. Commit to `main`. Cloudflare deploys automatically.
3. Check the live site: hard-refresh www.couchflippingacademy.com.
4. If you touched the form or `app.js`, submit a test registration and confirm the contact shows up in GHL with the right webinar date. Then delete the test contact.

## Content notes

- Testimonial videos are YouTube IDs on `data-id` attributes (`index.html` TESTIMONIALS section).
- The footer has the earnings disclaimer and the LLC's name, address and phone. Keep them.
- Earnings-type claims ($ amounts, testimonial numbers) should be reviewed before running paid ads.
