const
    Animation = require('../animation'),
    EaseCubicInterpolator = require('../interpolator/ease-cubic-interpolator'),
    _ = require('lodash'),
    chroma = require('chroma-js'),
    Util =  require('../utils');

module.exports = (function () {

    return Animation.create({
        constructor : function ({percent = 0, color = '#cbcdff', point = [0, 0]} = {}) {
            this.opt = {
                color : color,
                point : point
            };
            this.opt.sr = 35;
            this.opt.er = 45;
            this.opt.duration = 3000;
            this.opt.baseA = .5;
            this.opt.atte = .5;
            this.opt.inter = new EaseCubicInterpolator({x1: 1, x2: .49, y1: .09, y2: .86});
            // this.opt.inter2 = new EaseCubicInterpolator({x1: .53, x2: .23, y1: .38, y2: .8});
        },
        update : function(passed, elapsed, ctx, cvs){
            const p = elapsed % this.opt.duration / this.opt.duration;

            return [Math.sin(p * Math.PI), p];
        },
        render : function (passed, elapsed, ctx, cvs, ret) {
            const
                x = this.opt.point[0],
                y = this.opt.point[1],
                p = ret[0],
                sp = ret[1],
                cp = this.opt.inter.resolve(p),
                or1 = this.opt.sr + (this.opt.er - this.opt.sr) * cp,
                or2 = this.opt.sr + (this.opt.er - this.opt.sr) *  cp - 10,
                ir1 = this.opt.sr + (this.opt.er - this.opt.sr) * cp - 5,
                ga = _.clamp((1 - p) / (1 - this.opt.atte), 0, 1),
                rot = sp * Math.PI * 2;


            ctx.translate(cvs.width / 2, cvs.height / 2);

            ctx.globalAlpha = _.clamp(this.opt.baseA * ga, .1, 1);

            ctx.save();
            ctx.translate(x, y);
            ctx.rotate(rot);
            Util.Helper.fillArc2(ctx, 0, 0, or1, 2.5, this.opt.color, Math.PI * .65, Math.PI * .65 + Math.PI / 2);
            Util.Helper.fillArc2(ctx, 0, 0, or1, 2.5, this.opt.color, Math.PI * 1.65, Math.PI * 1.65 + Math.PI / 2);

            Util.Helper.fillArc2(ctx, 0, 0, or2, 2.5, this.opt.color, Math.PI * .35, Math.PI * .35 + Math.PI / 2);
            Util.Helper.fillArc2(ctx, 0, 0, or2, 2.5, this.opt.color, Math.PI * 1.35, Math.PI * 1.35 + Math.PI / 2);

            ctx.rotate(-rot * 2);
            Util.Helper.fillArc2(ctx, 0, 0, ir1, 2.5, this.opt.color, Math.PI * .5, Math.PI * .5 + Math.PI / 2);
            Util.Helper.fillArc2(ctx, 0, 0, ir1, 2.5, this.opt.color, Math.PI * 1.5, Math.PI * 1.5 + Math.PI / 2);

            Util.Helper.clearShadow(ctx);
            ctx.restore();
        }
    });
}());