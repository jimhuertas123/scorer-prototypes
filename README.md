# Scorer Prototypes

Static design explorations for an internal QA / dev tool that scores ingestion
extractions against hand-curated ground truth managers.

## Versions

- **v1, Luminous**: indigo glow + translucent cards, mirrors the existing client.
- **v2, Precision**: solid surfaces, hairline borders, sharper radii.
- **v3, Inspector**: list + detail pane layout, triple pane on the Score view.

All three share the same mocked data, the same Outfit + IBM Plex Mono typography,
and the Option B palette (`#4f70e8` accent, `#3aa37a` correct, `#d4a017` missing,
`#d04545` extra).

## Local

Open `index.html` to land on the picker, or jump directly to `v1/`, `v2/`, `v3/`.

## Deploy on GitHub Pages

```bash
git init
git add .
git commit -m "feat: scorer prototypes v1, v2, v3"
gh repo create scorer-prototypes --public --source . --push
gh api repos/:owner/scorer-prototypes/pages -X POST -f source[branch]=main -f source[path]=/
```

The site will be served at `https://<your-username>.github.io/scorer-prototypes/`.

## Structure

```
scorer-prototypes-site/
├── index.html     landing page with three cards
├── v1/            Luminous prototype
├── v2/            Precision prototype
└── v3/            Inspector prototype
```

No backend, no build step. Pure HTML / CSS / vanilla JS with mocked data
in each version's `scripts/data.js`.
