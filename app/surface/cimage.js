const
    axios = require('axios');

module.exports = (function () {
    const
        loadImage = async url => {
            return new Promise((r, j) => {
                const image = new Image;
                image.src = url;
                image.addEventListener('load', function () {
                    r(this);
                });
                image.addEventListener('abort', function () {
                    j('load image abort.');
                });
                image.addEventListener('error', function () {
                    j('load image error.');
                });
            });
        },
        loadImages = async urls => {
            return new Promise((r, j) => {
                const result = [];
                for(let url of urls){
                    result.push(loadImage(url));
                }

                Promise.all(result)
                    .then(x=>r(x))
                    .catch(j);
            });
        },
        loadSvg = async (url, proc) => {
            const
                req = await axios.get(url),
                svg = /(\<svg.*)/.exec(req.data)[1],
                img = new Image();

            img.src = 'data:image/svg+xml;base64,' + window.btoa(unescape(encodeURIComponent(proc ? proc(svg) : svg)));
            //img.src = 'data:image/svg+xml,' + unescape(encodeURIComponent(svg));

            return img;
        },
        loadSvgs = async (...urls) => {
            return new Promise((r, j) => {
                const result = [];
                for(let url of urls){
                    result.push(loadSvg(url));
                }
                Promise.all(result)
                    .then(x=>r(x))
                    .catch(j);
            });
        },
        makeCanvasFromImage = function (image) {
            var canvas = document.createElement("canvas");
            canvas.width = image.naturalWidth;
            canvas.height = image.naturalHeight;
            canvas.getContext("2d").drawImage(image, 0, 0);
            return canvas;
        },
        makeCanvasFromData = function(imageData, width, height){
            var canvas = document.createElement("canvas");
            canvas.width = width;
            canvas.height = height;
            canvas.getContext("2d").putImageData(imageData, 0, 0);
            return canvas;
        };

    const
        effect = {
            'gauss' : function gaussBlur(imgData, opts) {
                opts = Object.assign({radius : 10, sigma : 10}, opts);

                var pixes = imgData.data;
                var width = imgData.width;
                var height = imgData.height;
                var gaussMatrix = [],
                    gaussSum = 0,
                    x, y,
                    r, g, b, a,
                    i, j, k, len;

                var radius = opts.radius
                var sigma = opts.sigma;

                a = 1 / (Math.sqrt(2 * Math.PI) * sigma);
                b = -1 / (2 * sigma * sigma);
                //生成高斯矩阵
                for (i = 0, x = -radius; x <= radius; x++, i++){
                    g = a * Math.exp(b * x * x);
                    gaussMatrix[i] = g;
                    gaussSum += g;

                }
                //归一化, 保证高斯矩阵的值在[0,1]之间
                for (i = 0, len = gaussMatrix.length; i < len; i++) {
                    gaussMatrix[i] /= gaussSum;
                }
                //x 方向一维高斯运算
                for (y = 0; y < height; y++) {
                    for (x = 0; x < width; x++) {
                        r = g = b = a = 0;
                        gaussSum = 0;
                        for(j = -radius; j <= radius; j++){
                            k = x + j;
                            if(k >= 0 && k < width){//确保 k 没超出 x 的范围
                                //r,g,b,a 四个一组
                                i = (y * width + k) * 4;
                                r += pixes[i] * gaussMatrix[j + radius];
                                g += pixes[i + 1] * gaussMatrix[j + radius];
                                b += pixes[i + 2] * gaussMatrix[j + radius];
                                // a += pixes[i + 3] * gaussMatrix[j];
                                gaussSum += gaussMatrix[j + radius];
                            }
                        }
                        i = (y * width + x) * 4;
                        // 除以 gaussSum 是为了消除处于边缘的像素, 高斯运算不足的问题
                        // console.log(gaussSum)
                        pixes[i] = r / gaussSum;
                        pixes[i + 1] = g / gaussSum;
                        pixes[i + 2] = b / gaussSum;
                        // pixes[i + 3] = a ;
                    }
                }
                //y 方向一维高斯运算
                for (x = 0; x < width; x++) {
                    for (y = 0; y < height; y++) {
                        r = g = b = a = 0;
                        gaussSum = 0;
                        for(j = -radius; j <= radius; j++){
                            k = y + j;
                            if(k >= 0 && k < height){//确保 k 没超出 y 的范围
                                i = (k * width + x) * 4;
                                r += pixes[i] * gaussMatrix[j + radius];
                                g += pixes[i + 1] * gaussMatrix[j + radius];
                                b += pixes[i + 2] * gaussMatrix[j + radius];
                                // a += pixes[i + 3] * gaussMatrix[j];
                                gaussSum += gaussMatrix[j + radius];
                            }
                        }
                        i = (y * width + x) * 4;
                        pixes[i] = r / gaussSum;
                        pixes[i + 1] = g / gaussSum;
                        pixes[i + 2] = b / gaussSum;
                    }
                }
                return imgData;
            }
        };

    class CImage {
        constructor(img) {
            this.cvs = makeCanvasFromImage(img);
            this.ctx = this.cvs.getContext('2d');
        }

        get width(){
            return this.cvs.width;
        }

        get height(){
            return this.cvs.height;
        }

        get context(){
            return this.ctx;
        }

        get canvas(){
            return this.cvs;
        }

        effect(type, args){
            if(!effect[type])
                throw 'illegal effect type.';

            const
                data = this.context.getImageData(0, 0, this.width, this.height),
                cvs = makeCanvasFromData(effect[type].call(this, data, args), this.width, this.height);

            this.cvs = cvs;
            this.ctx = this.cvs.getContext('2d');
            return this;
        }
    }

    CImage.loadImage = async url => {
        return new CImage(await loadImage(url));
    };

    CImage.loadImages = async (...urls) => {
        const images = await loadImages(urls);
        return images.map(img=>new CImage((img)));
    };

    CImage.loadSvg = async (url, proc) => {
        return new CImage(await loadSvg(url, proc));
    };

    CImage.loadSvgs = async (...urls) => {
        const svgs = await loadSvgs(...urls);
        return svgs.map(svg => new CImage((svg)));
    };

    return CImage;
}());