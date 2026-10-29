# Manas Pandey — Portfolio

Live at **https://manasbolt.com**. Static personal site: plain HTML, CSS and JavaScript, no build step.

## Files

- `index.html` — the whole site (hero, about, experience, projects, GitHub, skills, contact)
- `styles.css` — theme tokens (AMOLED dark by default, light opt-in), layout, responsive rules
- `script.js` — theme toggle, mobile menu, scroll spy with sliding indicator, scroll reveal, skills marquees
- `assets/manas.jpg` — hero photo
- `Manas_Pandey_Resume.pdf` — downloadable resume (copy of `../cv_manas_pandey_2026.pdf`)

## Preview locally

```bash
python3 -m http.server 8080 --bind 127.0.0.1
```

Then open http://127.0.0.1:8080.

## Deploying

Hosting is a Cloudflare Worker with Git integration, connected to this repository.
Every push to `main` is deployed automatically within about a minute. There is no
separate pipeline to run.

- Production: https://manasbolt.com (custom domain on the Worker)
- Worker URL: https://portfolio.manas-lfs.workers.dev
- Other branches get their own preview URL (`<branch>-portfolio.manas-lfs.workers.dev`)

## Resume download notifications

`worker/index.js` runs alongside the static files (see `wrangler.jsonc`). Every click
on a resume link sends a beacon to `POST /api/resume-download`; the Worker emails
`manas.lfs@gmail.com` through Cloudflare Email Routing with the time, approximate
location, referrer and browser. Requests are capped at 5 per minute per visitor.

One-time setup in the Cloudflare dashboard (zone manasbolt.com):

1. Email → Email Routing → Enable, and let Cloudflare add the MX records.
2. Destination addresses → add `manas.lfs@gmail.com` and click the verification link it sends.

Until the destination is verified, the Worker deploy will fail validation and the
previous deployment stays live.

## Updating the resume on the site

Regenerate `../cv_manas_pandey_2026.pdf` with `../build_resume.py`, copy it here as
`Manas_Pandey_Resume.pdf`, commit and push.

## Tailored application pages

A company-specific page lives in its own folder and is served at `/<company>/`, for
example `rhenus/index.html` at https://manasbolt.com/rhenus/. Each one reuses the
root `styles.css` and `script.js`, carries `noindex` so it stays out of search, and
serves its own resume PDF (built from `../build_resume_<company>.py`). The resume's
"Portfolio" link points back at that page, so the reader always lands on the same
tailored story and downloads the same PDF they were sent. Download notifications
include the page path, so the email tells you which application the click came from.
