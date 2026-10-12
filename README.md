# School Programme Tracker — Sri Lanka

## About
SELB (Sharp Eyes Learn Better) is a school-tracking map for monitoring the programme across Sri Lanka. It helps teams record school locations, track each school through the programme stages, and quickly identify which schools still need coordinates or follow-up.

This app supports the full journey from Not Started to Teacher Training, Vision Screening, and Completed, with a searchable school list and map-based view for local planning and reporting.

SELB (Sharp Eyes Learn Better) tracks schools through Not Started, Teacher Training, Vision Screening, and Completed. Current version: **1.2.4**.

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

All CSV schools appear in the list and stage totals. Only schools with valid coordinates appear on the map; the sidebar reports map coverage and labels schools awaiting coordinates. CSV export retains the current stage, notes, and coordinate values with filter-aware totals.

The map fits the school locations before attaching its tile layer, with a 1.5-second fallback when CSV loading is slow. Stage filters reuse markers; Rotary icons share one cached SVG asset. Tiles are loaded in-browser with a plain map style and no external geocoding service.

Update data and Add a school are expandable panels. Saved add/edit/remove changes are retained on this device when browser storage is available; imported previews remain session-only until saved. The app allows exporting to CSV for review and later upload into the repo workflow.

## Versioning and verification

See [VERSIONING.md](VERSIONING.md). Run `node tests/regression.cjs` (Node 18+), then check desktop and phone layouts on a local HTTP server. The app itself needs no Node, build step, or a package manager to run after the static files are in place.

## Coordinate research — 1.0.1

On 2026-10-10, school-specific map listings and school/Ministry identity records were used to fill 23 previously blank coordinate pairs. Coverage is now **87 of 205 schools**, with **118 awaiting coordinates**.

[coordinate-sources.csv](coordinate-sources.csv) records each added coordinate, source link, available corroboration, locality/alias reasoning, and check date. These are published school pins or official/educational listings used to improve location accuracy.

Ambiguous names, conflicting pins, and potential duplicate records remain unresolved, including Gallahara/Gallehera and the two Bernadette entries. No town-centre coordinates were substituted for school locations without a direct school-specific source.

## Phone inputs and location editing — 1.1.0

On screens up to 760px, switch between **Map** and **Inputs** tabs. Select **Locate** or **Edit** beside a school to update that record, or expand **Add a school** for a new record. Paste coordinates, local map links, or a Google Maps URL to fill in the location.

Coordinate-bearing Google Maps URLs fill the latitude/longitude fields. Place-pin coordinates take priority over the map camera centre; camera-only URLs display a check-location reminder. Short links and current browser geolocation are supported when permission is granted.

## Mobile capture — 1.2.0

Phones open on the **Schools** tab, which starts with **Add a new school**, search, and a list of schools needing locations. Switch to **All schools** to locate an already mapped school. Stage filters and save features are kept mobile-friendly.

Saved changes persist in browser localStorage on this device. **Download CSV** appears after saving for transfer to desktop and the existing GitHub update workflow; there is no automatic cross-device sync.

## Location feedback and plain map — 1.2.1

Location selection now confirms above the controls, announces the result, shows a brief top-of-screen confirmation on phones, and brings the selected coordinates into view. This applies to GPS, map pin selection, and manual inputs.

The map keeps Leaflet and the existing school markers, with a neutral vector style rendered in the browser. No geocoding, nearby-place lookup, API key or new school-data API is used. The basemap tiles are fetched from OpenFreeMap and styled to stay readable without clutter.

## Sri Lanka map bounds and geographic labels — 1.2.2

Map panning is constrained to the Sri Lanka area with solid drag bounds (5.85–9.95° N, 79.45–82.05° E), while preserving coastal access and zoom levels 7–18. Wider viewports may show surrounding area context without losing the country bounds.

The map uses pale green land and building outlines, blue water, and green road lines. Sri Lanka and nine province labels use local overview anchors (label placements only). City and town names come from the base map tiles and keep the map readable without adding extra POI noise.

## Softer main roads — 1.2.3

Main road strokes are one-third thinner (1.2px in the overview, 2px at closer zooms), with a lighter green colour and slightly reduced opacity. This keeps the road network visible while giving school markers more visual clarity.

## Project logo — 1.2.4

The supplied SELB logo appears beside the project title, at 60px on desktop and 44px on phones. The original artwork is served locally as `selb-logo.png`, with explicit dimensions and a versioned asset reference to keep the branding stable.
