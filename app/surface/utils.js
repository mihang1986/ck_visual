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

    // 分解颜色
    var rgb = /rgb\((\d+), ?(\d+), ?(\d+)\)/i,
        hex = /^#([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})$/i,
        shex = /^#([0-9a-fA-F])([0-9a-fA-F])([0-9a-fA-F])$/i,
        iscolor = /(?:rgb)|#/i,
        _color = {
            parseColorToRGB : function (color) {
                var matcher = null;

                if(rgb.test(color)){
                    matcher = rgb.exec(color);
                    return [parseInt(matcher[1], 10),
                        parseInt(matcher[2], 10),
                        parseInt(matcher[3], 10)];

                }else if(hex.test(color)){
                    matcher = hex.exec(color);
                    return [
                        parseInt(matcher[1], 16),
                        parseInt(matcher[2], 16),
                        parseInt(matcher[3], 16)];

                }else if(shex.test(color)){
                    matcher = shex.exec(color);
                    return [parseInt(matcher[1] + matcher[1], 16),
                        parseInt(matcher[2] + matcher[2], 16),
                        parseInt(matcher[3] + matcher[3], 16)];

                }else{
                    return undefined;
                }
            },
            parseRGBToHex : function(color){
                var r,
                    g,
                    b;

                if(arguments.length == 1){
                    r = color[0];
                    g = color[1];
                    b = color[2];
                }else if(arguments.length == 3){
                    r = arguments[0];
                    g = arguments[1];
                    b = arguments[2];
                }else{
                    return undefined;
                }

                r = r < 16 ? "0" + r.toString(16) : r.toString(16);
                g = g < 16 ? "0" + g.toString(16) : g.toString(16);
                b = b < 16 ? "0" + b.toString(16) : b.toString(16);

                return "#" + r + g + b;

            },
            excessive : function (start, end, percent) {
                var color = [parseInt((end[0] - start[0]) * percent + start[0]),
                    parseInt((end[1] - start[1]) * percent + start[1]),
                    parseInt((end[2] - start[2]) * percent + start[2])];
                return this.parseRGBToHex(color);
            }
        };

    const
        toRadian = function(degree){
            return Math.PI / 180 * degree;
        },
        toDegree = function(radian){
            return 180 / Math.PI * radian;
        },
        length = function(vec){
            return Math.sqrt(Math.pow(vec[0], 2) + Math.pow(vec[1], 2));
        },
        distance = function(point1, point2){
            const
                x = point2[0] - point1[0],
                y = point2[1] - point1[1];
            return length([x, y]);
        },
        middle = function(point1, point2){
            return [
                (point1[0] + point2[0]) / 2.0,
                (point1[1] + point2[1]) / 2.0
            ];
        },
        normalize = function (vec) {
            const l = length(vec);
            return [vec[0] / l, vec[1] / l];
        },
        multiply = function (vec, real) {
            return [vec[0] * real, vec[1] * real];
        },
        dot = function (vec1, vec2) {
            return vec1[0] * vec2[0] + vec1[1] * vec2[1];
        },
        roate = function (vec, degree) {
            const
                x = vec[0],
                y = vec[1],
                a = toRadian(degree),
                sinA = Math.sin(a),
                cosA = Math.cos(a);
            return [x * cosA - y * sinA, x * sinA + y * cosA];
        },
        vector = function (point1, point2) {
            return [point2[0] - point1[0], point2[1] - point1[1]];
        },
        reverse = function (vec) {
            return [-vec[0], -vec[1]];
        },
        add = function (point, vec) {
            return [point[0] + vec[0], point[1] + vec[1]];
        },
        dec = function(point, vec){
            return [point[0] - vec[0], point[1] - vec[1]];
        },
        atan2 = function (vec) {
            return Math.atan2(vec[1], vec[0]);
        };


    const
        // _arc = CanvasRenderingContext2D.prototype.arc,
        _helper = {
            fillArc : (ctx, x, y, r, color = '#f0f', s = 0, e = Math.PI * 2) => {
                ctx.fillStyle= color;
                ctx.beginPath();
                ctx.arc(x, y, r, s, e);
                ctx.fill();
            },
            fillArc2 : function (ctx, x, y, radius, width, color = '#f0f', start = 0, end = Math.PI * 2) {
                ctx.fillStyle = color;
                ctx.beginPath();
                ctx.arc(x, y, Math.max(radius - width / 2, 0), start, end);
                ctx.lineTo(Math.cos(end) * (radius + width / 2) + x, Math.sin(end) * (radius + width / 2) + y);
                ctx.arc(x, y, Math.max(radius + width / 2, 0), end, start, true);
                // ctx.lineTo(Math.cos(start) * (radius - width / 2) + x, Math.sin(start) * (radius - width / 2) + y);
                ctx.closePath();
                ctx.fill();
            },
            strokeArc : (ctx, x, y, r, color = '#f0f', s = 0, e = Math.PI * 2) => {
                ctx.strokeStyle = color;
                ctx.beginPath();
                ctx.arc(x, y, r, s, e);
                ctx.stroke();
            },
            setShadow : (ctx, color = '#fff', blur = 5) => {
                ctx.shadowOffsetX = 0;
                ctx.shadowOffsetY = 0;
                ctx.shadowColor = color;
                ctx.shadowBlur = blur;
            },
            clearShadow : (ctx) => {
                ctx.shadowOffsetX = 0;
                ctx.shadowOffsetY = 0;
                ctx.shadowBlur = 0;
            }
        };


    const
        deepAssign = function da(src, dst) {
            if(_.isPlainObject(dst)){
                Object.entries(dst).forEach(([k, v]) => {
                    if(src[k])
                        src[k] = da(src[k], v);
                    else
                        src[k] = v;
                });
                return src;
            }else
                return dst ? dst : src;
        };

    return {
        nearRoundNumber : function (number) {
            const
                p1 = Math.pow(10, (number + '').length - 1);

            return number % p1 === 0 ?
                number : (Math.floor(number / p1) + 1) * p1;
        },
        deepAssign : deepAssign,
        Formatter : {
            thousands : function format (num) {
                var reg=/\d{1,3}(?=(\d{3})+$)/g;
                return (num + '').replace(reg, '$&,');
            }
        },
        Helper : _helper,
        extends : _extends,
        mixin : _mixin,
        toRadian : toRadian,
        toDegree : toDegree,
        getArrayAt : (arr, idx) => {
            const
                aidx = idx % arr.length;
            return aidx >= 0 ? arr[aidx] : arr[arr.length + aidx]
        },
        loadImageAsync : async function(url){
            return new Promise(function (r, j) {
                new _image(url, function () {
                   r(this);
                });
            });
        },
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
        proxy : proxy,
        color : _color,
        Math : {
            twoPointArc : function (point1, point2, radius, ccw = false) {
                if(radius < distance(point1, point2) / 2)
                    throw '不合法的半径';

                const
                    tpVector = vector(point1, point2),
                    norVector = normalize(roate(tpVector, ccw ? -90 : 90)),
                    movVector = multiply(norVector, Math.sqrt(Math.pow(radius, 2) - Math.pow(length(tpVector) / 2, 2))),
                    cirCenter = add(middle(point1, point2), movVector),
                    startArc = atan2(vector(point1, cirCenter)) + Math.PI,
                    endArc = atan2(vector(point2, cirCenter))+ Math.PI;

                return {
                    origin : cirCenter,
                    start : ccw ? endArc : startArc,
                    end : ccw ? startArc : endArc,
                    radius : radius
                };
            },
            cross : function (v1, v2) { // 平面差积 https://blog.csdn.net/swustzhaoxingda/article/details/85156559
                return v1[0] * v2[1] - v2[0] * v1[1];
            },
            toRadian,
            toDegree,
            length,
            distance,
            middle,
            normalize,
            multiply,
            dot,
            roate,
            vector,
            reverse,
            add,
            dec,
            atan2,
            mix(x, y, p){
                return (1 - p) * x + y * p;
            }
        }

    };
}());
