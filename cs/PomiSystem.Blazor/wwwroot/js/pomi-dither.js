window.pomiDither = {
    isOrderedMode: (mode) => mode === 'checker' || mode === 'bayer2' || mode === 'bayer4',
    isErrorMode: (mode) => mode === 'floyd' || mode === 'atkinson',
    getOrderedThreshold: (x, y, mode) => {
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
    },
    getStripeBias: (mode, strength) => {
        if (mode !== 'stripe' && mode !== 'stripe_strong') {
            return 0;
        }
        const bias = mode === 'stripe_strong' ? 0.6 : 0.35;
        return bias * strength;
    },
    applyErrorDiffusion: (mode, x, y, targetW, targetH, errR, errG, errB, workR, workG, workB) => {
        if (!workR || !workG || !workB) {
            return;
        }
        const distribute = (dx, dy, factor) => {
            const nx = x + dx;
            const ny = y + dy;
            if (nx < 0 || nx >= targetW || ny < 0 || ny >= targetH) {
                return;
            }
            const nidx = ny * targetW + nx;
            workR[nidx] += errR * factor;
            workG[nidx] += errG * factor;
            workB[nidx] += errB * factor;
        };

        if (mode === 'floyd') {
            distribute(1, 0, 7 / 16);
            distribute(-1, 1, 3 / 16);
            distribute(0, 1, 5 / 16);
            distribute(1, 1, 1 / 16);
        } else if (mode === 'atkinson') {
            distribute(1, 0, 1 / 8);
            distribute(2, 0, 1 / 8);
            distribute(-1, 1, 1 / 8);
            distribute(0, 1, 1 / 8);
            distribute(1, 1, 1 / 8);
            distribute(0, 2, 1 / 8);
        }
    },
    luminance: (r, g, b) => 0.299 * r + 0.587 * g + 0.114 * b
};
