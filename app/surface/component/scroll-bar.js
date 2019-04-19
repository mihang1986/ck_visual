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
                min : 0,
                max : 100,
                type : "v", // v : 竖, h : 横
                lineColor : "#000",
                barColor : "#f0f"
            },  opt);

            this._calculate();
            this.barDraging = false;
            this.srcPoint = 0;
            this._disable = false;
            this._opacity = .6;
        },
        render : function (passed, elapsed, ctx, cvs, ret, pret, parent) {
            if(this._disable)
                return;

            ctx.globalAlpha = this._opacity;

            // 绘制线
            ctx.strokeStyle = this.opt.lineColor;
            var cst = this.opt.type === "v" ? this._bar.w / 2 : this._bar.h / 2;
            if(this.opt.type === "v"){
                ctx.beginPath();
                ctx.moveTo(this.opt.x + cst, this.opt.y);
                ctx.lineTo(this.opt.x + cst, this._bar.y);
                ctx.stroke();
                ctx.beginPath();
                ctx.moveTo(this.opt.x + cst, this._bar.y + this._bar.h);
                ctx.lineTo(this.opt.x + cst, this.opt.y + this.opt.h);
                ctx.stroke();
            }else{
                ctx.beginPath();
                ctx.moveTo(this.opt.x, this._bar.y + cst);
                ctx.lineTo(this._bar.x , this._bar.y + cst);
                ctx.stroke();
                ctx.beginPath();
                ctx.moveTo(this._bar.x + this._bar.w, this._bar.y + cst);
                ctx.lineTo(this.opt.x + this.opt.w, this._bar.y + cst);
                ctx.stroke();
            }


            // 绘制框
            if(this._bar){
                var _p = this._percent / 10000;
                this._bar.x = this.opt.type === "v" ? this.opt.x: (this.opt.w - this._bar.w) * _p + this.opt.x;
                this._bar.y = this.opt.type === "v" ? (this.opt.h - this._bar.h) * _p + this.opt.y: this.opt.y;
                ctx.fillColor = this.opt.barColor;
                ctx.beginPath();
                ctx.rect(this._bar.x, this._bar.y, this._bar.w, this._bar.h);
                ctx.fill();
            }

        },
        methods : {
            _calculate : function () {
                this._bar = this.opt.type === "v" ?
                    {w : this.opt.w, h : this.opt.h / 5} :
                    {w : this.opt.w / 5, h : this.opt.h};

                this._percent = 0;  // 1 - 10000
                this._slideSpeed = 0;
                this._slideTimeout = null;
            },
            _slide : function () {
                var that = this;
                this._percent = (Math.max(Math.min(10000, this._percent + this._slideSpeed), 0));
                this.fire("change", this._percent);
                this._slideSpeed -= 1 * (this._slideSpeed / Math.abs(this._slideSpeed));
                clearTimeout(this._slideTimeout);
                if(this._percent + this._slideSpeed > 0  && this._percent + this._slideSpeed < 10000)
                    this._slideTimeout = setTimeout(Utils.proxy(this._slide, this), 1);
            },
            disable : function () {
                this._disable = true;
            },
            enable : function () {
                this._disable = false;
            },
            hide : function () {
                this._action("opacity", 300, {opacity : 0});
            },
            show : function () {
                this._action("opacity", 300, {opactiy : 1});
            }
        },
        action : {
            opacity : function (percent, opt) {
                if(opt.opacity == 0)
                    this._opacity = (1 - percent) * .6;
                else
                    this._opacity = percent * .6;
            }
        },
        events : {
            change : function (value) {
                if(this.opt.change)
                    this.opt.change.call(this, this.opt.min + (this.opt.max - this.opt.min) * value / 10000);
            }
        },
        notify : {
            mousedown : function (event) {
                if(this._disable)
                    return;

                if(Utils.physics.ptInRect(event.offsetX, event.offsetY,
                    this._bar.x, this._bar.y, this._bar.w, this._bar.h)){
                    this.barDraging = true;
                    this.srcPoint = this.opt.type === "v" ? event.offsetY : event.offsetX;
                }
            },
            mouseup : function(event){
                if(this.barDraging)
                    this.barDraging = false;
            },
            mousemove : function(event){
                if(this.barDraging){
                    var nowPoint = this.opt.type === "v" ? event.offsetY : event.offsetX,
                        dp = this.opt.type === "v" ? this.opt.h - this._bar.h : this.opt.w - this._bar.w,
                        distance = this.srcPoint - nowPoint,
                        dpp = distance / dp * 10000;

                    this._percent = (Math.max(Math.min(10000, this._percent - dpp), 0));
                    this.fire("change", this._percent);

                    this.srcPoint = nowPoint;
                }
            },
            mousewheel : function (event) {
                if(this._disable)
                    return;

                if(Utils.physics.ptInRect(event.offsetX, event.offsetY,
                    this.opt.x, this.opt.y, this.opt.w, this.opt.h)){
                    this._slideSpeed = 100 * (event.deltaY / Math.abs(event.deltaY));
                    this._slide();
                }
            }
        }
    });
}());