# Task: Review required-module enforcement (Read-Only)

## Background
We removed fallbacks and now enforce required modules with alert on missing:
- `pomi-color`
- `pomi-dither`
- `pomi-palette`
- `pomi-msx-sc2-exporter`

## Request
Please review (read-only):
1) Any remaining fallbacks that could cause silent divergence
2) Whether the new alert strategy is reasonable and consistent
3) Any potential UX concerns (too many alerts?)

Target files:
- `cs/PomiSystem.Blazor/wwwroot/js/pomi-msx-main.js`
- `cs/PomiSystem.Blazor/wwwroot/js/pomi-msx-sc2-exporter.js`

## Deliverable
Post findings to:
`communication/toCodex/report/`
Filename:
`(YYMMDD_HHmmss)_from_Gemini_required_module_review.md`

Thanks!
