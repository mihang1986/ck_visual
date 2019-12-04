const Path = require('./path'),
    ComboPath = require('./combo-path'),
    LinePath = require('./line-path');

module.exports = (function () {
    return Path.create({
        options : {
            x : 0,
            y : 0,
            w : 100,
            h : 100
        },
        init : function(){
            var paths = new ComboPath();
            paths.addPath(new LinePath({
                x0 : this.x,
                y0 : this.y,
                x1 : this.x + this.w,
                y1 : this.y
            })).addPath(new LinePath({
                x0 : this.x + this.w,
                y0 : this.y,
                x1 : this.x + this.w,
                y1 : this.y + this.h
            })).addPath(new LinePath({
                x0 : this.x + this.w,
                y0 : this.y + this.h,
                x1 : this.x,
                y1 : this.y + this.h
            })).addPath(new LinePath({
                x0 : this.x,
                y0 : this.y + this.h,
                x1 : this.x,
                y1 : this.y
            }));

            this._paths = paths;
        },
        resolve : function (percent) {
            return this._paths.resolve(percent);
        },
        length : function () {
            return this._paths.length();
        }
    });
}());
