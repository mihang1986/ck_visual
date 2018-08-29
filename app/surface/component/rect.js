const Animation = require('../animation'),
    Utils = require('../utils');

module.exports = (function () {
    return Animation.create({
        constructor : function (opt) {
            this.opt = Utils.extends({
                x : 0,
                y : 0,
                w : 100,
                h : 100,
                strokeColor : "#f0f",
                fillColor : "#0f0"
            },  opt);
        },
        render : function (passed, elapsed, ctx, cvs, ret, pret, parent) {
            ctx.strokeStyle = this.opt.strokeColor;
            ctx.fillStyle = this.opt.fillColor;
            ctx.beginPath();
            if(parent){
                this.opt.x = parent.opt.x + 30;
                this.opt.y = parent.opt.y + 30;
            }
            ctx.rect(this.opt.x, this.opt.y, this.opt.w, this.opt.h);
            ctx.fill();
            ctx.stroke();
        },
        methods : {
            getCenterPoint : function () {
                return [
                    this.opt.x + (this.opt.w / 2),
                    this.opt.y + (this.opt.h / 2)
                ];
            },
            moveTo(x, y){
                this._action("moveTo", 3000, {sX : this.opt.x, sY : this.opt.y, tX : x, tY: y});
            }
        },
        action : {
            "moveTo" : function (percent, opt) {
                this.opt.x = opt.sX + (opt.tX - opt.sX) * percent;
                this.opt.y = opt.sY + (opt.tY - opt.sY) * percent;
            }
        }
    });
}());