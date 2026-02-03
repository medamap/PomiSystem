# Task: Commonization Review (Read-Only)

## Background
MSX quick converter JS has been refactored into shared modules:
- `cs/PomiSystem.Blazor/wwwroot/js/pomi-image.js`
- `cs/PomiSystem.Blazor/wwwroot/js/pomi-color.js`
- `cs/PomiSystem.Blazor/wwwroot/js/pomi-dither.js`
- `cs/PomiSystem.Blazor/wwwroot/js/pomi-palette.js`

The main flow still lives in:
- `cs/PomiSystem.Blazor/wwwroot/js/pomi-storage.js`

## Request
Please do a **read-only review** focusing on:
1) Potential regressions (behavior differences from earlier MSX flow)
2) Edge cases / null handling / missing guards
3) Any naming or API design improvements for future X1 integration
4) Risks from default parameters (e.g., palette start index, fallback behavior)

Do **not** edit files. Provide your findings and suggestions only.

## Deliverable
Post your review in:
`communication/toCodex/report/`
with filename:
`(YYMMDD_HHmmss)_from_Gemini_commonization_review.md`

Thanks!
