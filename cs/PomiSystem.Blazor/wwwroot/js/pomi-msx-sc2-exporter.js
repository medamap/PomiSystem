window.pomiMsxSc2 = {
    buildSc2Bytes: (imageData, palette, options) => {
        if (!imageData || !imageData.data) {
            return null;
        }
        const data = imageData.data;
        if (!window.pomiPalette || !window.pomiPalette.getPalette || !window.pomiPalette.getDefaults) {
            console.error('[pomiMsxSc2] pomiPalette module is missing.');
            alert('必要なモジュールの読み込みに失敗しました。ページを再読み込みしてください。');
            return null;
        }
        const pal = palette || window.pomiPalette.getPalette('msx');
        const defaults = options && typeof options.startIndex === 'number'
            ? options
            : window.pomiPalette.getDefaults('msx');
        const startIndex = typeof defaults.startIndex === 'number' ? defaults.startIndex : 1;
        const dist = window.pomiPalette.distSq;
        const nearestIndex = window.pomiPalette.nearestIndex;

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
                            const bestColor = nearestIndex(r, g, b, pal, startIndex);
                            lineColors.set(bestColor, (lineColors.get(bestColor) || 0) + 1);
                        }

                        const sortedColors = [...lineColors.entries()].sort((a, b) => b[1] - a[1]);
                        const fgColor = sortedColors[0] ? sortedColors[0][0] : (pal.length - 1);
                        const bgColor = sortedColors[1] ? sortedColors[1][0] : startIndex;

                        let patternByte = 0;
                        for (let px = 0; px < 8; px++) {
                            const x = baseX + px;
                            const i = (y * 256 + x) * 4;
                            const r = data[i];
                            const g = data[i + 1];
                            const b = data[i + 2];
                            const bestColor = nearestIndex(r, g, b, pal, startIndex);
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
        for (let i = 0; i < pal.length; i++) {
            const r = to3bit(pal[i][0]);
            const g = to3bit(pal[i][1]);
            const b = to3bit(pal[i][2]);
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
        return scrFile;
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
        if (!window.pomiPalette || !window.pomiPalette.getPalette || !window.pomiPalette.getDefaults) {
            console.error('[pomiMsxSc2] pomiPalette module is missing.');
            alert('必要なモジュールの読み込みに失敗しました。ページを再読み込みしてください。');
            return;
        }
        const palette = window.pomiPalette.getPalette('msx');
        const options = window.pomiPalette.getDefaults('msx');
        const scrFile = window.pomiMsxSc2.buildSc2Bytes(imageData, palette, options);
        if (!scrFile) {
            return;
        }
        const blob = new Blob([scrFile], { type: 'application/octet-stream' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.download = filename || 'msx_screen2.sc2';
        link.href = url;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }
};
