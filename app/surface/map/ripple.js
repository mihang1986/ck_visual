const
    Animation = require('../animation'),
    _ = require('lodash'),
    chroma = require('chroma-js'),
    Util =  require('../utils');

module.exports = (function () {

    const
        createColor = function (ctx, r = 0, color = '#fff') {
            const
                grad = ctx.createRadialGradient(0, 0, 0, 0, 0, r);

            grad.addColorStop(0, chroma(color).alpha(0).hex());
            grad.addColorStop(1, chroma(color).hex());

            return grad;
        };

    return Animation.create({
        constructor : function ({percent = 0, color = '#03ff00', point = [0, 0]} = {}) {
            this.opt = {
                percent : percent,
                color : color,
                point : point
            };
            this.opt.er = 50;
            this.opt.baseA = .9;    // 基础透明度
            this.opt.atte = .6;     // 透明衰减开始
        },
        render : function (passed, elapsed, ctx, cvs, ret) {
            const
                cr = this.opt.er * this.opt.percent,
                ga = _.clamp((1 - this.opt.percent) / (1 - this.opt.atte), 0, 1);

            ctx.globalAlpha = ga * this.opt.baseA;

            ctx.translate(cvs.width / 2, cvs.height / 2);
            ctx.translate(this.opt.point[0], this.opt.point[1]);

            Util.Helper.fillArc(ctx, 0, 0, cr, createColor(ctx, cr, this.opt.color));
        }
    });
}());
