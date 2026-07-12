# Newton's Law of Gravity Calculator — HTML5

An accessible HTML5 rebuild of the legacy Flash simulation `gravCalc012.swf`, built on
the shared KL-UNL foundation files.

## This sim must be served over HTTP — it will NOT run from a double-clicked file

Opening `index.html` directly (a `file://` path) shows an empty / broken masthead.
**Why:** the KL-UNL masthead component (`foundation/kl-unl-masthead.js`) loads its
title, About, and Help text with `fetch('foundation/contents.json')`. Browsers block
`fetch()` of local files over the `file://` protocol (same-origin policy), so the fetch
fails and the title bar never populates. Served over HTTP the fetch succeeds and the sim
loads normally.

## Run it locally

From **inside this `html5/` folder**, start any static web server, then open the URL:

```bash
# Python 3
python3 -m http.server 8123
# then open http://localhost:8123/

# Node
npx serve
# or
npx http-server
```

VS Code users can use the **Live Server** extension.

Because the server root is this `html5/` folder, the sim is at the server root — the URL
is `http://localhost:8123/`, not `.../html5/index.html`.

## Production

When deployed to the cloud host (served over HTTP/HTTPS) it just works. The `file://`
limitation only affects local double-clicking.

## What's here

| Path | Purpose |
|------|---------|
| `index.html` | KL-UNL scaffold: `.app-shell` + `<kl-unl-masthead>` + panels |
| `foundation/` | KL-UNL foundation files, copied **unchanged** (only this sim's entry was added to `contents.json`) |
| `styles/styles.css` | Sim-specific styles only (custom slider, layout); relies on `kl-unl.css` for shared style |
| `simulation.js` | All sim logic (ported ActionScript behaviour) |
| `vendor/mathjax/tex-svg.js` | MathJax 3.2.2 (SVG output), vendored locally so no CDN/network is needed |
| `assets/icons/` | The labelled-object icons, reused as-is from the decompiled export (grey = unselected, color = selected) |
| `CONVERSION_NOTES.md` | Behaviour model, AS→HTML5 mapping, deviations |
| `ACCESSIBILITY.md` | WCAG affordances, keyboard map, screen-reader notes |

All files are local; the only runtime fetch is `foundation/contents.json`.
