const
    Animation = require('../animation'),
    Buffer = require('../buffer'),
    _ = require('lodash'),
    chroma = require('chroma-js'),
    ArcPath = require('../path/arc-path'),
    RankItem = require('./rank-item'),
    EaseCubicInterpolator = require('../interpolator/ease-cubic-interpolator'),
    Queue = require('../queue/queue2'),
    china = require('../map/maps/china'),
    Util =  require('../utils');

module.exports = (function () {

    const
        inter = new EaseCubicInterpolator({x1: .46, x2: .01, y1: .39, y2: .81});

    return Animation.create({
        constructor(opt){
            const
                that = this;

            this.opt = Object.assign({
                left : 0,
                top : 0,
                right : undefined,
                bottom : undefined,
                w : 250,
                fontSize : 14,
                displaySize : 15,
                padding : 10
            }, opt)
            this.opt.lineHeight = this.opt.fontSize * 1.5;
            this.opt.h = this.opt.lineHeight * this.opt.displaySize;
            this.timer = Util.timer(1000, _ => that.popMessage());
            this.messageList = [];
            this.displayList = [];
            this._initBuffer();
            this._initBgColor();
            this._renderBg();
            this._initQueue();
        },
        methods : {
            _renderTypeAdd(cvs, ctx){
                this.displayList.forEach((m, i) => {
                    // 计算实际值,上面空出一行,为了保证渐变能够显示完全
                    const
                        posY = (i + 1) *  this.opt.lineHeight  -  this.opt.lineHeight  / 2 + this.opt.lineHeight;

                    ctx.fillStyle = m.color;
                    if(i == this.displayList.length - 1){
                        ctx.globalAlpha = 1 - this.ami.offset;
                        ctx.fillText(m.msg, this.opt.padding, (cvs.height - posY) * this.ami.offset + posY);
                    } else {
                        ctx.globalAlpha = 1;
                        ctx.fillText(m.msg, this.opt.padding, posY);
                    }
                });
            },
            _renderTypeSwap(cvs, ctx){
                const
                    that = this;

                this.displayList.forEach((m, i) => {
                    // 计算实际值,上面空出一行,为了保证渐变能够显示完全
                    const
                        posY = i *  this.opt.lineHeight  -  this.opt.lineHeight  / 2 + this.opt.lineHeight;

                    if(i == 0)
                        ctx.globalAlpha = this.ami.offset;
                    else if(i == that.opt.displaySize)
                        ctx.globalAlpha = 1 - this.ami.offset;
                    else
                        ctx.globalAlpha = 1;

                    ctx.fillStyle = m.color;
                    ctx.fillText(m.msg, this.opt.padding, posY + this.ami.offset * this.opt.lineHeight);
                });
            },
            _renderBg(){
                const
                    {canvas : cvs, context : ctx} = this.buffer;
                ctx.globalAlpha = 1;
                ctx.fillStyle = this.bgColor;
                ctx.strokeStyle = '#ffffff';
                ctx.fillRect(0, 0, cvs.width, cvs.height);
                ctx.strokeRect(0, 0, cvs.width, cvs.height);
            },
            _render(){
                const
                    {canvas : cvs, context : ctx} = this.buffer;
                ctx.clearRect(0, 0, cvs.width, cvs.height);

                this._renderBg();
                ctx.save();
                ctx.beginPath();
                ctx.rect(this.opt.padding, 0, cvs.width - this.opt.padding * 2, cvs.height);
                ctx.clip();
                this[`_renderType${_.capitalize(this.ami.type)}`](cvs, ctx);
                ctx.restore();
            },
            _initBuffer(){
                const
                    font = `${this.opt.fontSize}px/${this.opt.fontSize}px 微软雅黑`;

                this.buffer = new Buffer(this.opt.w, this.opt.h + this.opt.lineHeight * 2);
                this.buffer.context.font = font;
                this.buffer.context.fillStyle = '#fff';
                this.buffer.context.textBaseline = 'middle';
                this.buffer.context.lineWidth = .5;
                Util.Helper.setShadow(this.buffer.context, '#fff', 2);
            },
            _initBgColor(){
                const
                    {canvas : cvs, context : ctx} = this.buffer,
                    bgColor = ctx.createLinearGradient(0, 0, cvs.width, cvs.height);

                bgColor.addColorStop(0, '#ffffff05');
                bgColor.addColorStop(.5, '#ffffff22');
                bgColor.addColorStop(1, '#ffffff05');
                this.bgColor = bgColor;
            },
            _initQueue(){
                const
                    that = this;
                this.ami = {
                    type : 'add',    // add or swap
                    offset : 0
                };
                this.queueSwap = Queue.create(this.ami, [{
                    prop : {
                        offset : {s : 1, e : 0}
                    },
                    duration : 500,
                    interpolator : inter,
                    process : function(p){
                        that._render();
                    },
                    callback : function () {
                        that.displayList.shift();
                    }
                }]);
                this.queueAdd = Queue.create(this.ami, [{
                    prop : {
                        offset : {s : 1, e : 0}
                    },
                    interpolator : inter,
                    duration : 500,
                    process : function (p) {
                        that._render();
                    }
                }]);
            },
            popMessage(){
                if(this.messageList.length == 0) return;

                this.displayList.push(this.messageList.shift());

                if(this.displayList.length <= this.opt.displaySize){
                    this.ami.type = 'add';
                    this.queueAdd.replay();
                }else{
                    this.ami.type = 'swap';
                    this.queueSwap.replay();
                }
            },
            log(msg, color = '#fff', icon){
                this.messageList.push({msg, color, icon});
            }
        },
        update : function (passed, elapsed, ctx, cvs) {
            this.timer.pass(passed);
        },
        render : function (passed, elapsed, ctx, cvs, ret) {
            const
                x = this.opt.right != undefined ? cvs.width - this.buffer.canvas.width - this.opt.right : this.opt.left,
                y = this.opt.bottom != undefined ? cvs.height - this.buffer.canvas.height - this.opt.bottom : this.opt.top;
            ctx.drawImage(this.buffer.canvas, x, y);
        }
    });
}());