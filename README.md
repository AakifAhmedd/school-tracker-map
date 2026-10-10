# School Programme Tracker — Sri Lanka

SELB (Sharp Eyes Learn Better) tracks schools through Not Started, Teacher Training, Vision Screening, and Completed. Current version: **1.1.0**.

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

## Coordinate research — 1.0.1

On 2026-10-10, school-specific map listings and school/Ministry identity records were used to fill 23 previously blank coordinate pairs. Coverage is now **87 of 205 schools**, with **118 awaiting coordinates**. Existing coordinates, names, stages, and programme figures are retained.

[coordinate-sources.csv](coordinate-sources.csv) records each added coordinate, source link, available corroboration, locality/alias reasoning, and check date. These are published school pins or representative campus/building points, not surveyed entrances. Some have a single coordinate source; the evidence notes identify those. OpenStreetMap-derived records are attributed through their linked sources; © [OpenStreetMap contributors](https://www.openstreetmap.org/copyright), [ODbL](https://opendatacommons.org/licenses/odbl/).

Ambiguous names, conflicting pins, and potential duplicate records remain unresolved, including Gallahara/Gallehera and the two Bernadette entries. No town-centre coordinates were substituted for school locations. The Princess of Wales entry's obsolete “could not confirm coordinates” note was removed after its school pin was matched.

## Phone inputs and location editing — 1.1.0

On screens up to 760px, switch between **Map** and **Inputs** tabs. Select **Locate** or **Edit** beside a school to update that record, or expand **Add a school** for a new record. Paste coordinates or a Google Maps URL, use **Use current location** when at the school, or choose **Pick on map** and tap the location. Save changes, then **Update data → Export CSV** to retain them using the PR workflow. Nothing is written to GitHub by the browser.

Coordinate-bearing Google Maps URLs fill the latitude/longitude fields. Place-pin coordinates take priority over the map camera centre; camera-only URLs display a check-location reminder. Short links and name-only links offer **Open Google Maps** with instructions to copy the full URL or the pin’s coordinates. This static app does not resolve opaque short links or geocode names.

Current location runs only when requested and uses the browser’s permission prompt on HTTPS (or localhost). It reports estimated accuracy and handles denial, timeout, and unavailable location. Verify the point before saving; no location is stored until the school form is saved locally. See [Google Maps URL documentation](https://developers.google.com/maps/documentation/urls/get-started) and [browser geolocation documentation](https://developer.mozilla.org/en-US/docs/Web/API/Geolocation/getCurrentPosition).
