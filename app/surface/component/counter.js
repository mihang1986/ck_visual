const
    Animation = require('../animation'),
    Buffer = require('../buffer'),
    BackInterplator = require('../interpolator/back-interpolator'),
    _ = require('lodash'),
    Queue = require('../queue/queue2'),
    chroma = require('chroma-js'),
    Util =  require('../utils');

module.exports = (function () {
    const
        inter = new BackInterplator({ type : 'easeOut'});

    return Animation.create({
        constructor(opt){
            this.opt = Object.assign({
                value : 0,
                length : 9,
                icon : null,
                x : 0,
                y : 0,
                size : 35,
                color : '#fdff0f'
            }, opt);

            this.buffer = new Buffer();
            this._initRes();
            this._initFlip();
            this._render();
        },
        attach({canvas : cvs}){
            this._setPos(cvs.width);
        },
        methods : {
            _setPos(width){
                if(this.opt.offsetX != undefined)
                    this.opt.x = width / 2 + this.opt.offsetX;
            },
            _initRes(){
                const
                    {canvas : cvs, context : ctx} = this.buffer,
                    fontName = `normal ${this.opt.size}px/${this.opt.size}px DGF`;

                ctx.font = fontName;

                const
                    iconSize = this.opt.size, splitWidth = 5,
                    valueWidth = ctx.measureText(Util.Formatter.thousands(_.padStart('', this.opt.length, '0'))).width,
                    contentWidth = iconSize + splitWidth + valueWidth,
                    paddingWidth = 10;

                cvs.width = contentWidth + paddingWidth * 2;    // 改变canvas大小会使font设置失效
                cvs.height = this.opt.size * 1.4;

                ctx.font = fontName;
                ctx.textBaseline = 'middle';
                Util.Helper.setShadow(ctx);

                this._calc = {
                    iconSize,
                    splitWidth,
                    valueWidth,
                    contentWidth,
                    paddingWidth,
                    textY : cvs.height / 2
                };
            },
            _initFlip(){
                this.queue = new Queue(this.opt);
            },
            _render(){
                const
                    {canvas : cvs, context : ctx} = this.buffer,
                    value = Util.Formatter.thousands(_.padStart(this.opt.value, this.opt.length, '0'));

                ctx.clearRect(0, 0, cvs.width, cvs.height);
                ctx.drawImage(this.opt.icon.canvas, this._calc.paddingWidth, (cvs.height - this.opt.size) / 2, this.opt.size, this.opt.size);
                ctx.fillStyle = this.opt.color;
                ctx.fillText(value, this._calc.paddingWidth + this._calc.iconSize + this._calc.splitWidth, this._calc.textY);
            },
            value(val){
                const
                    that = this;
                if(val != undefined){
                    this.queue.stop(true).part([{
                        prop : {
                            value : {e : val, p : Math.round}
                        },
                        end : {
                            value : val
                        },
                        process : function(){
                            that._render();
                        },
                        interpolator : inter,
                        duration : 500
                    }]).replay();
                    return this;
                }
                return this.opt.value;
            }
        },
        notify : {
            parentresize : function ({surface : parent}) {
                this._setPos(parent.width);
            }
        },
        render : function (passed, elapsed, ctx, cvs, ret) {
            ctx.drawImage(this.buffer.canvas,
                this.opt.x - this.buffer.canvas.width / 2 + .5,
                this.opt.y - this.buffer.canvas.height / 2 + .5);
        }
    });
}());