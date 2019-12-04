const
    Animation = require('../animation'),
    _ = require('lodash'),
    Util =  require('../utils');

module.exports = Animation.create({
    constructor : function ({percent = 0, color = '#00ffe3', path = null,
                                length = 50, step = 0.006, baseR = 3, atte = .9, nl = 6, canAtte = true, limit = true} = {}) {
        this.opt = {
            percent : percent,
            color : color,
            path : path,
            length : length,
            step : step,
            baseR : baseR,
            atte : atte,   // 衰减阈值
            nl : nl,
            canAtte : canAtte, // 允许衰减
            limit : limit
        };
    },
    render : function (passed, elapsed, ctx, cvs, ret) {
        let
            np, pos, x, nl,
            basea = this.opt.canAtte ? _.clamp((1 - this.opt.percent) / (1 - this.opt.atte), 0, 1) : 1;

        if(!this.opt.path) return;

        ctx.translate(cvs.width / 2, cvs.height / 2);

        // nl = Math.floor(this.opt.length * basea);
        nl = this.opt.length;

        for(let i=nl; i>=0; i--){
            if(i < nl / this.opt.nl)
                Util.Helper.setShadow(ctx, this.opt.color, 4);
            else{
                Util.Helper.clearShadow(ctx);
            }

            np = this.opt.percent - (i * this.opt.step * basea);
            x = i / this.opt.length;

            if(this.opt.limit && np < 0) continue;

            pos = this.opt.path.resolve(np);
            ctx.globalAlpha = (1 - x) * basea;
            Util.Helper.fillArc(ctx, pos[0], pos[1], Math.max(this.opt.baseR * (1 - x), this.opt.baseR * .6), this.opt.color);
        }
    }
});
