# Review Report: MSX-specific Separation

**To:** Codex
**From:** Gemini
**Date:** 2026-01-31
**Subject:** Read-Only Review for MSX Logic Separation

---

This report outlines the analysis and suggestions for separating MSX-specific logic from the core converter modules, based on the request.

---

## 1. MSX-Specific Logic in `pomi-storage.js`

The `pomi-storage.js` file currently contains a significant amount of logic tightly coupled to the MSX platform.

- **`window.pomiMsx` object:** The global namespace itself is MSX-specific.
- **Core Functions:**
    - `drawScreen2` / `_drawScreen2`: The entire logic is designed around the MSX SCREEN 2 color and rendering rules. The UI labels within `_drawScreen2` are also specific.
    - `downloadSc2`: This is the most heavily-coupled function. It hardcodes the MSX BSAVE file format (`0xFE` header), VDP memory layout sizes (6144, 768), and the 3-bit color conversion (`to3bit`).
- **Defaults and Strings:**
    - Default filenames (`msx_screen2.png`) and `outputMode: 'msx'` parameters make the functions MSX-centric.
- **Fallback Implementations:** The internal fallback palettes and color-finding logic (e.g., starting searches from index `1`) are based on specific MSX conventions.

---

## 2. Suggested Boundaries for `pomi-msx-sc2-exporter.js`

To properly decouple the logic, a new `pomi-msx-sc2-exporter.js` module should be created with a clear, single responsibility: converting image data into an SC2 binary file.

- **Primary Function:** The module should export one primary function, likely developed from the current `downloadSc2` logic.
- **Proposed API / Signature:** The function should be a pure utility, free of DOM dependencies.
  ```javascript
  /**
   * Generates and triggers the download of an MSX SCREEN 2 binary file.
   * @param {ImageData} imageData - The final, color-quantized image data.
   * @param {Array<Array<number>>} palette - The 16-color palette array used.
   * @param {object} options - Configuration options, e.g., { startIndex: 1 }.
   * @param {string} [filename='screen.sc2'] - The desired output filename.
   */
  export function exportSc2(imageData, palette, options, filename) {
      // ... core logic from the old downloadSc2 ...
  }
  ```
- **Responsibilities:**
    - **It SHOULD:** Contain the logic for building the BSAVE header, pattern/color/name tables, and converting the palette to 3-bit format.
    - **It SHOULD NOT:** Perform color matching or access the canvas directly. It should receive data that is already processed.
- **Refactoring in `pomi-storage.js`:** The calling function (currently `downloadSc2`) would be simplified to:
    1. Get the final `imageData` from the output canvas.
    2. Get the MSX palette and defaults from `pomiPalette`.
    3. Call the new `pomiMsxSc2Exporter.exportSc2()` with the prepared data.

---

## 3. Risks of Removing Fallbacks & Suggested Strategy

Completely removing the fallback checks (`if (!window.pomiPalette)`) is risky. If a required module fails to load, the application will crash.

The current strategy of using an alternate, hardcoded implementation is also risky as it can diverge from the main module.

**Recommended Strategy: Graceful Failure**

The best approach is to retain the checks but change the outcome from "use a different implementation" to "fail safely and informatively."

- **Keep the Checks:** The `if (!window.pomiImage)` and `if (!window.pomiPalette)` conditions should remain.
- **Change the Action:**
    1.  **Log a Developer-Facing Error:**
        ```javascript
        console.error('[Pomi] Required module "pomi-palette.js" is not loaded. Aborting operation.');
        ```
    2.  **Show a User-Facing Error:** Display a simple, non-technical message on the UI. For example:
        `alert('Error: A required component failed to load. Please try reloading the page.');`
    3.  **Halt Execution:** `return null;` or `return false;` immediately after the check to prevent the function from proceeding and crashing.

This "Graceful Failure" approach eliminates the risk of behavioral inconsistency while ensuring that both developers and users are aware of the problem, preventing a confusing "silent failure" scenario. It is a minimal, safe form of fallback logic that should be retained.
