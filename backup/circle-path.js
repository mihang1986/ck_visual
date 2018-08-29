const Path = require('./path');

/***
 * deprecated use arc-path
 */
module.exports = (function () {
    return Path.create({
        options : {
            cX : 0,
            cY : 0,
            r : 100,
            clockwise : true
        },
        resolve : function (percent) {
            var k = 360 * percent,
                sp = this.clockwise ? percent : 1 - percent,
                sk = this.clockwise ? k + 90 : 360 - k -90;

            return [this.cX + Math.cos(sp * Math.PI * 2) * this.r,
                this.cY + Math.sin(sp * Math.PI * 2) * this.r, sk];
        }
    });
}());