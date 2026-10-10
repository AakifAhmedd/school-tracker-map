# Versioning

`VERSION` is the source of truth, using MAJOR.MINOR.PATCH. This previously unversioned project starts at 1.0.0.

- PATCH: bug fixes, styling, performance, documentation, and refactoring.
- MINOR: additive user-facing functionality.
- MAJOR: breaking changes; ask the owner before breaking CSV or other data formats.

Every change, including school-data updates, must bump the version. Commit VERSION together with the implementation. Match the application-version meta tag and visible version in index.html. Update every local asset query token in index.html when its asset changes (currently rotary-wheel.svg?v=1.0.0). CDN library versions are independent.

Before release, run `node tests/regression.cjs`, serve with `python3 -m http.server`, and check desktop and phone layouts, search, stages, popups, CSV import/export, and local add/remove. Push only when authorized. GitHub Pages deploys main; verify its workflow and live site after deployment. No build step is required.
