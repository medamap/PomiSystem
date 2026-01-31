window.pomiImage = {
    calculateDimensions: (srcWidth, srcHeight, mode, cropPosition) => {
        if (!srcWidth || !srcHeight) {
            return {
                width: 0,
                height: 0,
                cropX: 0,
                cropY: 0,
                srcW: 0,
                srcH: 0,
                cropDirection: 'horizontal',
                cropPosition: cropPosition || 50
            };
        }
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
    loadImage: (dataUrl) => new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error('Image load failed'));
        img.src = dataUrl;
    }),
    drawToCanvas: async (canvas, dataUrl, options) => {
        if (!canvas || !dataUrl) {
            return null;
        }
        const ctx = canvas.getContext('2d');
        if (!ctx) {
            return null;
        }
        const opts = options || {};
        const img = await window.pomiImage.loadImage(dataUrl);
        const srcW = img.naturalWidth || img.width;
        const srcH = img.naturalHeight || img.height;
        const dims = window.pomiImage.calculateDimensions(srcW, srcH, opts.outputMode || 'msx', opts.cropPosition || 50);
        const targetW = dims.width;
        const targetH = dims.height;

        canvas.width = targetW;
        canvas.height = targetH;
        ctx.clearRect(0, 0, targetW, targetH);
        if (opts.fillStyle) {
            ctx.fillStyle = opts.fillStyle;
            ctx.fillRect(0, 0, targetW, targetH);
        }
        ctx.imageSmoothingEnabled = !!opts.smooth;
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

        return {
            img,
            dims,
            srcW,
            srcH,
            targetW,
            targetH,
            ctx
        };
    }
};
