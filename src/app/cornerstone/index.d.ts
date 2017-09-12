/* tslint:disable */
//cornerstone core API's
declare namespace cornerstone {

    interface el {
        element: any;
        canvas: any;
        image : any; // will be set once image is loaded
        invalid: boolean; // true if image needs to be drawn, false if not
        data : {};
    }

    interface viewport {
        scale: number;
        translation: {
            x: number;
            y: number;
        };
        voi: {
            windowCenter: number;
            windowWidth: number;
        };
        invert: boolean;
        pixelReplication: boolean;
        rotation: number;
        hflip: boolean;
        vflip: boolean;
        modalityLUT: any;
        voiLUT: any;
    }

    interface cacheInfo {
        maximumSizeInBytes : number;
        cacheSizeInBytes : number;
        numberOfImagesCached: number;
    }

    interface point {
        x: number;
        y: number;
    }

    function displayImage(element: any, image: any, viewport?: any): any;
    function draw(element: el): void;
    function drawInvalidated(): void;
    function enable(element: any, canvas: any): any;
    function disable(element: any): void;
    function getElementData(el: el, dataType: string): any;
    function removeElementData(el: el, dataType: string): void;
    function getEnabledElement(element: el): el;
    function addEnabledElement(enabledElement: el): void;
    function getEnabledElementsByImageId(imageId: string): el[];
    function getEnabledElements(): el[];
    function fitToWindow(element: el): void;
    function getDefaultViewportForImage(element: el, image: any): void;
    function getImage(element: el): void;
    function getPixels(element: any, x: number, y: number, width: number, height: number): number[];
    function getStoredPixels(element: any, x: number, y: number, width: number, height: number): number[];
    function getViewport(element: el): viewport;
    function loadImage(imageId: string): any;
    function loadAndCacheImage(imageId: string): any;
    function registerImageLoader(scheme: string, imageLoader: any): void;
    function registerUnknownImageLoader(imageLoader: any): any;
    function invalidate(element: el): void;
    function invalidateImageId(imageId: string): void;
    function pageToPixel(element: el, pageX: number, pageY: number): any;
    function pixelToCanvas(element: el, pt: point): point;
    function reset(element: el): void;
    function resetAdjustments(element: el): void;
    function resize(element: el, fitToWindow: boolean): void;
    function setToPixelCoordinateSystem(enabledElement: any, context: any, scale?: any): void;
    function setViewport(element: el, viewport: viewport): void;
    function updateImage(element: el, invalidated?: boolean): void;

    //Defined in internal but shared on top level
    function drawImage(enabledElement: any, invalidated?:boolean): void;
    function generateLutNew(image: any, windowWidth: number, windowCenter: number, invert: boolean, modalityLUT: any, voiLUT: any): any;
    function generateLut(image: any, windowWidth: number, windowCenter: number, invert: boolean, modalityLUT: any, voiLUT: any): any;
    function getDefaultViewport(canvas: any, image: any): viewport;
    function storedColorPixelDataToCanvasImageData(image: any, lut: any, canvasImageDataData: void): void;
    function storedPixelDataToCanvasImageData(image: any, lut: any, canvasImageDataData: any): void;

    //Defined in rendering but shared on top level
    function renderColorImage(enabledElement: any, invalidated?: boolean): void;
    function renderGrayscaleImage(enabledElement: any, invalidated?: boolean): any;
    function renderWebImage(enabledElement: any, invalidated?: boolean): any;

    let imageCache: {
        putImagePromise(imageId: string, imagePromise: any): void;
        getImagePromise(imageId: string): any;
        removeImagePromise(imageId: string): any;
        setMaximumSizeBytes(numBytes: number): void;
        getCacheInfo(): cacheInfo;
        purgeCache(): void;
        cachedImages: any[];
        changeImageIdCacheSize(imageId: string, newCacheSize: number): void;
    }

}

declare namespace cornerstone.internal {
    function calculateTransform(enabledElement: any, scale: number): any;
    function drawImage(enabledElement: any, invalidated?:boolean): void;
    function generateLutNew(image: any, windowWidth: number, windowCenter: number, invert: boolean, modalityLUT: any, voiLUT: any): any;
    function generateLut(image: any, windowWidth: number, windowCenter: number, invert: boolean, modalityLUT: any, voiLUT: any): any;
    function getDefaultViewport(canvas: any, image: any): viewport;
    function getTransform(enabledElement: any): any;
    function getModalityLUT(slope: number, intercept: any, modalityLUT: any): any;
    function storedColorPixelDataToCanvasImageData(image: any, lut: any, canvasImageDataData: void): void;
    function storedPixelDataToCanvasImageData(image: any, lut: any, canvasImageDataData: any): void;
    function getVOILUT(windowWidth: number, windowCenter: number, voiLUT: any): any;
    function renderColorImage(enabledElement: any, invalidated?: boolean): void;
    function renderGrayscaleImage(enabledElement: any, invalidated?: boolean): any;
    function renderWebImage(enabledElement: any, invalidated?: boolean): any;

    class Transform {
        constructor();
        reset(): void;
        clone(): void;
        multiply(matrix: any): void;
        invert(): void;
        rotate(rad: number): any;
        translate(x: number, y: number): void;
        scale(sx: number, sy: number): void;
        transformPoint(px: number, py: number): point;
    }

}
/* tslint:enable */
