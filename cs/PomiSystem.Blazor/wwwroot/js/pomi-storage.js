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
                window.pomiMsx.updateInputZoom(state.inputImg, state.inputWrapper, state.inputZoom);
                window.pomiMsx.updateOutputZoom(state.outputCanvas, state.outputWrapper, state.outputZoom);
            }
        });
        window.pomiMsx._zoomListenerAttached = true;
    },
    _calculateDimensions: (srcWidth, srcHeight, mode, cropPosition) => {
        let width;
        let height;
        const resolutions = {
            msx: { w: 256, h: 192 },
            msx2: { w: 512, h: 384 },
            msx4: { w: 1024, h: 768 },
            qvga: { w: 320, h: 240 },
            vga: { w: 640, h: 480 },
            svga: { w: 800, h: 600 },
            xga: { w: 1024, h: 768 },
            sxga: { w: 1280, h: 1024 },
            hd: { w: 1280, h: 720 },
            uxga: { w: 1600, h: 1200 },
            fhd: { w: 1920, h: 1080 },
            wuxga: { w: 1920, h: 1200 },
            qhd: { w: 2560, h: 1440 },
            qxga: { w: 2048, h: 1536 },
            uhd: { w: 3840, h: 2160 }
        };

        if (resolutions[mode]) {
            width = resolutions[mode].w;
            height = resolutions[mode].h;
        } else if (mode === 'auto' || mode === 'autox2' || mode === 'autox4') {
            const multiplier = mode === 'autox4' ? 4 : (mode === 'autox2' ? 2 : 1);
            const baseSize = 192 * multiplier;
            const aspect = srcWidth / srcHeight;
            if (aspect >= 1) {
                height = baseSize;
                width = Math.round(height * aspect);
            } else {
                width = Math.round(baseSize * (256 / 192));
                height = Math.round(width / aspect);
            }
            width = Math.floor(width / 8) * 8;
            height = Math.floor(height / 8) * 8;
            width = Math.max(8, width);
            height = Math.max(8, height);
        } else {
            width = 256;
            height = 192;
        }

        const outputAspect = width / height;
        const srcAspect = srcWidth / srcHeight;
        let srcW;
        let srcH;
        let cropX;
        let cropY;
        const positionRatio = (cropPosition - 25) / 50;

        if (srcAspect > outputAspect) {
            srcH = srcHeight;
            srcW = Math.round(srcHeight * outputAspect);
            const maxCropX = srcWidth - srcW;
            cropX = Math.floor(maxCropX * positionRatio);
            cropY = 0;
        } else {
            srcW = srcWidth;
            srcH = Math.round(srcWidth / outputAspect);
            const maxCropY = srcHeight - srcH;
            cropY = Math.floor(maxCropY * positionRatio);
            cropX = 0;
        }

        const cropDirection = srcAspect > outputAspect ? 'horizontal' : 'vertical';

        return {
            width,
            height,
            cropX,
            cropY,
            srcW,
            srcH,
            cropDirection,
            cropPosition
        };
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
    updateInputZoom: (img, wrapper, zoom) => {
        if (!img || !wrapper) {
            return;
        }
        window.pomiMsx._ensureZoomListener();
        const zoomValue = zoom === 'fit' ? 'fit' : parseFloat(zoom);
        const naturalW = img.naturalWidth || img.width;
        const naturalH = img.naturalHeight || img.height;
        if (!naturalW || !naturalH) {
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
        window.pomiMsx._zoomState = window.pomiMsx._zoomState || {};
        window.pomiMsx._zoomState.inputImg = img;
        window.pomiMsx._zoomState.inputWrapper = wrapper;
        window.pomiMsx._zoomState.inputZoom = zoom;
    },
    updateOutputZoom: (canvas, wrapper, zoom) => {
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
        window.pomiMsx._zoomState = window.pomiMsx._zoomState || {};
        window.pomiMsx._zoomState.outputCanvas = canvas;
        window.pomiMsx._zoomState.outputWrapper = wrapper;
        window.pomiMsx._zoomState.outputZoom = zoom;
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
        if (!canvas) {
            return;
        }
        const ctx = canvas.getContext('2d');
        if (!ctx) {
            return;
        }
        const imageData = ctx.getImageData(0, 0, 256, 192);
        const data = imageData.data;

        const palette = [
            [0, 0, 0],
            [0, 0, 0],
            [33, 200, 66],
            [94, 220, 120],
            [84, 85, 237],
            [125, 118, 252],
            [212, 82, 77],
            [66, 235, 245],
            [252, 85, 84],
            [255, 121, 120],
            [212, 193, 84],
            [230, 206, 128],
            [33, 176, 59],
            [201, 91, 186],
            [204, 204, 204],
            [255, 255, 255]
        ];

        const dist = (r, g, b, p) => {
            const dr = r - p[0];
            const dg = g - p[1];
            const db = b - p[2];
            return dr * dr + dg * dg + db * db;
        };

        const patternData = new Uint8Array(6144);
        const colorData = new Uint8Array(6144);
        const nameTable = new Uint8Array(768);
        const namePadding = new Uint8Array(0x500);

        for (let bank = 0; bank < 3; bank++) {
            for (let ty = 0; ty < 8; ty++) {
                for (let tx = 0; tx < 32; tx++) {
                    const nameOffset = bank * 256 + ty * 32 + tx;
                    nameTable[nameOffset] = ty * 32 + tx;
                }
            }
        }

        for (let bank = 0; bank < 3; bank++) {
            for (let ty = 0; ty < 8; ty++) {
                for (let tx = 0; tx < 32; tx++) {
                    const tileIndex = bank * 256 + ty * 32 + tx;
                    const baseX = tx * 8;
                    const baseY = bank * 64 + ty * 8;

                    for (let line = 0; line < 8; line++) {
                        const y = baseY + line;
                        if (y >= 192) continue;

                        const lineColors = new Map();
                        for (let px = 0; px < 8; px++) {
                            const x = baseX + px;
                            const i = (y * 256 + x) * 4;
                            const r = data[i];
                            const g = data[i + 1];
                            const b = data[i + 2];
                            let bestColor = 1;
                            let bestDist = Infinity;
                            for (let c = 1; c < 16; c++) {
                                const d = dist(r, g, b, palette[c]);
                                if (d < bestDist) {
                                    bestDist = d;
                                    bestColor = c;
                                }
                            }
                            lineColors.set(bestColor, (lineColors.get(bestColor) || 0) + 1);
                        }

                        const sortedColors = [...lineColors.entries()].sort((a, b) => b[1] - a[1]);
                        const fgColor = sortedColors[0] ? sortedColors[0][0] : 15;
                        const bgColor = sortedColors[1] ? sortedColors[1][0] : 1;

                        let patternByte = 0;
                        for (let px = 0; px < 8; px++) {
                            const x = baseX + px;
                            const i = (y * 256 + x) * 4;
                            const r = data[i];
                            const g = data[i + 1];
                            const b = data[i + 2];
                            let bestColor = 1;
                            let bestDist = Infinity;
                            for (let c = 1; c < 16; c++) {
                                const d = dist(r, g, b, palette[c]);
                                if (d < bestDist) {
                                    bestDist = d;
                                    bestColor = c;
                                }
                            }
                            const distToFg = Math.abs(bestColor - fgColor);
                            const distToBg = Math.abs(bestColor - bgColor);
                            if (distToFg <= distToBg) {
                                patternByte |= (1 << (7 - px));
                            }
                        }

                        const byteOffset = tileIndex * 8 + line;
                        patternData[byteOffset] = patternByte;
                        colorData[byteOffset] = (fgColor << 4) | bgColor;
                    }
                }
            }
        }

        const to3bit = (v) => Math.max(0, Math.min(7, Math.round(v / 255 * 7)));
        const palBytes = new Uint8Array(32);
        for (let i = 0; i < palette.length; i++) {
            const r = to3bit(palette[i][0]);
            const g = to3bit(palette[i][1]);
            const b = to3bit(palette[i][2]);
            const word = (g << 8) | (r << 4) | b;
            palBytes[i * 2] = word & 0xFF;
            palBytes[i * 2 + 1] = (word >> 8) & 0xFF;
        }
        namePadding.set(palBytes, 0x80);

        const startAddr = 0x0000;
        const dataSize = 6144 + 768 + 0x500 + 6144;
        const endAddr = startAddr + dataSize - 1;
        const execAddr = 0x0000;
        const header = new Uint8Array([
            0xFE,
            startAddr & 0xFF, (startAddr >> 8) & 0xFF,
            endAddr & 0xFF, (endAddr >> 8) & 0xFF,
            execAddr & 0xFF, (execAddr >> 8) & 0xFF
        ]);

        const scrFile = new Uint8Array(7 + dataSize);
        scrFile.set(header, 0);
        scrFile.set(patternData, 7);
        scrFile.set(nameTable, 7 + 6144);
        scrFile.set(namePadding, 7 + 6144 + 768);
        scrFile.set(colorData, 7 + 6144 + 768 + 0x500);

        const blob = new Blob([scrFile], { type: 'application/octet-stream' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.download = filename || 'msx_screen2.sc2';
        link.href = url;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    },
    _draw: async (canvas, dataUrl, smooth, outputMode, cropPosition) => {
        if (!canvas || !dataUrl) {
            return null;
        }
        const ctx = canvas.getContext('2d');
        if (!ctx) {
            return null;
        }
        const img = new Image();
        const loaded = new Promise((resolve, reject) => {
            img.onload = () => resolve();
            img.onerror = () => reject();
        });
        img.src = dataUrl;
        await loaded;

        const srcW = img.naturalWidth || img.width;
        const srcH = img.naturalHeight || img.height;
        const dims = window.pomiMsx._calculateDimensions(srcW, srcH, outputMode || 'msx', cropPosition || 50);
        const targetW = dims.width;
        const targetH = dims.height;

        canvas.width = targetW;
        canvas.height = targetH;
        ctx.clearRect(0, 0, targetW, targetH);
        ctx.fillStyle = '#0b0f12';
        ctx.fillRect(0, 0, targetW, targetH);
        ctx.imageSmoothingEnabled = !!smooth;
        ctx.drawImage(
            img,
            dims.cropX,
            dims.cropY,
            dims.srcW,
            dims.srcH,
            0,
            0,
            targetW,
            targetH
        );

        const cropText = dims.cropX > 0 || dims.cropY > 0
            ? ` / ${dims.cropDirection === 'horizontal' ? '左右' : '上下'} ${dims.cropPosition}%`
            : '';
        return `${srcW}×${srcH} → ${targetW}×${targetH}${cropText}`;
    },
    _drawScreen2: async (canvas, dataUrl, outputMode, cropPosition, ditherMode, ditherStrength, brightness, contrast, saturation) => {
        if (!canvas || !dataUrl) {
            return null;
        }
        const ctx = canvas.getContext('2d');
        if (!ctx) {
            return null;
        }

        const img = new Image();
        const loaded = new Promise((resolve, reject) => {
            img.onload = () => resolve();
            img.onerror = () => reject();
        });
        img.src = dataUrl;
        await loaded;

        const srcW = img.naturalWidth || img.width;
        const srcH = img.naturalHeight || img.height;
        const dims = window.pomiMsx._calculateDimensions(srcW, srcH, outputMode || 'msx', cropPosition || 50);
        const targetW = dims.width;
        const targetH = dims.height;

        const work = document.createElement('canvas');
        work.width = targetW;
        work.height = targetH;
        const wctx = work.getContext('2d');
        if (!wctx) {
            return null;
        }
        wctx.fillStyle = '#000';
        wctx.fillRect(0, 0, targetW, targetH);
        wctx.imageSmoothingEnabled = true;
        wctx.drawImage(
            img,
            dims.cropX,
            dims.cropY,
            dims.srcW,
            dims.srcH,
            0,
            0,
            targetW,
            targetH
        );

        const imageData = wctx.getImageData(0, 0, targetW, targetH);
        const data = imageData.data;

        const brightnessFactor = brightness / 100;
        const contrastFactor = (contrast + 100) / 100;
        const saturationFactor = (saturation + 100) / 100;

        for (let i = 0; i < data.length; i += 4) {
            let r = data[i];
            let g = data[i + 1];
            let b = data[i + 2];

            r += brightnessFactor * 255;
            g += brightnessFactor * 255;
            b += brightnessFactor * 255;

            r = ((r / 255 - 0.5) * contrastFactor + 0.5) * 255;
            g = ((g / 255 - 0.5) * contrastFactor + 0.5) * 255;
            b = ((b / 255 - 0.5) * contrastFactor + 0.5) * 255;

            const gray = 0.299 * r + 0.587 * g + 0.114 * b;
            r = gray + saturationFactor * (r - gray);
            g = gray + saturationFactor * (g - gray);
            b = gray + saturationFactor * (b - gray);

            data[i] = Math.max(0, Math.min(255, r));
            data[i + 1] = Math.max(0, Math.min(255, g));
            data[i + 2] = Math.max(0, Math.min(255, b));
        }

        // TMS9918 palette (16 colors)
        const palette = [
            [0, 0, 0],
            [0, 0, 0],
            [33, 200, 66],
            [94, 220, 120],
            [84, 85, 237],
            [125, 118, 252],
            [212, 82, 77],
            [66, 235, 245],
            [252, 85, 84],
            [255, 121, 120],
            [212, 193, 84],
            [230, 206, 128],
            [33, 176, 59],
            [201, 91, 186],
            [204, 204, 204],
            [255, 255, 255]
        ];

        const dist = (r, g, b, p) => {
            const dr = r - p[0];
            const dg = g - p[1];
            const db = b - p[2];
            return dr * dr + dg * dg + db * db;
        };

        const strength = Math.max(0, Math.min(100, ditherStrength)) / 100;
        const stripeBias = (ditherMode === 'stripe_strong' ? 0.6 : 0.35) * strength;

        const orderedModes = new Set(['checker', 'bayer2', 'bayer4']);
        const errorModes = new Set(['floyd', 'atkinson']);

        const getOrderedThreshold = (x, y, mode) => {
            if (mode === 'checker') {
                const v = (x + y) % 2;
                return v - 0.5;
            }
            if (mode === 'bayer2') {
                const matrix = [
                    [0, 2],
                    [3, 1]
                ];
                return (matrix[y % 2][x % 2] + 0.5) / 4 - 0.5;
            }
            if (mode === 'bayer4') {
                const matrix = [
                    [0, 8, 2, 10],
                    [12, 4, 14, 6],
                    [3, 11, 1, 9],
                    [15, 7, 13, 5]
                ];
                return (matrix[y % 4][x % 4] + 0.5) / 16 - 0.5;
            }
            return 0;
        };

        const luminance = (r, g, b) => 0.299 * r + 0.587 * g + 0.114 * b;

        const workR = errorModes.has(ditherMode) ? new Float32Array(targetW * targetH) : null;
        const workG = errorModes.has(ditherMode) ? new Float32Array(targetW * targetH) : null;
        const workB = errorModes.has(ditherMode) ? new Float32Array(targetW * targetH) : null;

        if (workR) {
            for (let i = 0; i < targetW * targetH; i++) {
                const idx = i * 4;
                workR[i] = data[idx];
                workG[i] = data[idx + 1];
                workB[i] = data[idx + 2];
            }
        }

        for (let y = 0; y < targetH; y++) {
            const rowIndex = y * targetW * 4;
            const blocks = Math.floor(targetW / 8);
            const blockColors = new Array(blocks);

            for (let block = 0; block < blocks; block++) {
                const startX = block * 8;
                const colors = new Map();
                for (let x = 0; x < 8; x++) {
                    const idx = rowIndex + (startX + x) * 4;
                    const r = data[idx];
                    const g = data[idx + 1];
                    const b = data[idx + 2];
                    let best = 1;
                    let bestDist = Infinity;
                    for (let i = 1; i < palette.length; i++) {
                        const d = dist(r, g, b, palette[i]);
                        if (d < bestDist) {
                            bestDist = d;
                            best = i;
                        }
                    }
                    colors.set(best, (colors.get(best) || 0) + 1);
                }
                const sorted = Array.from(colors.entries()).sort((a, b) => b[1] - a[1]);
                const primary = sorted[0] ? sorted[0][0] : 1;
                const secondary = sorted[1] ? sorted[1][0] : primary;
                blockColors[block] = { primary, secondary };
            }

            for (let x = 0; x < targetW; x++) {
                const block = Math.floor(x / 8);
                const colors = blockColors[block];
                const c1 = palette[colors.primary];
                const c2 = palette[colors.secondary];
                const idx = rowIndex + x * 4;
                const offset = y * targetW + x;
                let r = errorModes.has(ditherMode) ? workR[offset] : data[idx];
                let g = errorModes.has(ditherMode) ? workG[offset] : data[idx + 1];
                let b = errorModes.has(ditherMode) ? workB[offset] : data[idx + 2];

                let pick = c1;
                if (orderedModes.has(ditherMode)) {
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

                if (errorModes.has(ditherMode)) {
                    const errR = r - pick[0];
                    const errG = g - pick[1];
                    const errB = b - pick[2];

                    const distribute = (dx, dy, factor) => {
                        const nx = x + dx;
                        const ny = y + dy;
                        if (nx < 0 || nx >= targetW || ny < 0 || ny >= targetH) return;
                        const nidx = ny * targetW + nx;
                        workR[nidx] += errR * factor;
                        workG[nidx] += errG * factor;
                        workB[nidx] += errB * factor;
                    };

                    if (ditherMode === 'floyd') {
                        distribute(1, 0, 7 / 16);
                        distribute(-1, 1, 3 / 16);
                        distribute(0, 1, 5 / 16);
                        distribute(1, 1, 1 / 16);
                    } else if (ditherMode === 'atkinson') {
                        distribute(1, 0, 1 / 8);
                        distribute(2, 0, 1 / 8);
                        distribute(-1, 1, 1 / 8);
                        distribute(0, 1, 1 / 8);
                        distribute(1, 1, 1 / 8);
                        distribute(0, 2, 1 / 8);
                    }
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
