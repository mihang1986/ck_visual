const Utils = require('../utils');

module.exports = (function () {

    var constructor = function (opt) {
        Utils.mixin(this, opt);
    };

    var _basePath = function (opt) {
        constructor.call(this, opt);
    };

    _basePath.prototype = {
        // 路径完成百分比,反馈值为点坐标,每种路径都应该有自己的百分比计算方式
        resolve : function (percent) {
            return [0, 0];
        },
        length : function () {
            return 0;
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
            if(options.length) clazz.prototype.length = options.length;
            if(options.methods) Utils.mixin(clazz.prototype, options.methods);

            return clazz;
        }
    };
}());