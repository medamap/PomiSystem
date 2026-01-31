window.pomiPalette = {
    palettes: {
        msx: [
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
        ],
        x1: [
            [0, 0, 0],
            [0, 0, 255],
            [255, 0, 0],
            [255, 0, 255],
            [0, 255, 0],
            [0, 255, 255],
            [255, 255, 0],
            [255, 255, 255]
        ]
    },
    defaults: {
        msx: { startIndex: 1 },
        x1: { startIndex: 0 }
    },
    getPalette: (name) => {
        const key = name || 'msx';
        return window.pomiPalette.palettes[key] || window.pomiPalette.palettes.msx;
    },
    getDefaults: (name) => {
        const key = name || 'msx';
        return window.pomiPalette.defaults[key] || window.pomiPalette.defaults.msx;
    },
    registerPalette: (name, palette, options) => {
        if (!name || !Array.isArray(palette)) {
            return;
        }
        window.pomiPalette.palettes[name] = palette;
        if (options && typeof options.startIndex === 'number') {
            window.pomiPalette.defaults[name] = { startIndex: options.startIndex };
        }
    },
    distSq: (r, g, b, p) => {
        const dr = r - p[0];
        const dg = g - p[1];
        const db = b - p[2];
        return dr * dr + dg * dg + db * db;
    },
    nearestIndex: (r, g, b, palette, startIndex) => {
        const start = typeof startIndex === 'number' ? startIndex : 0;
        let best = start;
        let bestDist = Infinity;
        for (let i = start; i < palette.length; i++) {
            const d = window.pomiPalette.distSq(r, g, b, palette[i]);
            if (d < bestDist) {
                bestDist = d;
                best = i;
            }
        }
        return best;
    },
    chooseLineColors: (data, rowIndex, startX, palette, startIndex) => {
        const counts = new Map();
        for (let x = 0; x < 8; x++) {
            const idx = rowIndex + (startX + x) * 4;
            const r = data[idx];
            const g = data[idx + 1];
            const b = data[idx + 2];
            const best = window.pomiPalette.nearestIndex(r, g, b, palette, startIndex);
            counts.set(best, (counts.get(best) || 0) + 1);
        }
        const sorted = Array.from(counts.entries()).sort((a, b) => b[1] - a[1]);
        const primary = sorted[0] ? sorted[0][0] : startIndex;
        const secondary = sorted[1] ? sorted[1][0] : primary;
        return { primary, secondary };
    }
};
