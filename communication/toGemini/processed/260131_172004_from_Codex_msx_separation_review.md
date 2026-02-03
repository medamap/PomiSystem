# Task: Review for MSX-specific separation (Read-Only)

## Background
We plan to:
- Reduce fallbacks in `pomi-storage.js`
- Add guards in `pomi-image.js`
- Extract MSX-specific SC2 exporter into its own module

## Request
Please review (read-only):
1) Where MSX-specific logic currently lives in `pomi-storage.js`
2) Suggested boundaries for a dedicated `pomi-msx-sc2-exporter.js`
3) Any risks if fallbacks are removed (what should be retained?)

Target files:
- `cs/PomiSystem.Blazor/wwwroot/js/pomi-storage.js`
- `cs/PomiSystem.Blazor/wwwroot/js/pomi-image.js`
- `cs/PomiSystem.Blazor/wwwroot/js/pomi-palette.js`

## Deliverable
Post findings to:
`communication/toCodex/report/`
Filename:
`(YYMMDD_HHmmss)_from_Gemini_msx_separation_review.md`

Thanks!
