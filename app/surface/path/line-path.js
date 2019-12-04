const Path = require('./path');

module.exports = (function () {
    return Path.create({
        options : { // 两点确定一线
            x0 : 0,
            y0 : 0,
            x1 : 100,
            y1 : 100
        },
        init : function () {

        },
        resolve : function (percent) {
            var tana = (this.y1 - this.y0) / (this.x1 - this.x0),
                k = Math.atan(tana);

            if(this.x0 > this.x1) k+= Math.PI;
            return [this.x0 + (this.x1 - this.x0) * percent,
                this.y0 + (this.y1 - this.y0) * percent, k];
        },
        length : function () {
            return Math.sqrt(Math.pow(this.x0 - this.x1, 2) + Math.pow(this.y0 - this.y1, 2));
        }
    });
}());