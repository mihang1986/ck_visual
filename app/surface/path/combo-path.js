const Path = require('./path');

module.exports = (function () {
    return Path.create({
        options : {
        },
        init : function () {
            this.paths = [];
        },
        methods : {
            addPath : function (path) {
                this.paths.push(path);
                return this;
            },
            getPath : function (index) {
                if(index)
                    return this.paths[index];
                else
                    return this.paths;
            }
        },
        resolve : function (percent) {
            if(this.paths.length == 0) return [0, 0];
            // 首先计算当前百分比落在那个路径上,
            // 并且计算当前百分比下的整体进度
            var s = 1 / this.paths.length,
                i = Math.min(Math.max(Math.ceil(percent / s) - 1, 0), this.paths.length - 1),
                p = (percent % s) * this.paths.length;

            return this.paths[i].resolve(p);
        }
    });
}());