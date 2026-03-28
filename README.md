This site is a small [Express](https://expressjs.com/) app. Editorial content lives under `content/` (Markdown pages and `content/innovation-projects/` case studies). Structured page copy lives in `content/data/` (YAML/JSON for CV, teaching, research projects, community service, and supervised projects by year). Nav, analytics, and profile image are in `config.yml`; static assets are in `public/`.

```bash
npm install
npm run dev
```

Then open the URL printed in the terminal (defaults to port 3000; if that port is busy, the next free port is used unless you set `PORT`).

**Static hosting (GitHub Pages, etc.):** run `npm run build` to generate a complete site in `dist/` (HTML plus everything from `public/`).

After adding PDFs or editing `content/data/student-projects-years.json`, run `npm run check-pdfs` to ensure every `/pdfs/…` link points to a file in `public/pdfs/`.
