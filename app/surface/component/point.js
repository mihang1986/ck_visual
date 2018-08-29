const Animation = require('../animation'),
    Utils = require('../utils');

module.exports = (function () {

    return Animation.create({
        constructor : function (opt) {
            var that = this;

            this.opt = Utils.extends({
                x : 0,      // x 坐标
                y : 0,      // y 坐标
                r : 30,     // 半径
                speed : 5,
                color : "#f0f"
            },  opt);

            var pr = this.opt.r * .25,
                wsr = Array(8).fill(0).map(function (p1, p2, p3) {
                    return (that.opt.r  / 8 * p2) + (that.opt.r * .3);
                });

            this._rData = {
                pr : pr,
                wsr : wsr
            };
        },
        action : {
            "moveTo" : function (p, opt) {
                this.opt.x = opt.srcX + (opt.tarX - opt.srcX) * p;
                this.opt.y = opt.srcY + (opt.tarY - opt.srcY) * p;
            }
        },
        methods : {
            moveTo : function (x, y, d) {
                d = d || 3000;
                this._action("moveTo", d, {
                    srcX : this.opt.x,
                    srcY : this.opt.y,
                    tarX : x,
                    tarY : y
                });
            }
        },
        update : function (passed, elapsed, ctx, cvs, pret, parent) {
            var that = this, result = [];

            this._rData.wsr.forEach(function (val, idx) {
                var r = (that._rData.wsr[idx] + (elapsed / 1000) * that.opt.speed) % that.opt.r;
                result.push({
                    r : r,
                    a : 1 - r / that.opt.r
                });
            });

            return result;
        },
        render : function (passed, elapsed, ctx, cvs, ret, pret, parent) {
            ctx.shadowBlur = 5;
            ctx.shadowColor = this.opt.color;

            ctx.save();
            ctx.fillStyle = this.opt.color;
            ctx.strokeStyle = this.opt.color;
            if(parent)
                if(pret){
                    ctx.translate(pret[0], pret[1]);
                }else{
                    ctx.translate(parent.opt.x + this.opt.x, parent.opt.y + this.opt.y);
                }
            else
                ctx.translate(this.opt.x, this.opt.y);

            // 画圈
            ret.forEach(function (p1) {
                ctx.globalAlpha = p1.a;
                ctx.beginPath();
                ctx.arc(0, 0, p1.r, 0, Math.PI * 2);
                ctx.stroke();
            });

            // 画中心圆
            ctx.globalAlpha = 1;
            ctx.beginPath();
            ctx.arc(0, 0, this._rData.pr, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }
    });
}());