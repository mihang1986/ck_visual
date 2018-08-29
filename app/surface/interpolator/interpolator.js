const Utils = require('../utils');

module.exports = (function () {
    var constructor = function (opt) {
        Utils.mixin(this, opt);
    };

    var _interpolator = function (opts) {
        constructor.call(this, opts);
    };

    _interpolator.prototype = {
        resolve : function (input) {
            return input;
        }
    };

    return {
        create : function (options) {
            var defOpt = Utils.extends({}, options.options);

            var clazz = function (opt) {
                constructor.call(this, Utils.extends(defOpt, opt));
                if(options.init) options.init.call(this);
            };

            clazz.prototype = new _interpolator(options.options || {});
            if(options.resolve) clazz.prototype.resolve = options.resolve;

            return clazz;
        }
    };
}());