/**
 *  Quint
 */

const Interpolator = require('./interpolator');

module.exports = (function () {
    var quint = {
            easeIn: function (t, b, c, d) {
                return c * (t /= d) * t * t * t * t + b;
            },
            easeOut: function (t, b, c, d) {
                return c * ((t = t / d - 1) * t * t * t * t + 1) + b;
            },
            easeInOut: function (t, b, c, d) {
                if ((t /= d / 2) < 1) return c / 2 * t * t * t * t * t + b;
                return c / 2 * ((t -= 2) * t * t * t * t + 2) + b;
            }
        };

    return Interpolator.create({
        options : {
            type : 'easeIn'
        },
        resolve : function (input) {
            return quint[this.type](input, 0, 1, 1);
        }
    });
}());