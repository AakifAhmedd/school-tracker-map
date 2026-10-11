# Versioning

`VERSION` is the source of truth, using MAJOR.MINOR.PATCH. This previously unversioned project starts at 1.0.0.

- PATCH: bug fixes, styling, performance, documentation, and refactoring.
- MINOR: additive user-facing functionality.
- MAJOR: breaking changes; ask the owner before breaking CSV or other data formats.

Every change, including school-data updates, must bump the version. Commit VERSION together with the implementation. Match the application-version meta tag and visible version in index.html. Update every local asset query token in index.html when its asset changes (currently rotary-wheel.svg?v=1.0.0). CDN library versions are independent.

Before release, run `node tests/regression.cjs`, serve with `python3 -m http.server`, and check desktop and phone layouts, search, stages, popups, CSV import/export, and local add/remove. For requested work, PATCH releases are pre-authorized: after the required checks pass, commit and push to main without asking for another confirmation. MINOR and MAJOR releases require explicit owner confirmation before commit/push. Prepare the implementation, version bump, and verification first so the owner can approve a concrete result. Classify releases by the change itself; do not downgrade a feature or breaking change to PATCH to bypass confirmation. GitHub Pages deploys main; verify its workflow and live site after deployment. No build step is required.

## Owner release preference

Recorded 2026-10-11: `x.x.2` (PATCH) changes, including small visual fixes, may be committed and pushed automatically. `x.2.x` (MINOR) and `2.x.x` (MAJOR) releases need owner confirmation. These examples identify the version component, not a literal release number. Keep all existing version-bump, asset cache-busting, testing, and deployment verification requirements.
