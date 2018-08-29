const Path = require('./path');

module.exports = (function () {
    var _cubicCurves  = function(t,  value0,  value1, value2,  value3){
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
    }

    return Path.create({
        options : {
            x0 : 0,
            y0 : 0,
            x1 : 0,
            y1 : 0,
            x2 : 0,
            y2 : 0,
            x3 : 0,
            y3 : 0,
        },
        init : function () {

        },
        resolve : function (percent) {
            // 计算切线角度
            var _x = this.x0 * 3 * Math.pow((1 - percent) ,2) * (-1) + 3 * this.x1 * (Math.pow((1 - percent) ,2) + percent * 2 * (1 - percent) * (-1)) + 3 * this.x2 * (2 * percent * (1 - percent) + Math.pow(percent,2) * (-1)) + this.x3 * 3 * Math.pow(percent,2),
                _y = this.y0 * 3 * Math.pow((1 - percent) , 2) * (-1) + 3 * this.y1 * (Math.pow((1 - percent) ,2) + percent * 2 * (1 - percent) * (-1)) + 3 * this.y2 * (2 * percent * (1 - percent) + Math.pow(percent,2) * (-1)) + this.y3 * 3 * Math.pow(percent,2);

            return [_cubicCurves(percent, this.x0, this.x1, this.x2, this.x3),
                _cubicCurves(percent, this.y0, this.y1, this.y2, this.y3),
                Math.atan2(_y, _x)];
        }
    });
}());