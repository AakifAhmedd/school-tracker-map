# School Programme Tracker — Sri Lanka

SELB (Sharp Eyes Learn Better) tracks schools through Not Started, Teacher Training, Vision Screening, and Completed. Current version: **1.0.0**.

## Live site
The live GitHub Pages map is at
`https://AakifAhmedd.github.io/school-tracker-map/`

## How the data works
`index.html` loads its markers from **`schools.csv`** in this same folder at page-load time.
The two files must stay together in the repo root.

CSV columns: `name, lat, lng, stage, notes`
`stage` must be one of: `not_started`, `training`, `screening`, `completed`
(sequence: Not Started → Teacher Training → Vision Screening → Completed)

## Updating the list (the PR workflow)
1. On GitHub, open `schools.csv` and click the pencil (Edit) icon — or edit it locally and push a branch.
2. Add, remove, or change rows.
3. Open a Pull Request with the change. Reviewers see a clean row-by-row diff.
4. Once the PR is merged into `main`, the live map picks up the new data automatically (GitHub Pages redeploys within ~a minute — no need to touch `index.html`).

## Local testing
Opening `index.html` by double-clicking it won't load `schools.csv` (browsers block that fetch for local files).
Either run a local server (e.g. `python3 -m http.server` in this folder and visit `http://localhost:8000`), or use the **Load a CSV** button in the sidebar to preview a file manually.

## Coverage and performance

All CSV schools appear in the list and stage totals. Only schools with valid coordinates appear on the map; the sidebar reports map coverage and labels schools awaiting coordinates. CSV export retains these schools, including blank coordinates. Unknown or blank stages display/export as `not_started`. No school data is changed automatically on GitHub.

The map fits the school locations before attaching its tile layer, with a 1.5-second fallback when CSV loading is slow. Stage filters reuse markers; Rotary icons share one cached SVG asset. Tiles load after panning stops and keep a smaller buffer. Tile speed still depends on the existing OpenStreetMap HOT provider and the visitor's connection.

Update data and Add a school are expandable panels. Add/remove/import changes last only for the current page session; export the CSV and use the PR workflow to retain them. Keep `rotary-wheel.svg` beside `index.html` and `schools.csv`.

## Versioning and verification

See [VERSIONING.md](VERSIONING.md). Run `node tests/regression.cjs` (Node 18+), then check desktop and phone layouts on a local HTTP server. The app itself needs no Node, build step, or new libraries.
