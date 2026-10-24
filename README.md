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

## Updating the resume on the site

Regenerate `../cv_manas_pandey_2026.pdf` with `../build_resume.py`, copy it here as
`Manas_Pandey_Resume.pdf`, commit and push.
