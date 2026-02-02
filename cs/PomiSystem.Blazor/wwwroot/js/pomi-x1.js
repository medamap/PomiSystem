window.pomiX1 = {
    _rgbToHue: (r, g, b) => {
        const rf = r / 255;
        const gf = g / 255;
        const bf = b / 255;
        const max = Math.max(rf, gf, bf);
        const min = Math.min(rf, gf, bf);
        const delta = max - min;
        if (delta === 0) {
            return 0;
        }
        let hue;
        if (max === rf) {
            hue = ((gf - bf) / delta) % 6;
        } else if (max === gf) {
            hue = (bf - rf) / delta + 2;
        } else {
            hue = (rf - gf) / delta + 4;
        }
        hue *= 60;
        if (hue < 0) {
            hue += 360;
        }
        return hue;
    },
    _hueDistance: (h1, h2) => {
        const d = Math.abs(h1 - h2);
        return Math.min(d, 360 - d) / 180;
    },
    _nearestIndex: (r, g, b, palette, hueWeight, hueWeightAmount) => {
        const baseDist = window.pomiPalette.distSq;
        const weight = hueWeight ? (Math.max(0, Math.min(100, hueWeightAmount)) / 100) * 195000 : 0;
        const srcHue = hueWeight ? window.pomiX1._rgbToHue(r, g, b) : 0;
        let best = 0;
        let bestScore = Infinity;
        for (let i = 0; i < palette.length; i++) {
            const p = palette[i];
            let score = baseDist(r, g, b, p);
            if (hueWeight && hueWeightAmount > 0) {
                // targetHue を 30 に統一（設計仕様）
                const targetHue = 30;

                // 肌色距離 d = min( |h - 30|, 360 - |h - 30| )
                // ソースピクセルの肌色距離のみで算出
                const src_d_h = Math.abs(srcHue - targetHue);
                const src_d = Math.min(src_d_h, 360 - src_d_h);

                // 重み w = 1 - clamp(d / 40, 0, 1)
                const clamp = (val, min, max) => Math.max(min, Math.min(max, val));
                const src_w = 1 - clamp(src_d / 40, 0, 1);

                // 補正係数 k = 1 - (w * 0.35 * amountFactor)
                const amountFactor = (Math.max(0, Math.min(100, hueWeightAmount)) / 100);
                const k = 1 - (src_w * 0.35 * amountFactor);
                
                // 色距離 = baseDist * k
                score = baseDist(r, g, b, p) * k;
            }
            if (score < bestScore) {
                bestScore = score;
                best = i;
            }
        }
        return best;
    },
    drawPreview: async (canvas, dataUrl, outputMode, cropPosition) => {
        try {
            if (!window.pomiImage || !window.pomiImage.buildResizeRequest || !window.pomiImage.drawToCanvasRequest) {
                console.error('[pomiX1] pomiImage module is missing.');
                alert('必要なモジュールの読み込みに失敗しました。ページを再読み込みしてください。');
                return null;
            }
            const request = window.pomiImage.buildResizeRequest(canvas, dataUrl, {
                smooth: true,
                outputMode: outputMode || 'x1',
                cropPosition: cropPosition || 50,
                fillStyle: '#000'
            });
            const result = await window.pomiImage.drawToCanvasRequest(request);
            if (!result) {
                return null;
            }
            const cropText = result.dims.cropX > 0 || result.dims.cropY > 0
                ? ` / ${result.dims.cropDirection === 'horizontal' ? '左右' : '上下'} ${result.dims.cropPosition}%`
                : '';
            return `${result.srcW}×${result.srcH} → ${result.targetW}×${result.targetH} (X1 Preview)${cropText}`;
        } catch (e) {
            if (window.pomiLog && window.pomiLog.error) {
                window.pomiLog.error('pomiX1.drawPreview failed', e && (e.stack || String(e)));
            }
            return null;
        }
    },
    drawOutput: async (canvas, dataUrl, outputMode, cropPosition, ditherMode, hueWeight, hueWeightAmount, brightness, contrast, saturation) => {
        try {
            if (window.pomiLog && hueWeight && hueWeightAmount > 0) { // hueWeightAmountが0より大きい場合のみログ出力
                window.pomiLog.log(`[x1] hueBias=on (amount=${hueWeightAmount})`);
            }
            if (!window.pomiImage || !window.pomiImage.buildResizeRequest || !window.pomiImage.drawToCanvasRequest) {
                console.error('[pomiX1] pomiImage module is missing.');
                alert('必要なモジュールの読み込みに失敗しました。ページを再読み込みしてください。');
                return null;
            }
            if (!window.pomiPalette || !window.pomiPalette.getPalette || !window.pomiPalette.distSq) {
                console.error('[pomiX1] pomiPalette module is missing.');
                alert('必要なモジュールの読み込みに失敗しました。ページを再読み込みしてください。');
                return null;
            }
            if (!window.pomiColor || !window.pomiColor.applyAdjustments) {
                console.error('[pomiX1] pomiColor module is missing.');
                alert('必要なモジュールの読み込みに失敗しました。ページを再読み込みしてください。');
                return null;
            }
            if (!window.pomiDither || !window.pomiDither.normalizeStrength || !window.pomiDither.isOrderedMode || !window.pomiDither.isErrorMode || !window.pomiDither.getOrderedThreshold || !window.pomiDither.applyErrorDiffusion || !window.pomiDither.initErrorBuffers) {
                console.error('[pomiX1] pomiDither module is missing.');
                alert('必要なモジュールの読み込みに失敗しました。ページを再読み込みしてください。');
                return null;
            }
        const request = window.pomiImage.buildResizeRequest(canvas, dataUrl, {
            smooth: true,
            outputMode: outputMode || 'x1',
            cropPosition: cropPosition || 50,
            fillStyle: '#000'
        });
        const result = await window.pomiImage.drawToCanvasRequest(request);
        if (!result) {
            return null;
        }
        const ctx = result.ctx;
        const imageData = ctx.getImageData(0, 0, result.targetW, result.targetH);
        window.pomiColor.applyAdjustments(imageData, brightness || 0, contrast || 0, saturation || 0);
        const data = imageData.data;
        const defaultPalette = [
            [0, 0, 0],
            [0, 0, 255],
            [255, 0, 0],
            [255, 0, 255],
            [0, 255, 0],
            [0, 255, 255],
            [255, 255, 0],
            [255, 255, 255]
        ];
        const palette = (window.pomiPalette.getPalette('x1') || defaultPalette);
        const usePalette = palette.length === 8 ? palette : defaultPalette;
        const mode = ditherMode || 'none';
        const strength = window.pomiDither.normalizeStrength(100);
        const isOrdered = window.pomiDither.isOrderedMode(mode);
        const isError = window.pomiDither.isErrorMode(mode);
        const getOrderedThreshold = window.pomiDither.getOrderedThreshold;
        const applyErrorDiffusion = window.pomiDither.applyErrorDiffusion;
        const buffers = window.pomiDither.initErrorBuffers(mode, data, result.targetW, result.targetH);
        const workR = buffers.workR;
        const workG = buffers.workG;
        const workB = buffers.workB;

        for (let y = 0; y < result.targetH; y++) {
            for (let x = 0; x < result.targetW; x++) {
                const idx = (y * result.targetW + x) * 4;
                const offset = y * result.targetW + x;
                let r = isError ? workR[offset] : data[idx];
                let g = isError ? workG[offset] : data[idx + 1];
                let b = isError ? workB[offset] : data[idx + 2];

                if (isOrdered) {
                    const t = getOrderedThreshold(x, y, mode) * strength;
                    r = Math.max(0, Math.min(255, r + t * 48));
                    g = Math.max(0, Math.min(255, g + t * 48));
                    b = Math.max(0, Math.min(255, b + t * 48));
                }

                const idxPal = window.pomiX1._nearestIndex(r, g, b, usePalette, hueWeight, hueWeightAmount);
                const pick = usePalette[idxPal];

                data[idx] = pick[0];
                data[idx + 1] = pick[1];
                data[idx + 2] = pick[2];
                data[idx + 3] = 255;

                if (isError) {
                    const errR = r - pick[0];
                    const errG = g - pick[1];
                    const errB = b - pick[2];
                    applyErrorDiffusion(mode, x, y, result.targetW, result.targetH, errR, errG, errB, workR, workG, workB);
                }
            }
        }

        ctx.putImageData(imageData, 0, 0);
        const cropText = result.dims.cropX > 0 || result.dims.cropY > 0
            ? ` / ${result.dims.cropDirection === 'horizontal' ? '左右' : '上下'} ${result.dims.cropPosition}%`
            : '';
        return `${result.srcW}×${result.srcH} → ${result.targetW}×${result.targetH} (X1 Output)${cropText}`;
        } catch (e) {
            if (window.pomiLog && window.pomiLog.error) {
                window.pomiLog.error('pomiX1.drawOutput failed', e && (e.stack || String(e)));
            }
            return null;
        }
    }
};
