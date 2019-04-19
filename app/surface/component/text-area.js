const Animation = require('../animation'),
    ScrollBar = require('./scroll-bar'),
    Surface = require('../surface'),
    Utils = require('../utils');

module.exports = (function () {
    return Animation.create({
        constructor : function (opt) {
            this.opt = Utils.extends({
                x : 0,
                y : 0,
                w : 100,
                h : 100,
                textColor : "#000",
                font : "14px 宋体",
                lineHeight : 25
            },  opt);

            this._text = opt.text || "";
            this._buffer = document.createElement("canvas");
            this._offset = 0;
            this._buffer.width = this.opt.w;
            this._buffer.height = 1;
            this._calculate();
            this._toggle = {w : 0, h : 0};
            this.isOver = false;
        },
        render : function (passed, elapsed, ctx, cvs, ret, pret, parent) {
            // ctx.strokeStyle = "#000";
            // ctx.beginPath();
            // ctx.rect(this.opt.x, this.opt.y, this.opt.w, this.opt.h);
            // ctx.stroke();

            // 绘制
            ctx.save();
            ctx.beginPath();
            ctx.rect(this.opt.x, this.opt.y, this.opt.w, this.opt.h);
            ctx.clip();

            ctx.drawImage(this._buffer, this.opt.x, this.opt.y - this._offset);

            ctx.restore();
        },
        methods : {
            _calculate : function () {
                var that = this;

                // 计算文本绘制
                var ctx = this._buffer.getContext("2d"),
                    lines = [], line = 0, temp = "",
                    lineHeight = this.opt.lineHeight;

                ctx.font = this.opt.font;
                this._offset = 0;

                // 计算文字
                for(let c of this._text){
                    temp += c;
                    if(ctx.measureText(temp).width > this.opt.w ){
                        lines[line++] = temp.substr(0, temp.length - 1);
                        temp = c;
                    }
                }
                if(temp !== "")
                    lines.push(temp);

                // 调整canvas大小
                this._buffer.height = this.opt.lineHeight * lines.length;

                // 清空重绘
                ctx.clearRect(0, 0, this._buffer.width, this._buffer.height);
                ctx.textAlign = "start";
                ctx.textBaseline = "middle";
                ctx.fillStyle = this.opt.textColor;
                ctx.font = this.opt.font;
                lines.forEach(function (v, i) {
                    ctx.fillText(lines[i], 0, (i + 1) * lineHeight - lineHeight / 2);
                });

                // 如果超过则增加滚动条
                if(this._buffer.height > this.opt.h){
                    this._scrollbar = new ScrollBar({
                        x : this.opt.x + this.opt.w - 15,
                        y : this.opt.y,
                        w : 10,
                        h : this.opt.h,
                        change : function (value) {
                            that._offset = (that._buffer.height - that.opt.h) / 100 * value;
                        }
                    });
                    this._scrollbar.hide();
                    this.addSubObject(this._scrollbar, Surface.LEVEL.HIGHER);
                }
            },
            setText : function (text) {
                this._text = text;
                this._calculate();
            }
        },
        notify : {
            mousewheel : function (event) {
                if (Utils.physics.ptInRect(event.offsetX, event.offsetY, this.opt.x, this.opt.y, this.opt.w, this.opt.h)) {
                    if(this._scrollbar){
                        this._scrollbar.trigger("mousewheel", {
                            offsetX : this.opt.x + this.opt.w - 10,
                            offsetY : this.opt.y + 1,
                            deltaY : event.deltaY
                        });
                    }
                }
            },
            mousemove : function (event) {
                if (Utils.physics.ptInRect(event.offsetX, event.offsetY, this.opt.x, this.opt.y, this.opt.w, this.opt.h)) {
                     if(this.isOver == false) {
                         this.isOver = true;
                        if(this._scrollbar)
                            this._scrollbar.show();
                    }
                }else{
                   if(this.isOver == true){
                       this.isOver = false;
                       if(this._scrollbar)
                           this._scrollbar.hide();
                   }
                }
            }
        },
        action : {
            // "moveTo" : function (percent, opt) {
            //     this.opt.x = opt.sX + (opt.tX - opt.sX) * percent;
            //     this.opt.y = opt.sY + (opt.tY - opt.sY) * percent;
            // }
        }
    });
}());