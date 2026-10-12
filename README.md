# School Programme Tracker — Sri Lanka

A lightweight map-based tracker for monitoring schools across Sri Lanka as they move through the SELB programme.

This app helps teams:
- record school locations
- track each school through programme stages
- view school data in a searchable list and map
- update records using a CSV-based workflow

## Live site

https://AakifAhmedd.github.io/school-tracker-map/

## How it works

The app loads school data from `schools.csv` in the project root.

CSV columns:

`name, lat, lng, stage, notes`

Valid stages:
- `not_started`
- `training`
- `screening`
- `completed`

## Updating the data

1. Edit `schools.csv` in GitHub or locally.
2. Open a pull request with your changes.
3. Merge the PR into `main`.
4. The live map updates automatically via GitHub Pages.

## Local testing

Because the browser blocks direct local CSV fetches, run a small local server:

```bash
python3 -m http.server 8000
```

Then open:

`http://localhost:8000`

## Notes

- Only schools with valid coordinates appear on the map.
- The project is a static HTML/JavaScript app with no build step.
- See [VERSIONING.md](VERSIONING.md) for release and verification details.
