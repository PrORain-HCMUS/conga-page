# CONGA Project Page

Static project page for **CONGA: Continual Neural Gated Architecture for Long-History Sequential Recommendation**, published at ACM RecSys 2026.

- Paper (ACM DL): https://dl.acm.org/doi/10.1145/3773078.3831761
- Slides: `static/pdfs/CONGA-RecSys-slides.pdf`
- Code: https://github.com/nguyentuongbachhy/CONGA
- Built on the [Academic Project Page Template](https://github.com/eliahuhorwitz/Academic-project-page-template).

## Local preview

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000/index.html`.

## Deploy

Enable GitHub Pages on this repo (Settings → Pages → deploy from `main` branch, root). The `.nojekyll` file disables Jekyll processing so `static/` assets are served as-is.
