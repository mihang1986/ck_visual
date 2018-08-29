/**
 *  EaseCubic
 */

const Interpolator = require('./interpolator');

module.exports = (function () {

    var cubicCurves  = function(t,  value0,  value1, value2,  value3){
        var value,
            u = 1 - t,
            tt = t * t,
            uu = u * u,
            uuu = uu * u,
            ttt = tt * t,

            value = uuu * value0;
        value += 3 * uu * t * value1;
        value += 3 * u * tt * value2;
        value += ttt * value3;

        return value;
    };

    return Interpolator.create({
        options : {
            x1: 0.79,
            x2: 0.27,
            y1: 0.25,
            y2: 0.68
        },
        init : function(){
            this.ACCURACY = 4096;
        },
        resolve : function (input) {
            var t = input;
            // 近似求解t的值[0,1]
            for (var i = 0; i < this.ACCURACY; i++) {
                t = 1.0 * i / this.ACCURACY;
                var x = cubicCurves(t, 0, this.x1, this.x2, 1);
                if (x >= input) {
                    break;
                }
            }

            var value = cubicCurves(t, 0, this.y1, this.y2, 1);
            value = value > 0.999 ? 1 : value;
            return  value;
        }
    });
}());