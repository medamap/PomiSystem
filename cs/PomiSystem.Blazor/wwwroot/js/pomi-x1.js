window.pomiX1 = {
    drawPreview: async (canvas, dataUrl, outputMode, cropPosition) => {
        if (!window.pomiImage || !window.pomiImage.drawToCanvas) {
            return null;
        }
        const result = await window.pomiImage.drawToCanvas(canvas, dataUrl, {
            smooth: true,
            outputMode: outputMode || 'x1',
            cropPosition: cropPosition || 50,
            fillStyle: '#000'
        });
        if (!result) {
            return null;
        }
        const cropText = result.dims.cropX > 0 || result.dims.cropY > 0
            ? ` / ${result.dims.cropDirection === 'horizontal' ? '左右' : '上下'} ${result.dims.cropPosition}%`
            : '';
        return `${result.srcW}×${result.srcH} → ${result.targetW}×${result.targetH} (X1 Preview)${cropText}`;
    }
};
