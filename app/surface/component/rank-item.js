const
    Animation = require('../animation'),
    Buffer = require('../buffer'),
    BackInterplator = require('../interpolator/back-interpolator'),
    ElasticInterpolator = require('../interpolator/elastic-interpolator'),
    EaseCubicInterpolator = require('../interpolator/ease-cubic-interpolator.js'),
    _ = require('lodash'),
    chroma = require('chroma-js'),
    Util =  require('../utils');

module.exports = (function () {
    const
        inter = new BackInterplator({ type : 'easeInOut'}),
        inter2 = new ElasticInterpolator({type : 'easeInOut'}),
        inter3 = new EaseCubicInterpolator({ x1: 1.0, y1: 0.0, x2: 0.5, y2: 1.0 });

    const
        waveColors = ['#c6c1ff', '#c8ffa8', '#ffc1b2'],
        waveHieght = [3, 3, 3],
        waveCount = [3, 3, 3],
        waveY = [40, 65, 90],
        wavePrecision = 120,
        waveBuffers = [new Buffer(120, 160), new Buffer(120, 160), new Buffer(120, 160)],
        waveDraw = function(buffer, color, height, y, count){
            const
                {canvas : cvs , context : ctx} = buffer,
                waveStep = Math.PI * 2 * count / wavePrecision,
                ptStep = cvs.width / wavePrecision;

            ctx.clearRect(0, 0, cvs.width, cvs.height);

            ctx.fillStyle = color;
            // Util.Helper.setShadow(ctx, color, 5);
            ctx.beginPath();
            ctx.moveTo(0, y);
            for(let i = 1; i <= wavePrecision; i++)
                ctx.lineTo(i * ptStep, Math.sin(waveStep * i) * height + y);

            ctx.lineTo(cvs.width, cvs.height);
            ctx.lineTo(0, cvs.height);
            ctx.closePath();
            ctx.fill();
        };

    waveBuffers.forEach((wb, idx) => waveDraw(wb, waveColors[idx], waveHieght[idx], waveY[idx], waveCount[idx]));

    return Animation.create({
        constructor(opt){
            this.opt = Object.assign({
                x : 0,
                y : 0,
                renderType : 'small', // 根据不同的类别绘制
                renderPercent : 0,
                opacity : 1
            }, opt);
        },
        methods : {
            _renderTypeSmall : function (passed, elapsed, ctx, cvs, ret) {
                ctx.translate(this.opt.x, this.opt.y);

                ctx.globalAlpha = this.opt.opacity;

                // 绘制背景
                // ctx.drawImage(this.opt.rkOthImg.canvas, 450, 0, 200, 195, -60, -60, 120, 120);      //225

                ctx.strokeStyle = '#999';
                ctx.fillStyle = '#fff3';
                ctx.beginPath();
                ctx.arc(0, 0, 30, 0, Math.PI * 2);
                ctx.fill();
                ctx.stroke();

                ctx.scale(1.2, 1.2);
                ctx.fillStyle = '#FFF';
                ctx.textBaseline = 'middle';
                ctx.textAlign = 'center';
                ctx.fillText(this.data.name, 0, 0);
            },
            _renderTypeLarge : function (passed, elapsed, ctx, cvs, ret) {
                const
                    r = inter.resolve(this.opt.renderPercent) * 30 + 30,
                    tr = inter2.resolve(this.opt.renderPercent),
                    waveBegins = [elapsed / 20 % 120 - 60, elapsed / 30 % 120 - 60, elapsed / 40 % 120 - 60];

                // 初始化
                ctx.translate(this.opt.x, this.opt.y);
                ctx.textBaseline = 'middle';
                ctx.textAlign = 'center';

                // 剪裁
                ctx.save();
                ctx.beginPath()
                ctx.arc(0, 0, r + 1, 0, Math.PI * 2);
                ctx.clip();

                // 绘制背景
                ctx.fillStyle = '#fff3';
                ctx.beginPath();
                ctx.arc(0, 0, r, 0, Math.PI * 2);
                ctx.fill();

                // 绘制波浪
                ctx.globalAlpha = _.clamp(this.opt.renderPercent, 0, .8);
                waveBuffers.forEach((wb, idx) => {
                    ctx.drawImage(wb.canvas, waveBegins[idx] - 120, -60);
                    ctx.drawImage(wb.canvas, waveBegins[idx], -60);
                });
                ctx.restore();

                // 绘制排名
                ctx.globalAlpha = inter3.resolve(this.opt.renderPercent);
                ctx.drawImage(this.opt.rkImg.canvas, -25, 100 * tr - 25, 50, 50);
                ctx.fillStyle = '#fff';
                ctx.fillText(this.data.rank, 0, 122 * tr - 25);

                ctx.globalAlpha = 1;
                // 绘制边框
                ctx.strokeStyle = '#999';
                ctx.beginPath();
                ctx.arc(0, 0, r, 0, Math.PI * 2);
                ctx.stroke();

                // 绘制文字
                ctx.fillStyle = '#504f73';
                ctx.fillText(this.data.eTotal, 0, 48 * tr);
                ctx.fillStyle = '#587344';
                ctx.fillText(this.data.pTotal, 0, 20 * tr);
                ctx.fillStyle = '#734c41';
                ctx.fillText(this.data.aTotal, 0, -5);

                ctx.scale(1.2 + tr * .5, 1.2 + tr * .5);
                ctx.fillStyle = '#FFF';
                ctx.fillText(this.data.name, 0, -22 * tr);
            }
        },
        render : function (passed, elapsed, ctx, cvs, ret) {
            this[`_renderType${_.capitalize(this.opt.renderType)}`](passed, elapsed, ctx, cvs, ret);
        }
    });
}());




// 优化版本
// module.exports = (function () {
//     return Animation.create({
//         constructor(opt){
//             this.opt = Object.assign({
//                 x : 0,
//                 y : 0,
//                 name : '北京',
//                 renderType : 'small', // 根据不同的类别绘制
//                 renderPercent : 0,
//                 opacity : 1
//             }, opt);
//
//             this._setRenderFn();
//         },
//         attach : function({cvs : canvas, ctx : context}){
//             this._initRes(cvs, ctx);
//         },
//         methods : {
//             _setRenderFn(){
//                 this.render = this[`_renderType${_.capitalize(this.opt.renderType)}`];
//             },
//             _initRes(cvs, ctx){
//                 const
//                     grad = ctx.createRadialGradient(0, 0, 0, 0, 0, r);
//
//                 grad.addColorStop(0, chroma(color).alpha(0).hex());
//                 grad.addColorStop(1, chroma(color).hex());
//             },
//             _renderTypeSmall : function (passed, elapsed, ctx, cvs, ret) {
//                 ctx.translate(this.opt.x, this.opt.y);
//
//                 ctx.globalAlpha = this.opt.opacity;
//
//                 ctx.strokeStyle = '#999';
//                 ctx.fillStyle = '#fff3';
//                 ctx.beginPath();
//                 ctx.arc(0, 0, 30, 0, Math.PI * 2);
//                 ctx.fill();
//                 ctx.stroke();
//
//                 ctx.fillStyle = '#FFF';
//                 ctx.textBaseline = 'middle';
//                 ctx.textAlign = 'center';
//                 ctx.fillText(this.data.name, 0, 0);
//             },
//             setRenderType(type){
//                 this.opt.renderType = type;
//                 this._setRenderFn();
//             }
//         }
//     });
// }());