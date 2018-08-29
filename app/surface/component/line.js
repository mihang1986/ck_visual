const Animation = require('../animation'),
    Utils = require('../utils'),
    LinePath = require('../path/line-path');

module.exports = (function () {
    return Animation.create({
        constructor : function (opt) {
            this.opt = Utils.extends({
                sX : 0,
                sY : 0,
                tX : 100,
                tY : 100,
                size : 1,
                color : '#f0f'
            },  opt);

            this.opt.path = new LinePath(this.opt);
        },
        render : function (passed, elapsed, ctx, cvs, ret) {
            ctx.lineWidth = this.opt.size + "px";
            ctx.strokeStyle = this.opt.color;
            ctx.beginPath();
            ctx.moveTo(this.opt.sX, this.opt.sY);
            ctx.lineTo(this.opt.tX, this.opt.tY);
            ctx.stroke();


            // 绘制点
            var p = elapsed % 2000 / 2000,
                pt = this.opt.path.resolve(p);
            ctx.fillStyle = "#f0f";
            ctx.beginPath();
            ctx.arc(pt[0], pt[1], 5, 0, Math.PI * 2);
            ctx.fill();
        }
    });
}());