# Manas Pandey — Portfolio

Static personal site: plain HTML, CSS and JavaScript, no build step.

## Files

- `index.html` — the whole site (hero, about, experience, projects, skills, contact)
- `styles.css` — theme tokens (light and dark), layout, responsive rules
- `script.js` — dark-mode toggle, footer year, scroll reveal
- `Manas_Pandey_Resume.pdf` — the downloadable resume (copy of `../cv_manas_pandey_2026.pdf`)
- `CNAME` — added once a custom domain is chosen (one line, the bare domain)

## Preview locally

```bash
python3 -m http.server 8080 --directory .
```

Then open http://localhost:8080.

## Deploy to GitHub Pages

1. Create a public repository on GitHub named `manasbolt945.github.io` (user site) or any name (project site).
2. Push this folder's contents to the `main` branch.
3. In the repository: Settings → Pages → Source: "Deploy from a branch", branch `main`, folder `/ (root)`.
4. The site is live at `https://manasbolt945.github.io/` (user site) within a minute or two.

## Custom domain

1. Buy the domain at a registrar (Cloudflare Registrar, Namecheap, Porkbun or GoDaddy all work).
2. Add a file named `CNAME` in this folder containing only the domain, e.g. `manaspandey.dev`, and push.
3. At the registrar's DNS panel add:
   - `A` records for the apex (`@`) pointing to GitHub Pages: `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`
   - `CNAME` record for `www` pointing to `manasbolt945.github.io`
4. In Settings → Pages, enter the custom domain and tick "Enforce HTTPS" once the DNS check passes.

## Updating the resume on the site

Regenerate `../cv_manas_pandey_2026.pdf` with `../build_resume.py`, then copy it here as `Manas_Pandey_Resume.pdf`.
