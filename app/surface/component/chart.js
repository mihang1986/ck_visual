const
    Animation = require('../animation'),
    Buffer = require('../buffer'),
    _ = require('lodash'),
    EaseCubicInterpolator = require('../interpolator/ease-cubic-interpolator'),
    Queue = require('../queue/queue2'),
    ChartUtil = require('./chart/chart-util'),
    Util =  require('../utils');

const
    drawFn = {
        'bar' : require('./chart/bar'),
        'simpleBar' : require('./chart/simple-bar')
    };

module.exports = (function () {
    const
        inter2 = new EaseCubicInterpolator({x1: .46, x2: .01, y1: .39, y2: .81});

    return Animation.create({
        constructor(opt){
            this.opt = Util.deepAssign({
                pos : {
                    left : 0,
                    top : 0,
                    right : undefined,
                    bottom : undefined,
                },
                bound : {
                    w : 500,
                    h : 300
                },
                title : {
                    color : '#fff',
                    x : 0,
                    y : 0
                }
            }, opt);

            this._init();
            this._show();
        },
        methods : {
            _init(){
                const
                    buffer = new Buffer(),
                    bound = this.opt.bound,
                    {canvas : cvs, context : ctx} = buffer,
                    bgColor = ctx.createLinearGradient(0, 0, bound.w, bound.h);

                cvs.width = bound.w;
                cvs.height = bound.h;
                ctx.textBaseline = 'middle';

                bgColor.addColorStop(0, '#ffffff05');
                bgColor.addColorStop(.5, '#ffffff66');
                bgColor.addColorStop(1, '#ffffff05');

                this.buffer = buffer;
                this.bgColor = bgColor;
            },
            _show(){
                const
                    that = this;
                this.queue = new Queue({}, [{
                    duration : 1000,
                    interpolator : inter2,
                    process : function(ep){
                        that._renderChart(ep);
                    }
                }]);
            },
            _renderBg(cvs, ctx, percent) {
                ctx.globalAlpha = 1;
                ctx.fillStyle = this.bgColor;
                ctx.strokeStyle = '#ffffff';
                ctx.fillRect(0, 0, cvs.width, cvs.height);
                ctx.strokeRect(0, 0, cvs.width, cvs.height);
            },
            _renderTitle(cvs, ctx, percent){
                const
                    titlePos = ChartUtil.calcXYPos(this.opt.title.x, this.opt.title.y, cvs.width, 20);

                ctx.save();
                ctx.textAlign = 'center';
                ctx.fillStyle = this.opt.title.color;
                ctx.globalAlpha = percent;
                ctx.font = `16px 微软雅黑`;
                ctx.fillText(this.opt.title.text, titlePos[0], titlePos[1] * percent);
                ctx.restore();
            },
            _renderChart(percent){
                const
                    that = this,
                    {canvas : cvs, context : ctx} = this.buffer;

                ctx.clearRect(0, 0, cvs.width, cvs.height);
                this._renderBg(cvs, ctx, percent);
                if(this.opt.title.text)
                    this._renderTitle(cvs, ctx, percent);

                ctx.font = `12px 微软雅黑`;
                ctx.save();
                if(this.opt.series)
                    this.opt.series.forEach(s => {
                        const
                            max = _.max(s.data);
                        drawFn[s.type].call(that, cvs, ctx, s, ChartUtil.calcChartData(s, cvs, ctx, percent), percent);
                    });
                ctx.restore();
            }
        },
        render : function (passed, elapsed, ctx, cvs, ret) {
            const
                x = this.opt.pos.right != undefined ? cvs.width - this.buffer.canvas.width - this.opt.pos.right : this.opt.pos.left,
                y = this.opt.pos.bottom != undefined ? cvs.height - this.buffer.canvas.height - this.opt.pos.bottom : this.opt.pos.top;

            ctx.drawImage(this.buffer.canvas, x, y);
        }
    });
}());


