window.pomiImage = {
    buildResizeRequest: (canvas, dataUrl, options) => {
        const opts = options || {};
        return {
            canvas,
            dataUrl,
            outputMode: opts.outputMode || 'msx',
            cropPosition: typeof opts.cropPosition === 'number' ? opts.cropPosition : 50,
            smooth: !!opts.smooth,
            fillStyle: opts.fillStyle || ''
        };
    },
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
            x1: { w: 320, h: 200 },
            x1x2: { w: 640, h: 400 },
            x1x4: { w: 1280, h: 800 },
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
        } else if (mode === 'auto' || mode === 'autox2' || mode === 'autox4' || mode === 'x1auto' || mode === 'x1autox2' || mode === 'x1autox4') {
            const isX1Auto = mode === 'x1auto' || mode === 'x1autox2' || mode === 'x1autox4';
            const multiplier = mode.endsWith('x4') ? 4 : (mode.endsWith('x2') ? 2 : 1);
            const baseHeight = (isX1Auto ? 200 : 192) * multiplier;
            const baseWidth = (isX1Auto ? 320 : 256) * multiplier;
            const aspect = srcWidth / srcHeight;
            if (aspect >= 1) {
                height = baseHeight;
                width = Math.round(height * aspect);
            } else {
                width = Math.round(baseWidth);
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
    drawToCanvasRequest: async (request) => {
        if (!request || !request.canvas || !request.dataUrl) {
            return null;
        }
        const canvas = request.canvas;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
            return null;
        }
        const img = await window.pomiImage.loadImage(request.dataUrl);
        const srcW = img.naturalWidth || img.width;
        const srcH = img.naturalHeight || img.height;
        const dims = window.pomiImage.calculateDimensions(srcW, srcH, request.outputMode || 'msx', request.cropPosition || 50);
        const targetW = dims.width;
        const targetH = dims.height;

        canvas.width = targetW;
        canvas.height = targetH;
        ctx.clearRect(0, 0, targetW, targetH);
        if (request.fillStyle) {
            ctx.fillStyle = request.fillStyle;
            ctx.fillRect(0, 0, targetW, targetH);
        }
        ctx.imageSmoothingEnabled = !!request.smooth;
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
            request,
            img,
            dims,
            srcW,
            srcH,
            targetW,
            targetH,
            ctx
        };
    },
    drawToCanvas: async (canvas, dataUrl, options) => {
        const request = window.pomiImage.buildResizeRequest(canvas, dataUrl, options);
        return window.pomiImage.drawToCanvasRequest(request);
    }
};
