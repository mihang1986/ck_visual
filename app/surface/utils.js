const _ = require('lodash');

module.exports = (function () {

    var _extends = function (source, target) {
        var result = {};

        if(source){
            for(var i in source){
                result[i] = source[i];
            }
        }

        if(target){
            for(var i in target){
                result[i] = target[i];
            }
        }

        return result;
    };

    var _mixin = function () {
        var args = [].slice.call(arguments, 0),
            _this = args.shift();
        args.forEach(function (val) {
            for(var o in val){
                _this[o] = val[o];
            }
        });
    };

    var _timer = (function () {
        var timer = function (interval, callback) {
            this.interval = interval;
            this.callback = callback;
            this.timePassed = 0;
        };

        timer.prototype = {
            pass : function (elaspe) {
                this.timePassed += elaspe;
                if(this.timePassed >= this.interval){
                    this.callback(this.timePassed);
                    this.timePassed = this.timePassed % this.interval;
                }
            }
        };

        return timer;
    }());

    var _image = (function () {

        var transforms = {
            gauss : function gaussBlur(imgData, opts) {
                opts = _extends({radius : 10, sigma : 10}, opts);

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
        },makeCanvasFromImage = function (image) {
            var canvas = document.createElement("canvas");
            canvas.width = image.naturalWidth;
            canvas.height = image.naturalHeight;
            canvas.getContext("2d").drawImage(image, 0, 0);
            return canvas;
        },makeCanvasFromData = function(imageData, width, height){
            var canvas = document.createElement("canvas");
            canvas.width = width;
            canvas.height = height;
            canvas.getContext("2d").putImageData(imageData, 0, 0);
            return canvas;
        };

        var image = function (url, callback, arg3) {
            var that = this, img;

            if(url instanceof _image){
                var data = url.getContext().getImageData(0, 0, url.getWidth(), url.getHeight());
                this.canvas = makeCanvasFromData(transforms[callback].call(this, data, arg3), url.getWidth(), url.getHeight());
            }else{
                img = new Image();
                img.src = url;
                img.onload = function () {
                    that.canvas = makeCanvasFromImage(this);
                    if(callback) callback.call(that);
                }
            }
        };

        image.prototype = {
            getWidth : function () {
                return this.canvas.width;
            },
            getHeight : function () {
                return this.canvas.height;
            },
            getCanvas : function () {
                return this.canvas;
            },
            getContext : function () {
                return this.canvas.getContext("2d");
            }
        };

        return image;
    }());

    var _value = function (val) {
        if(_.isFunction(val))
            return val();
        else
            return val;
    };

    var _privateProp = function (obj, prop, callback) {
        Object.defineProperty(obj, prop, {
            get : callback || function () {}
        });
    };

    var _watchArray = (function () {
        var vMethods = ['push', 'pop', 'shift', 'unshift', 'splice', 'sort', 'reverse']

        var WatchArray = function () {
            var args = [].slice.call(arguments, 0);
            if(args.length = 1 && _.isFunction(args[0])){
                this.callback = args[0];
            }
            Array.call(this, args);
        }, _F = function () {};

        _F.prototype = Array.prototype;
        WatchArray.prototype = new _F();

        vMethods.forEach(function (val) {
            WatchArray.prototype[val] = function () {
                var args = [].slice.call(arguments, 0),
                    sargs = [val].concat(args);
                if(this.callback){
                    if(this.callback.apply(this, sargs) != false){
                        _F.prototype[val].apply(this, args);
                    }
                }else{
                    _F.prototype[val].apply(this, args);
                }

            };
        });

        return WatchArray;
    }());

    var _randomStr = function (len) {
        var words = 'abcdefghijklmnopqrstuvwxyz1234567890',
            str = _.pad('', len, 'X').replace(/X/g, function () {
                return words.charAt(_.random(0, words.length ));
            });

        return str;
    };

    var physics = {
        ptInRect : function (px, py, rx, ry, rw, rh) {
            return px < rx ? false :
                px > rx + rw ? false :
                    py < ry ? false :
                        py > ry + rh ? false : true;
        }
    };

    var proxy = function (fun, ctx) {
        return function () {
            var args = [].slice.call(arguments, 0);
            return fun.apply(ctx, args);
        };
    };

    return {
        extends : _extends,
        mixin : _mixin,
        loadImage : function (url, callback) {
            return new _image(url, callback);
        },
        tranImage : function (image, type, args) {
            return new _image(image, type, args);
        },
        timer : function (interval, callback) {
            return new _timer(interval, callback);
        },
        value : _value,
        privateProp : _privateProp,
        randomStr : _randomStr,
        physics : physics,
        WatchArray : _watchArray,
        proxy : proxy
    };
}());
