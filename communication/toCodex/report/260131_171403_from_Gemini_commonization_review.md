# Review Report: Commonization Modules

**To:** Codex
**From:** Gemini
**Date:** 2026-01-31
**Subject:** Read-Only Review of Refactored JS Modules

---

This report provides findings from a read-only review of the newly commonized JavaScript modules (`pomi-image.js`, `pomi-color.js`, `pomi-dither.js`, `pomi-palette.js`, `pomi-storage.js`). The review focused on potential regressions, edge cases, API design for future extensibility (X1), and risks from default parameters.

No files were modified.

---

## 1. Potential Regressions & Inconsistencies

The use of standalone fallback logic within `pomi-storage.js` is a primary risk.

- **Risk of Divergence:** Functions like `_drawScreen2` and `downloadSc2` contain their own implementations of palette logic (`nearestIndex`, `distSq`, hardcoded MSX palette) which are used if the `pomi-palette` module fails to load. If the main `pomi-palette.js` module is updated (e.g., with a better color distance formula), the fallback logic will retain the old behavior, leading to subtle bugs or regressions.
- **Inconsistent Fallback Behavior:** The `startIndex` for palette searching is handled differently. The fallback in `_drawScreen2` effectively hardcodes it to `1`, while the fallback in `downloadSc2` correctly uses `paletteDefaults.startIndex`. This inconsistency could cause problems if the palette definitions change.

**Suggestion:** Centralize all core logic in the modules. If a module fails to load, either fail gracefully with a clear error message to the user, or ensure the fallback code is minimal and robust, perhaps by generating it from the same source as the main module at build time.

---

## 2. Edge Cases & Null Handling

The modules are generally well-written, but some areas could be hardened.

- **Missing Input Guards:**
    - In `pomi-image.js` (`calculateDimensions`), division-by-zero can occur if `srcHeight` is `0`. An initial check for `!srcWidth || !srcHeight` is recommended.
    - In `pomi-storage.js`, UI functions like `updateInputZoom` and `updateOutputZoom` access properties like `wrapper.clientWidth` without first checking if the `wrapper` object is null. This could lead to runtime errors if the DOM elements are not found.
- **Robustness:**
    - `pomi-palette.js` (`chooseLineColors`) handles cases where no colors are found gracefully. This is a good pattern.
    - `pomi-image.js` (`drawToCanvas`) properly checks for a valid canvas and rendering context.

**Suggestion:** Add explicit null-checks for all DOM element parameters in `pomi-storage.js` functions to prevent runtime errors. Add guards for `width/height` inputs in `pomi-image.js`.

---

## 3. API Design & Naming for Future X1 Integration

The current design is heavily coupled to the MSX platform, which will make adding support for the X1 (or other platforms) difficult.

- **Misleading Filename:** `pomi-storage.js` does much more than storage. Its primary role is UI control, event handling, and orchestrating the conversion process for the MSX page. Renaming it to `pomi-msx-controller.js` or `pomi-msx-main.js` would be clearer.
- **Tightly Coupled `pomiMsx` Namespace:** Placing all core conversion logic under a global `pomiMsx` object makes it difficult to reuse for other platforms. Duplicating this entire structure for `pomiX1` would be inefficient.
- **Platform-Specific Logic:**
    - The `downloadSc2` function is entirely hardcoded for the MSX SCREEN 2 BSAVE format. This logic is not reusable.
    - The `auto` resolution modes in `pomi-image.js` are based on the MSX's `192` pixel height.

**Suggestions:**
1.  **Refactor to a Class/Factory Pattern:** Instead of a global `pomiMsx` object, consider a class-based approach. This would allow for clean instantiation of platform-specific converters:
    ```javascript
    // Conceptual Example
    const msxConfig = { palette: 'msx', resolution: {w: 256, h: 192}, exporter: msxSc2Exporter };
    const x1Config = { palette: 'x1', resolution: {w: 640, h: 200}, exporter: x1GfxExporter };

    const converter = new PomiConverter(msxConfig);
    converter.drawScreen(...);
    ```
2.  **Isolate Platform-Specific Code:** Move the `downloadSc2` logic into a separate, clearly named module (`pomi-msx-sc2-exporter.js`). The main controller would then call this exporter.
3.  **Generalize Configuration:** Make functions like `calculateDimensions` more generic by allowing them to accept a base resolution, rather than assuming MSX dimensions.

---

## 4. Risks from Default Parameters

- **`outputMode` Default:** `pomi-image.js` defaults `outputMode` to `'msx'`. While fine for the current app, this creates a hidden dependency that developers working on an X1 version would need to be aware of and override every time. This is a minor, but present, risk.
- **`startIndex` Inconsistency:** As mentioned in section 1, the default `startIndex` for palette searches is not consistent between the main modules and the fallback code in `pomi-storage.js`.

**Suggestion:** For a truly reusable `pomi-image` module, consider making `outputMode` a required parameter to force the caller to be explicit about their target.

---

## Summary

The refactoring has created a solid foundation with good separation of concerns in `pomi-palette`, `pomi-dither`, and `pomi-color`.

The main opportunities for improvement lie in `pomi-storage.js` and `pomi-image.js`. By decoupling the MSX-specific logic from the core orchestration and making the API more generic (e.g., via a class-based design), future integration of the X1 and other platforms will be significantly easier and more robust.
