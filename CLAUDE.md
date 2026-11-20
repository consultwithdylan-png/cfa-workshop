# Notes for AI assistants

Read `README.md` first. It's the full handoff: how the site deploys, every file, the GoHighLevel lead flow, SMS/A2P rules, and the brand styles.

Ground rules:
- Static site, no build step. Pushing to `main` deploys live within about a minute, so preview before committing.
- This repo is public. Never commit passwords, API keys, EINs or other private info.
- Keep the SMS consent checkbox optional and unchecked, and keep the SMS sections in `privacy.html` and `tos.html`. They're part of the approved A2P registration.
- Routine changes (workshop day/time, skipped weeks, Zoom link) go in `config.js`.
