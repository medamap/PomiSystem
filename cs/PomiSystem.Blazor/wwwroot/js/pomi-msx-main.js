window.pomiStorage = {
    get: (key) => {
        try {
            return localStorage.getItem(key);
        } catch (e) {
            return null;
        }
    },
    set: (key, value) => {
        try {
            localStorage.setItem(key, value);
        } catch (e) {
        }
    }
};

window.pomiMsx = {
    _ensureZoomListener: () => {
        if (window.pomiMsx._zoomListenerAttached) {
            return;
        }
        window.addEventListener('resize', () => {
            if (window.pomiMsx._zoomState) {
                const state = window.pomiMsx._zoomState;
                window.pomiMsx.updateInputZoom(state.inputImg, state.inputWrapper, state.inputZoom, state.inputPixelated);
                window.pomiMsx.updateOutputZoom(state.outputCanvas, state.outputWrapper, state.outputZoom, state.outputPixelated);
                // updatePreviewZoom の呼び出しは _zoomState に inputImg (canvas) と inputWrapper (wrapper) が保存されている場合
                if (state.inputImg instanceof HTMLCanvasElement && state.inputWrapper) { // inputImg が canvas の場合
                    window.pomiMsx.updatePreviewZoom(state.inputImg, state.inputWrapper, state.inputZoom, state.inputPixelated);
                }
            }
        });
        window.pomiMsx._zoomListenerAttached = true;
    },
    _calculateDimensions: (srcWidth, srcHeight, mode, cropPosition) => {
        if (!window.pomiImage || !window.pomiImage.calculateDimensions) {
            console.error('[pomiMsx] pomiImage module is missing.');
            alert('必要なモジュールの読み込みに失敗しました。ページを再読み込みしてください。');
            return null;
        }
        return window.pomiImage.calculateDimensions(srcWidth, srcHeight, mode, cropPosition);
    },
    drawPreview: async (canvas, dataUrl, outputMode, cropPosition) => {
        try {
            return await window.pomiMsx._draw(canvas, dataUrl, true, outputMode, cropPosition);
        } catch (e) {
            return null;
        }
    },
    drawNearest: async (canvas, dataUrl) => {
        try {
            return await window.pomiMsx._draw(canvas, dataUrl, false);
        } catch (e) {
            return null;
        }
    },
    drawScreen2: async (canvas, dataUrl, outputMode, cropPosition, ditherMode, ditherStrength, brightness, contrast, saturation) => {
        try {
            return await window.pomiMsx._drawScreen2(
                canvas,
                dataUrl,
                outputMode || 'msx',
                cropPosition || 50,
                ditherMode || 'none',
                ditherStrength || 0,
                brightness || 0,
                contrast || 0,
                saturation || 0
            );
        } catch (e) {
            return null;
        }
    },
    showSliderPopup: (input, text, canvas, showPreview) => {
        if (!input) {
            return;
        }
        const rect = input.getBoundingClientRect();
        const centerY = window.innerHeight / 2;
        const position = rect.top <= centerY ? 'bottom' : 'top';
        const popup = window.pomiMsx._ensurePopup();
        popup.innerHTML = '';

        const label = document.createElement('div');
        label.className = 'slider-popup-label';
        label.textContent = text;
        popup.appendChild(label);

        if (showPreview && canvas) {
            const img = document.createElement('img');
            img.src = canvas.toDataURL('image/png');
            img.alt = 'preview';
            img.className = 'slider-popup-preview';
            popup.appendChild(img);
        }

        popup.dataset.position = position;
        popup.style.left = '50%';
        popup.style.transform = 'translateX(-50%)';
        if (position === 'bottom') {
            popup.style.bottom = '16px';
            popup.style.top = '';
        } else {
            popup.style.top = '16px';
            popup.style.bottom = '';
        }
        popup.style.opacity = '1';
    },
    hideSliderPopup: () => {
        if (!window.pomiMsx._popupEl) {
            return;
        }
        window.pomiMsx._popupEl.style.opacity = '0';
    },
    showConversionPopup: (input, canvas, showPreview, durationMs) => {
        if (!showPreview || !canvas) {
            return;
        }
        const popup = window.pomiMsx._ensurePopup();
        popup.innerHTML = '';

        const label = document.createElement('div');
        label.className = 'slider-popup-label';
        label.textContent = '反映完了';
        popup.appendChild(label);

        const img = document.createElement('img');
        img.src = canvas.toDataURL('image/png');
        img.alt = 'preview';
        img.className = 'slider-popup-preview';
        popup.appendChild(img);

        const rect = input ? input.getBoundingClientRect() : null;
        const centerY = window.innerHeight / 2;
        const position = rect && rect.top > centerY ? 'top' : 'bottom';

        popup.dataset.position = position;
        popup.style.left = '50%';
        popup.style.transform = 'translateX(-50%)';
        if (position === 'bottom') {
            popup.style.bottom = '16px';
            popup.style.top = '';
        } else {
            popup.style.top = '16px';
            popup.style.bottom = '';
        }
        popup.style.opacity = '1';

        const delay = typeof durationMs === 'number' ? durationMs : 1000;
        clearTimeout(window.pomiMsx._popupTimer);
        window.pomiMsx._popupTimer = setTimeout(() => {
            window.pomiMsx.hideSliderPopup();
        }, delay);
    },
    updateInputZoom: (img, wrapper, zoom, isPixelated) => {
        if (!img || !wrapper) {
            return;
        }
        window.pomiMsx._ensureZoomListener();
        const zoomValue = zoom === 'fit' ? 'fit' : parseFloat(zoom);
        const naturalW = img.naturalWidth || img.width;
        const naturalH = img.naturalHeight || img.height;
        if (!naturalW || !naturalH) {
            if (!img._pomiZoomHooked) {
                img._pomiZoomHooked = true;
                img.addEventListener('load', () => {
                    img._pomiZoomHooked = false;
                    window.pomiMsx.updateInputZoom(img, wrapper, zoom, isPixelated); // recursive call updated
                }, { once: true });
            }
            return;
        }
        const wrapperWidth = wrapper.clientWidth;
        const wrapperHeight = wrapper.clientHeight;
        let scale = 1;
        if (zoomValue === 'fit') {
            const scaleX = wrapperWidth / naturalW;
            const scaleY = wrapperHeight / naturalH;
            scale = Math.min(scaleX, scaleY, 1);
        } else if (!Number.isNaN(zoomValue)) {
            scale = zoomValue;
        }
        img.style.width = Math.floor(naturalW * scale) + 'px';
        img.style.height = Math.floor(naturalH * scale) + 'px';
        img.style.imageRendering = isPixelated ? 'pixelated' : 'auto';
        window.pomiMsx._zoomState = window.pomiMsx._zoomState || {};
        window.pomiMsx._zoomState.inputImg = img;
        window.pomiMsx._zoomState.inputWrapper = wrapper;
        window.pomiMsx._zoomState.inputZoom = zoom;
        window.pomiMsx._zoomState.inputPixelated = isPixelated;
    },
    updateOutputZoom: (canvas, wrapper, zoom, isPixelated) => {
        if (!canvas || !wrapper) {
            return;
        }
        window.pomiMsx._ensureZoomListener();
        const zoomValue = zoom === 'fit' ? 'fit' : parseFloat(zoom);
        const baseW = canvas.width;
        const baseH = canvas.height;
        const wrapperWidth = wrapper.clientWidth;
        const wrapperHeight = wrapper.clientHeight;
        let scale = 1;
        if (zoomValue === 'fit') {
            const scaleX = wrapperWidth / baseW;
            const scaleY = wrapperHeight / baseH;
            scale = Math.min(scaleX, scaleY, 1);
        } else if (!Number.isNaN(zoomValue)) {
            scale = zoomValue;
        }
        canvas.style.width = Math.floor(baseW * scale) + 'px';
        canvas.style.height = Math.floor(baseH * scale) + 'px';
        canvas.style.imageRendering = isPixelated ? 'pixelated' : 'auto';
        window.pomiMsx._zoomState = window.pomiMsx._zoomState || {};
        window.pomiMsx._zoomState.outputCanvas = canvas;
        window.pomiMsx._zoomState.outputWrapper = wrapper;
        window.pomiMsx._zoomState.outputZoom = zoom;
        window.pomiMsx._zoomState.outputPixelated = isPixelated;
    },
    updatePreviewZoom: (canvas, wrapper, zoom, isPixelated) => { // isPixelated パラメータを追加
        if (!canvas || !wrapper) {
            return;
        }
        window.pomiMsx._ensureZoomListener();
        const zoomValue = zoom === 'fit' ? 'fit' : parseFloat(zoom);
        const baseW = canvas.width; // canvas の幅を使用
        const baseH = canvas.height; // canvas の高さを使用
        if (!baseW || !baseH) {
            return;
        }
        const wrapperWidth = wrapper.clientWidth;
        const wrapperHeight = wrapper.clientHeight;
        let scale = 1;
        if (zoomValue === 'fit') {
            const scaleX = wrapperWidth / baseW;
            const scaleY = wrapperHeight / baseH;
            scale = Math.min(scaleX, scaleY, 1);
        } else if (!Number.isNaN(zoomValue)) {
            scale = zoomValue;
        }
        canvas.style.width = Math.floor(baseW * scale) + 'px';
        canvas.style.height = Math.floor(baseH * scale) + 'px';
        canvas.style.imageRendering = isPixelated ? 'pixelated' : 'auto';

        // _zoomState も必要なら更新
        window.pomiMsx._zoomState = window.pomiMsx._zoomState || {};
        window.pomiMsx._zoomState.inputImg = canvas; // 入力プレビューなのでcanvas
        window.pomiMsx._zoomState.inputWrapper = wrapper;
        window.pomiMsx._zoomState.inputZoom = zoom;
        window.pomiMsx._zoomState.inputPixelated = isPixelated;
    },
    _ensurePopup: () => {
        if (window.pomiMsx._popupEl) {
            return window.pomiMsx._popupEl;
        }
        const el = document.createElement('div');
        el.className = 'slider-popup';
        document.body.appendChild(el);
        window.pomiMsx._popupEl = el;
        return el;
    },
    downloadPng: async (canvas, filename) => {
        if (!canvas) {
            return;
        }
        const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));
        const ua = navigator.userAgent || '';
        const isMobile = (navigator.userAgentData && navigator.userAgentData.mobile) ||
            /Android|iPhone|iPad|iPod|Mobile/i.test(ua);
        if (isMobile && blob && navigator.canShare && navigator.canShare({ files: [new File([blob], filename || 'msx_screen2.png', { type: 'image/png' })] })) {
            try {
                const file = new File([blob], filename || 'msx_screen2.png', { type: 'image/png' });
                await navigator.share({ files: [file], title: 'MSX Screen 2' });
                return;
            } catch (e) {
            }
        }
        const link = document.createElement('a');
        link.download = filename || 'msx_screen2.png';
        link.href = canvas.toDataURL('image/png');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    },
    downloadSc2: async (canvas, filename) => {
        if (!window.pomiMsxSc2 || !window.pomiMsxSc2.downloadSc2) {
            console.error('[pomiMsx] pomiMsxSc2 module is missing.');
            alert('必要なモジュールの読み込みに失敗しました。ページを再読み込みしてください。');
            return;
        }
        return window.pomiMsxSc2.downloadSc2(canvas, filename);
    },
    _draw: async (canvas, dataUrl, smooth, outputMode, cropPosition) => {
        if (!window.pomiImage || !window.pomiImage.buildResizeRequest || !window.pomiImage.drawToCanvasRequest) {
            console.error('[pomiMsx] pomiImage module is missing.');
            alert('必要なモジュールの読み込みに失敗しました。ページを再読み込みしてください。');
            return null;
        }
        const request = window.pomiImage.buildResizeRequest(canvas, dataUrl, {
            smooth: !!smooth,
            outputMode: outputMode || 'msx',
            cropPosition: cropPosition || 50,
            fillStyle: '#0b0f12'
        });
        const result = await window.pomiImage.drawToCanvasRequest(request);
        if (!result) {
            return null;
        }
        const cropText = result.dims.cropX > 0 || result.dims.cropY > 0
            ? ` / ${result.dims.cropDirection === 'horizontal' ? '左右' : '上下'} ${result.dims.cropPosition}%`
            : '';
        return `${result.srcW}×${result.srcH} → ${result.targetW}×${result.targetH}${cropText}`;
    },
    _drawScreen2: async (canvas, dataUrl, outputMode, cropPosition, ditherMode, ditherStrength, brightness, contrast, saturation) => {
        if (!canvas || !dataUrl) {
            return null;
        }
        const ctx = canvas.getContext('2d');
        if (!ctx) {
            return null;
        }

        if (!window.pomiImage || !window.pomiImage.buildResizeRequest || !window.pomiImage.drawToCanvasRequest) {
            console.error('[pomiMsx] pomiImage module is missing.');
            alert('必要なモジュールの読み込みに失敗しました。ページを再読み込みしてください。');
            return null;
        }
        const work = document.createElement('canvas');
        const request = window.pomiImage.buildResizeRequest(work, dataUrl, {
            smooth: true,
            outputMode: outputMode || 'msx',
            cropPosition: cropPosition || 50,
            fillStyle: '#000'
        });
        const result = await window.pomiImage.drawToCanvasRequest(request);
        if (!result) {
            return null;
        }
        const { dims, srcW, srcH, targetW, targetH, ctx: wctx } = result;

        const imageData = wctx.getImageData(0, 0, targetW, targetH);
        if (!window.pomiColor || !window.pomiColor.applyAdjustments) {
            console.error('[pomiMsx] pomiColor module is missing.');
            alert('必要なモジュールの読み込みに失敗しました。ページを再読み込みしてください。');
            return null;
        }
        window.pomiColor.applyAdjustments(imageData, brightness, contrast, saturation);
        const data = imageData.data;

        if (!window.pomiPalette || !window.pomiPalette.getPalette || !window.pomiPalette.getDefaults || !window.pomiPalette.distSq || !window.pomiPalette.nearestIndex || !window.pomiPalette.chooseLineColors) {
            console.error('[pomiMsx] pomiPalette module is missing.');
            alert('必要なモジュールの読み込みに失敗しました。ページを再読み込みしてください。');
            return null;
        }
        // TMS9918 palette (16 colors)
        const palette = window.pomiPalette.getPalette('msx');
        const paletteDefaults = window.pomiPalette.getDefaults('msx');
        const dist = window.pomiPalette.distSq;
        const nearestIndex = window.pomiPalette.nearestIndex;
        const chooseLineColors = window.pomiPalette.chooseLineColors;

        if (!window.pomiDither || !window.pomiDither.getStripeBias || !window.pomiDither.normalizeStrength || !window.pomiDither.initErrorBuffers || !window.pomiDither.isOrderedMode || !window.pomiDither.isErrorMode || !window.pomiDither.getOrderedThreshold || !window.pomiDither.luminance || !window.pomiDither.applyErrorDiffusion) {
            console.error('[pomiMsx] pomiDither module is missing.');
            alert('必要なモジュールの読み込みに失敗しました。ページを再読み込みしてください。');
            return null;
        }
        const strength = window.pomiDither.normalizeStrength(ditherStrength);
        const stripeBias = window.pomiDither.getStripeBias(ditherMode, strength);

        const isOrderedMode = window.pomiDither.isOrderedMode;
        const isErrorMode = window.pomiDither.isErrorMode;
        const getOrderedThreshold = window.pomiDither.getOrderedThreshold;
        const luminance = window.pomiDither.luminance;
        const applyErrorDiffusion = window.pomiDither.applyErrorDiffusion;
        const initErrorBuffers = window.pomiDither.initErrorBuffers;

        const buffers = initErrorBuffers(ditherMode, data, targetW, targetH);
        const workR = buffers.workR;
        const workG = buffers.workG;
        const workB = buffers.workB;

        for (let y = 0; y < targetH; y++) {
            const rowIndex = y * targetW * 4;
            const blocks = Math.floor(targetW / 8);
            const blockColors = new Array(blocks);

            for (let block = 0; block < blocks; block++) {
                const startX = block * 8;
                blockColors[block] = chooseLineColors(data, rowIndex, startX, palette, paletteDefaults.startIndex);
            }

            for (let x = 0; x < targetW; x++) {
                const block = Math.floor(x / 8);
                const colors = blockColors[block];
                const c1 = palette[colors.primary];
                const c2 = palette[colors.secondary];
                const idx = rowIndex + x * 4;
                const offset = y * targetW + x;
                let r = isErrorMode(ditherMode) ? workR[offset] : data[idx];
                let g = isErrorMode(ditherMode) ? workG[offset] : data[idx + 1];
                let b = isErrorMode(ditherMode) ? workB[offset] : data[idx + 2];

                let pick = c1;
                if (isOrderedMode(ditherMode)) {
                    const t = getOrderedThreshold(x, y, ditherMode);
                    const l1 = luminance(c1[0], c1[1], c1[2]);
                    const l2 = luminance(c2[0], c2[1], c2[2]);
                    if (l1 !== l2) {
                        const dark = l1 < l2 ? c1 : c2;
                        const light = l1 < l2 ? c2 : c1;
                        const pivot = (l1 + l2) / 2 + t * Math.abs(l1 - l2);
                        const lum = luminance(r, g, b);
                        pick = lum < pivot ? dark : light;
                    } else {
                        const d1 = dist(r, g, b, c1);
                        const d2 = dist(r, g, b, c2);
                        pick = d1 <= d2 ? c1 : c2;
                    }
                } else {
                    let d1 = dist(r, g, b, c1);
                    let d2 = dist(r, g, b, c2);

                    if (ditherMode === 'stripe' || ditherMode === 'stripe_strong') {
                        if (stripeBias > 0) {
                            if (x % 2 === 0) {
                                d1 *= (1 - stripeBias);
                            } else {
                                d2 *= (1 - stripeBias);
                            }
                        }
                    }

                    pick = d1 <= d2 ? c1 : c2;
                }

                data[idx] = pick[0];
                data[idx + 1] = pick[1];
                data[idx + 2] = pick[2];
                data[idx + 3] = 255;

                if (isErrorMode(ditherMode)) {
                    const errR = r - pick[0];
                    const errG = g - pick[1];
                    const errB = b - pick[2];
                    applyErrorDiffusion(ditherMode, x, y, targetW, targetH, errR, errG, errB, workR, workG, workB);
                }
            }
        }

        canvas.width = targetW;
        canvas.height = targetH;
        ctx.putImageData(imageData, 0, 0);
        const labelMap = {
            none: 'Screen 2',
            checker: 'Screen 2 + Checker',
            stripe: `Screen 2 + Stripe ${Math.round(strength * 100)}%`,
            stripe_strong: `Screen 2 + Stripe Strong ${Math.round(strength * 100)}%`,
            bayer2: 'Screen 2 + Bayer 2×2',
            bayer4: 'Screen 2 + Bayer 4×4',
            floyd: 'Screen 2 + Floyd-Steinberg',
            atkinson: 'Screen 2 + Atkinson'
        };
        const label = labelMap[ditherMode] || 'Screen 2';
        const cropText = dims.cropX > 0 || dims.cropY > 0
            ? ` / ${dims.cropDirection === 'horizontal' ? '左右' : '上下'} ${dims.cropPosition}%`
            : '';
        return `${srcW}×${srcH} → ${targetW}×${targetH} (${label})${cropText}`;
    }
};

window.pomiUtils = {
    setFullWidthMode: (isFullWidth) => {
        if (isFullWidth) {
            document.body.classList.add('full-width-mode');
        } else {
            document.body.classList.remove('full-width-mode');
        }
    }
};
