window.pomiColor = {
    applyAdjustments: (imageData, brightness, contrast, saturation) => {
        if (!imageData || !imageData.data) {
            return imageData;
        }
        const data = imageData.data;
        const brightnessFactor = (brightness || 0) / 100;
        const contrastFactor = ((contrast || 0) + 100) / 100;
        const saturationFactor = ((saturation || 0) + 100) / 100;

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
        return imageData;
    }
};
