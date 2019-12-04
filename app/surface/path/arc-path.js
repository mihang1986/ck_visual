const Path = require('./path');

module.exports = (function () {
    return Path.create({
        options : {
            x : 0,
            y : 0,
            r : 10,
            sAngle : 0,
            eAngle : Math.PI,
            clockwise : false,
            inversion : false
        },
        resolve : function (percent) {
            var s = this.sAngle,
                e = this.clockwise ? - (Math.PI * 2 - this.eAngle) : this.eAngle,
                p = this.inversion ? 1 - percent : percent,
                c = e - s,
                sk = s + c * p + (this.clockwise ? Math.PI * 1.5 : Math.PI * .5);

            return [this.x + Math.cos(c * p + s) * this.r,
                this.y + Math.sin(c * p + s) * this.r,
                this.inversion ? sk - Math.PI: sk];
        },
        length : function () {
            return Math.abs(this.sAngle - this.eAngle) * this.r;
        }
    });
}());


// var k = 360 * percent,
//     s = this.sAngle,
//     e = this.eAngle,
//     p = this.inversion ? 1 - percent : percent,
//     sk = this.clockwise ? k + 90 : 360 - k -90,
//     c =  this.clockwise ?  s + s-e: s + e - s;
//
// return [this.x + Math.cos(p * c) * this.r,
//     this.y + Math.sin(p * c) * this.r, sk];