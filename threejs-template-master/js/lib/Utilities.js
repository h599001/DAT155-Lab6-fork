"use strict";

/**
 * Collection of general purpose utilities.
 * oskarbraten
 */
export default class Utilities {
	/**
	 * Loads image from url.
	 * @param  {String} url Location of image to load.
	 * @return {Promise} A Promise-object that resolves with the Image-object.
	 */
    static loadImage(url) {
        return new Promise((resolve, reject) => {

            if (!url) {
                reject('No URL was specified.');
            }

            let image = new Image();
            image.src = url;

            image.addEventListener('load', () => {
                resolve(image);
            });

            image.addEventListener('error', () => {
                reject('Unable to load image. Make sure the URL is correct (' + image.src + ').');
            });
        });
    }

	/**
	 * Loads heightmap data from an image.
	 * The image must be completely loaded before using this method.
	 * @param  {Image} image Image to load.
	 * @return {Array} A Uint8Array containing the heightmap data.
	 */
    static getHeightmapData(image, size) {
        let canvas = document.createElement('canvas');

        // assume texture is a square
        canvas.width = size;
        canvas.height = size;

        let context = canvas.getContext('2d');
        context.imageSmoothingEnabled = true;
        context.imageSmoothingQuality = "high";

        let data = new Float32Array(size * size);

        context.drawImage(image, 0, 0, size, size);

        let imageData = context.getImageData(0, 0, size, size).data;

        for (let i = 0; i < imageData.length; i += 4) {
            data[i / 4] = imageData[i] / 255.0; // Assuming grayscale for simplicity
        }

        const smoothingFactor = 1;
        // Apply smoothing filter
        for (let i = 0; i < size; i++) {
            for (let j = 0; j < size; j++) {
                let sum = 0;
                let count = 0;
                for (let m = -smoothingFactor; m <= smoothingFactor; m++) {
                    for (let n = -smoothingFactor; n <= smoothingFactor; n++) {
                        if (i + m >= 0 && i + m < size && j + n >= 0 && j + n < size) {
                            sum += data[(i + m) * size + (j + n)];
                            count++;
                        }
                    }
                }
                data[i * size + j] = sum / count;
            }
        }

        return data;
    }
}