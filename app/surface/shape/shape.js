const Utils = require('../utils');

module.exports = (function () {

    var constructor = function (opt) {
        Utils.mixin(this, opt);
    };

    var _basePath = function (opt) {
        constructor.call(this, opt);
    };

    _basePath.prototype = {
        equalsTo : function (shape) {
            return this === shape;
        }
    };

    return {
        create : function (options) {
            var defOpt = Utils.extends({}, options.options);

            var clazz = function (opt) {
                constructor.call(this, Utils.extends(defOpt, opt));
                if(options.init) options.init.call(this);
            };

            clazz.prototype = new _basePath(options.options || {});
            if(options.resolve) clazz.prototype.resolve = options.resolve;
            if(options.methods) Utils.mixin(clazz.prototype, options.methods);

            return clazz;
        }
    };
}());