/**
 * Functions for overwrite cornerstone - v0.9.0.
 */

(function (cornerstone) {
    "use strict";
    function disable(element) {
        if(element === undefined) {
            throw "disable: element element must not be undefined";
        }

        // Search for this element in this list of enabled elements
        var enabledElements = cornerstone.getEnabledElements();
        for(var i=0; i < enabledElements.length; i++) {
            if(enabledElements[i].element === element) {
                // We found it!

                // Fire an event so dependencies can cleanup
                var eventData = {
                    element : element
                };
                $(element).trigger("CornerstoneElementDisabled", eventData);

                // remove the child dom elements that we created (e.g.canvas)
                //Canvas is created by Angular 2 so don't remove it. Here just for reference
                //enabledElements[i].element.removeChild(enabledElements[i].canvas);

                // remove this element from the list of enabled elements
                enabledElements.splice(i, 1);
                return;
            }
        }
    }
    // module/private exports
    cornerstone.disable = disable;
}(cornerstone));
/**
 * This module is responsible for enabling an element to display images with cornerstone
 */
(function (cornerstone) {
    "use strict";
    function enable(element, canvas) {
        if(element === undefined) {
            throw "enable: parameter element cannot be undefined";
        }
        var el = {
            element: element,
            canvas: canvas,
            image : undefined, // will be set once image is loaded
            invalid: false, // true if image needs to be drawn, false if not
            data : {}
        };
        cornerstone.addEnabledElement(el);
        cornerstone.resize(element, true);
        return element;
    }
    // module/private exports
    cornerstone.enable = enable;
}(cornerstone));


/**
 * This module will fit an image to fit inside the canvas displaying it such that all pixels
 * in the image are viewable
 */
(function (cornerstone) {

    "use strict";

    function getImageSize(enabledElement) {
        if(enabledElement.viewport.rotation === 0 || enabledElement.viewport.rotation === 180) {
            return {
                width: enabledElement.image.width,
                height: enabledElement.image.height
            };
        } else {
            return {
                width: enabledElement.image.height,
                height: enabledElement.image.width
            };
        }
    }

    /**
     * Adjusts an images scale and center so the image is centered and completely visible
     * @param element
     */
    function fitToWindow(element)
    {
        var enabledElement = cornerstone.getEnabledElement(element);
        var imageSize = getImageSize(enabledElement);

        var verticalScale = enabledElement.canvas.height / imageSize.height;
        var horizontalScale = enabledElement.canvas.width / imageSize.width;
        if(horizontalScale < verticalScale) {
            enabledElement.viewport.scale = horizontalScale;
        }
        else
        {
            enabledElement.viewport.scale = verticalScale;
        }
        // took out the code of resetting translation x and y to 0,
        // because we want the image to stay its pan position during resize window
        cornerstone.updateImage(element);
    }

    cornerstone.fitToWindow = fitToWindow;
}(cornerstone));

/**
 * This module is responsible for drawing an image to an enabled elements canvas element
 */

(function (cornerstone) {

    "use strict";

    var colorRenderCanvas = document.createElement('canvas');
    var colorRenderCanvasContext;
    var colorRenderCanvasData;

    var lastRenderedImageId;
    var lastRenderedViewport = {};

    function initializeColorRenderCanvas(image)
    {
        // Resize the canvas
        colorRenderCanvas.width = image.width;
        colorRenderCanvas.height = image.height;

        // get the canvas data so we can write to it directly
        colorRenderCanvasContext = colorRenderCanvas.getContext('2d');
        colorRenderCanvasContext.fillStyle = 'white';
        colorRenderCanvasContext.fillRect(0,0, colorRenderCanvas.width, colorRenderCanvas.height);
        colorRenderCanvasData = colorRenderCanvasContext.getImageData(0,0,image.width, image.height);
    }


    function getLut(image, viewport)
    {
        // if we have a cached lut and it has the right values, return it immediately
        if(image.lut !== undefined &&
            image.lut.windowCenter === viewport.voi.windowCenter &&
            image.lut.windowWidth === viewport.voi.windowWidth &&
            image.lut.invert === viewport.invert) {
            return image.lut;
        }

        // lut is invalid or not present, regenerate it and cache it
        cornerstone.generateLut(image, viewport.voi.windowWidth, viewport.voi.windowCenter, viewport.invert);
        image.lut.windowWidth = viewport.voi.windowWidth;
        image.lut.windowCenter = viewport.voi.windowCenter;
        image.lut.invert = viewport.invert;
        return image.lut;
    }

    function doesImageNeedToBeRendered(enabledElement, image)
    {
        if(image.imageId !== lastRenderedImageId ||
            lastRenderedViewport.windowCenter !== enabledElement.viewport.voi.windowCenter ||
            lastRenderedViewport.windowWidth !== enabledElement.viewport.voi.windowWidth ||
            lastRenderedViewport.invert !== enabledElement.viewport.invert ||
            lastRenderedViewport.rotation !== enabledElement.viewport.rotation ||
            lastRenderedViewport.hflip !== enabledElement.viewport.hflip ||
            lastRenderedViewport.vflip !== enabledElement.viewport.vflip
        )
        {
            return true;
        }

        return false;
    }

    function getRenderCanvas(enabledElement, image, invalidated)
    {

        // The ww/wc is identity and not inverted - get a canvas with the image rendered into it for
        // fast drawing
        if(enabledElement.viewport.voi.windowWidth === 255 &&
            enabledElement.viewport.voi.windowCenter === 128 &&
            enabledElement.viewport.invert === false &&
            image.getCanvas &&
            image.getCanvas()
        )
        {
            return image.getCanvas();
        }

        // apply the lut to the stored pixel data onto the render canvas
        if(doesImageNeedToBeRendered(enabledElement, image) === false && invalidated !== true) {
            return colorRenderCanvas;
        }

        // If our render canvas does not match the size of this image reset it
        // NOTE: This might be inefficient if we are updating multiple images of different
        // sizes frequently.
        //When using Safari the renderCanvas for the last image is displayed on the first image.  So
        //we will force that a new renderCanvas is always created. bap
        /*if(colorRenderCanvas.width !== image.width || colorRenderCanvas.height != image.height) {
         initializeColorRenderCanvas(image);
         }*/
        initializeColorRenderCanvas(image);
        // get the lut to use
        var colorLut = getLut(image, enabledElement.viewport);

        // the color image voi/invert has been modified - apply the lut to the underlying
        // pixel data and put it into the renderCanvas
        cornerstone.storedColorPixelDataToCanvasImageData(image, colorLut, colorRenderCanvasData.data);
        colorRenderCanvasContext.putImageData(colorRenderCanvasData, 0, 0);
        return colorRenderCanvas;
    }

    /**
     * API function to render a color image to an enabled element
     * @param enabledElement
     * @param invalidated - true if pixel data has been invaldiated and cached rendering should not be used
     */
    function renderColorImage(enabledElement, invalidated) {

        if(enabledElement === undefined) {
            throw "drawImage: enabledElement parameter must not be undefined";
        }
        var image = enabledElement.image;
        if(image === undefined) {
            throw "drawImage: image must be loaded before it can be drawn";
        }

        // get the canvas context and reset the transform
        var context = enabledElement.canvas.getContext('2d');
        context.setTransform(1, 0, 0, 1, 0, 0);

        // clear the canvas
        context.fillStyle = 'black';
        context.fillRect(0,0, enabledElement.canvas.width, enabledElement.canvas.height);

        // turn off image smooth/interpolation if pixelReplication is set in the viewport
        if(enabledElement.viewport.pixelReplication === true) {
            context.imageSmoothingEnabled = false;
            context.mozImageSmoothingEnabled = false; // firefox doesn't support imageSmoothingEnabled yet
        }
        else {
            context.imageSmoothingEnabled = true;
            context.mozImageSmoothingEnabled = true;
        }

        // save the canvas context state and apply the viewport properties
        context.save();
        cornerstone.setToPixelCoordinateSystem(enabledElement, context);
        var renderCanvas = getRenderCanvas(enabledElement, image, invalidated);

        context.drawImage(renderCanvas, 0,0, image.width, image.height, 0, 0, image.width, image.height);

        context.restore();

        lastRenderedImageId = image.imageId;
        lastRenderedViewport.windowCenter = enabledElement.viewport.voi.windowCenter;
        lastRenderedViewport.windowWidth = enabledElement.viewport.voi.windowWidth;
        lastRenderedViewport.invert = enabledElement.viewport.invert;
        lastRenderedViewport.rotation = enabledElement.viewport.rotation;
        lastRenderedViewport.hflip = enabledElement.viewport.hflip;
        lastRenderedViewport.vflip = enabledElement.viewport.vflip;
    }

    // Module exports
    cornerstone.rendering.colorImage = renderColorImage;
    cornerstone.renderColorImage = renderColorImage;
}(cornerstone));

/**
 * Resets the rotation, invert color, horizontal flip, vertical flip states to the default settings.
 */
(function (cornerstone) {

    "use strict";

    /**
     * Resets adjustments to the default settings.
     * @param element
     */
    function resetAdjustments(element)
    {
        var enabledElement = cornerstone.getEnabledElement(element);
        var newViewport = enabledElement.viewport;
        newViewport.rotation = 0;
        newViewport.invert = enabledElement.image.invert;
        newViewport.hflip = false;
        newViewport.vflip = false;
        enabledElement.viewport = newViewport;
        cornerstone.updateImage(element);
    }

    cornerstone.resetAdjustments = resetAdjustments;
}(cornerstone));

(function (cornerstone) {

    "use strict";

    function calculateTransform(enabledElement, scale) {
        var yOffset = 0;
        var xOffset = -enabledElement.image.width / 2;
        var transform = new cornerstone.internal.Transform();
        transform.translate(enabledElement.canvas.width / 2, 0);

        //Apply the rotation before scaling for non square pixels
        var angle = enabledElement.viewport.rotation;
        if(angle!==0) {
            transform.rotate(angle*Math.PI/180);
        }

        // apply the scale
        var widthScale = enabledElement.viewport.scale;
        var heightScale = enabledElement.viewport.scale;
        if(enabledElement.image.rowPixelSpacing < enabledElement.image.columnPixelSpacing) {
            widthScale = widthScale * (enabledElement.image.columnPixelSpacing / enabledElement.image.rowPixelSpacing);
        }
        else if(enabledElement.image.columnPixelSpacing < enabledElement.image.rowPixelSpacing) {
            heightScale = heightScale * (enabledElement.image.rowPixelSpacing / enabledElement.image.columnPixelSpacing);
        }
        transform.scale(widthScale, heightScale);

        // unrotate to so we can translate unrotated
        if(angle!==0) {
            transform.rotate(-angle*Math.PI/180);
        }

        // apply the pan offset
        transform.translate(enabledElement.viewport.translation.x, enabledElement.viewport.translation.y);

        // rotate again so we can apply general scale
        if(angle!==0) {
            transform.rotate(angle*Math.PI/180);
        }

        if(scale !== undefined) {
            // apply the font scale
            transform.scale(scale, scale);
        }

        //Apply Flip if required
        if(enabledElement.viewport.hflip) {
            transform.scale(-1,1);
        }

        if(enabledElement.viewport.vflip) {
            transform.scale(1,-1);
            yOffset = -enabledElement.image.height;
        }

        switch (angle) {
            case 0:
                break;
            case 90:
                xOffset = 0;
                yOffset = -enabledElement.image.height / 2;
                if(enabledElement.viewport.hflip) {
                    xOffset = -enabledElement.image.width;
                }
                break;
            case 180:
                yOffset = -enabledElement.image.height;
                if(enabledElement.viewport.vflip) {
                    yOffset = 0;
                }
                break;
            case 270:
                xOffset = -enabledElement.image.width;
                yOffset = -enabledElement.image.height / 2;
                if(enabledElement.viewport.hflip) {
                    xOffset = 0;
                }
                break;
        }

        // translate the origin back to the corner of the image so the event handlers can draw in image coordinate system
        transform.translate(xOffset , yOffset);
        return transform;
    }

    // Module exports
    cornerstone.internal.calculateTransform = calculateTransform;
}(cornerstone));