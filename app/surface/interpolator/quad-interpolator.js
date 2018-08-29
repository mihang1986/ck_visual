/**
 *  Quad
 */

const Interpolator = require('./interpolator');

module.exports = (function () {
    var quad = {
            easeIn: function (t, b, c, d) {
                return c * (t /= d) * t + b;
            },
            easeOut: function (t, b, c, d) {
                return -c * (t /= d) * (t - 2) + b;
            },
            easeInOut: function (t, b, c, d) {
                if ((t /= d / 2) < 1) return c / 2 * t * t + b;
                return -c / 2 * ((--t) * (t - 2) - 1) + b;
            }
        };

    return Interpolator.create({
        options : {
            type : 'easeIn'
        },
        resolve : function (input) {
            return quad[this.type](input, 0, 1, 1);
        }
    });
}());