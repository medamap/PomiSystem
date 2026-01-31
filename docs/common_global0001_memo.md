# Common Global Memo 0001

## Shared Modules (Blazor JS)

- `cs/PomiSystem.Blazor/wwwroot/js/pomi-image.js`
  - `calculateDimensions(srcW, srcH, outputMode, cropPosition)`
  - `loadImage(dataUrl)`
  - `drawToCanvas(canvas, dataUrl, options)`
    - options: smooth, outputMode, cropPosition, fillStyle
    - returns { img, dims, srcW, srcH, targetW, targetH, ctx }

- `cs/PomiSystem.Blazor/wwwroot/js/pomi-color.js`
  - `applyAdjustments(imageData, brightness, contrast, saturation)`

- `cs/PomiSystem.Blazor/wwwroot/js/pomi-dither.js`
  - `isOrderedMode(mode)`
  - `isErrorMode(mode)`
  - `getOrderedThreshold(x, y, mode)`
  - `getStripeBias(mode, strength)`
  - `applyErrorDiffusion(mode, x, y, w, h, errR, errG, errB, workR, workG, workB)`
  - `luminance(r, g, b)`

- `cs/PomiSystem.Blazor/wwwroot/js/pomi-palette.js`
  - `palettes.msx` / `palettes.x1`
  - `defaults.msx.startIndex = 1` / `defaults.x1.startIndex = 0`
  - `getPalette(name)` / `getDefaults(name)`
  - `registerPalette(name, palette, options)`
  - `distSq(r,g,b,p)` / `nearestIndex(r,g,b,palette,start)` / `chooseLineColors(...)`

## Usage (MSX)

- `pomi-storage.js` uses the shared modules for:
  - crop/resize (`pomi-image`)
  - brightness/contrast/saturation (`pomi-color`)
  - dithering helpers (`pomi-dither`)
  - palette selection and 2-color line choice (`pomi-palette`)
  - `.sc2` exporter also uses palette defaults

## Integration Note

- `wwwroot/index.html` must include:
  - `js/pomi-image.js`
  - `js/pomi-color.js`
  - `js/pomi-dither.js`
  - `js/pomi-palette.js`
  before `js/pomi-storage.js`

## Next Integration Target (X1)

- X1 should use:
  - `pomi-image` for sizing/crop
  - `pomi-color` for adjustments
  - `pomi-palette` for 8-color palette & start index
  - `pomi-dither` optional (if needed)
