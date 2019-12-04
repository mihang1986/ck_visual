const
    Animation = require('../animation'),
    Buffer = require('../buffer'),
    BackInterplator = require('../interpolator/back-interpolator'),
    EaseCubicInterpolator = require('../interpolator/ease-cubic-interpolator'),
    _ = require('lodash'),
    Queue = require('../queue/queue2'),
    chroma = require('chroma-js'),
    ToolTip = require('./tooltip'),
    Util =  require('../utils');

module.exports = (function () {
    const
        inter = new EaseCubicInterpolator({x1: .46, x2: .01, y1: .39, y2: .81});

    return Animation.extend(ToolTip, {
        constructor(){
            this.opt.textOpacity = 0;
            this.opt.textAction = 0;
            this._initTextBufferAndQueue();
        },
        render(passed, elapsed, ctx, cvs, ret) {
            ctx.drawImage(this.textBuffer.canvas,
                this.opt.x + this.opt.boundSize, this.opt.y + this.opt.boundSize);
        },
        methods : {
            _initTextBufferAndQueue(){
                const
                    that = this;

                // 初始化BUFFER
                this.textBuffer = new Buffer(this.opt.w - this.opt.boundSize * 2, this.opt.h - this.opt.boundSize * 2);
                this.textBuffer.context.font = '14px 微软雅黑';
                this.textAlign = 'left';
                this.textBaseline = 'middle';

                // 初始化QUEUE
                this.textQueue = Queue.create(this.opt, [{
                    prop : {
                        textOpacity : {s: 1, e : 0}
                    },
                    end : {
                        textAction : 1
                    },
                    duration : 1000,
                    interpolator : inter,
                    process : function(ep){
                        that._renderText();
                    },
                    callback : function () {
                        that.data = that.newData;
                    }
                },{
                    prop : {
                        textOpacity : {s : 0, e : 1}
                    },
                    end : {
                        textAction : 0
                    },
                    duration : 1000,
                    interpolator : inter,
                    process : function(ep){
                        that._renderText();
                    }
                }]);
            },
            _renderText(){
                const
                    {canvas : cvs, context : ctx} = this.textBuffer,
                    p = 1 - this.opt.textOpacity;

                if(!this.data) return;
                ctx.clearRect(0, 0, cvs.width, cvs.height);

                ctx.globalAlpha = this.opt.textOpacity;
                ctx.fillStyle = '#000000';
                ctx.fillText(this.data.name, 20 - (cvs.width * p) / 2, 30);
                ctx.fillStyle = '#000000';
                ctx.fillText(`报送总量 : ${Util.Formatter.thousands(this.data.xkTotal + this.data.xkTotal)}`, 20 - (cvs.width * p) / 2, 60);
                ctx.fillText(`行政许可 : ${Util.Formatter.thousands(this.data.xkTotal)}`, 20 - (cvs.width * p) / 2, 90);
                ctx.fillText(`行政处罚 : ${Util.Formatter.thousands(this.data.cfTotal)}`, 20 - (cvs.width * p) / 2, 120);
            },
            setData : function (data) {
                this.newData = data;
                this.textQueue.replay();
            }
        }
    });
}());