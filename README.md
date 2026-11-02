# Couch Flipping Academy — Workshop Landing Page

Static site (no build step). Deploys to Cloudflare Pages from this GitHub repo.

## Edit before going live
- `config.js` — workshop date/time, GoHighLevel inbound webhook URL
- `index.html` — swap the dashed-outline placeholders (origin story, Jared/Keon quotes)
- Add your photo at `images/dylan.jpg`, then replace the `#host-photo` div with `<img src="images/dylan.jpg" alt="Dylan">`

## Cloudflare Pages settings
- Framework preset: None
- Build command: (leave empty)
- Build output directory: `/`

Every push to `main` redeploys automatically.

## GoHighLevel
Create a Workflow with an **Inbound Webhook** trigger, paste its URL into `config.js`.
The form sends `full_name`, `first_name`, `last_name`, `email`, `phone`, `source`, `page`, plus `webinar_datetime` (MM-DD-YYYY HH:MM Eastern), `webinar_iso`, `webinar_label`, `webinar_link` (form-encoded).
The workshop date repeats weekly from `schedule` in `config.js`; add weeks off to `skip`.
Map them to the contact, add a "Workshop Registrant" tag, and send the Zoom link email + SMS reminders from there.
