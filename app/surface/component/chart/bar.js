const
    Util =  require('../../utils'),
    ChartUtil = require('./chart-util');


module.exports = (function () {

    const
        drawBar = function (cvs, ctx, left, right, top, bottom, mtop, percent) {
            const
                outerR = (right - left) / 3,
                outerTop = mtop + (1 - percent) * (bottom - mtop),
                innerWidth = (right - left) * .5,
                innerR = innerWidth / 2,
                innerTop = top + (1 - percent) * (bottom - top),
                innerLeft = left + (right - left) * .25,
                innerRight = right - (right - left) * .25;

            ctx.strokeStyle = '#fff';
            ctx.fillStyle = '#fff';

            // 绘制左边
            ctx.beginPath();
            ctx.moveTo(left + outerR, outerTop);
            ctx.arcTo(left, outerTop, left, outerTop + outerR, outerR);
            ctx.lineTo(left, bottom - outerR);
            ctx.arcTo(left, bottom, left + outerR, bottom, outerR);
            ctx.stroke();

            // 绘制右边
            ctx.beginPath();
            ctx.moveTo(right - outerR, outerTop);
            ctx.arcTo(right, outerTop, right, outerTop + outerR, outerR);
            ctx.lineTo(right, bottom - outerR);
            ctx.arcTo(right, bottom, right -  outerR, bottom, outerR);
            ctx.stroke();

            // 绘制中间
            ctx.beginPath();
            ctx.moveTo(innerLeft + innerR, innerTop + 5);
            ctx.arcTo(innerLeft, innerTop + 5, innerLeft, innerTop + innerR + 5,  innerR);
            ctx.lineTo(innerLeft, bottom - innerR - 5);
            ctx.arcTo(innerLeft, bottom - 5, innerLeft + innerR, bottom - 5, innerR);
            ctx.arcTo(innerRight, bottom - 5, innerRight, bottom - innerR - 5, innerR);
            ctx.lineTo(innerRight, innerTop + innerR + 5);
            ctx.arcTo(innerRight, innerTop + 5, innerRight - innerR, innerTop + 5, innerR);
            ctx.fill();
        };

    return function (cvs, ctx, series, percent){
            const
                width = this.opt.bound.w,
                height = this.opt.bound.h,
                padding = 30,                   // 可提取
                fontSize = 12,                  // 可提取
                barWidth = 20,                  // 可提取
                lineHeight = fontSize  * 1.5,
                maxNumber = _.max(series.data),
                nearRound = Util.nearRoundNumber(maxNumber);

            ctx.font = `${fontSize}px 微软雅黑`;
            ctx.translate(.5, .5);

            const
                textWidth = ctx.measureText(nearRound + '').width,
                left = padding + textWidth + 10,
                bottom = height - padding - lineHeight,
                top = padding,
                right = width - padding,
                hStep = (bottom - top) / 5,
                vStep = (right - left - barWidth * 2) / (series.axisNames.length - 1);

            ctx.globalAlpha = percent;
            ctx.strokeStyle = '#fff';

            // 控制缩放及位移
            ctx.translate(((1 - series.scale[0]) * cvs.width) / 2 + series.offset[0],
                ((1 - series.scale[1]) * cvs.height) / 2 + series.offset[1]);
            ctx.scale(series.scale[0], series.scale[1]);

            // 绘制横坐标及刻度
            ctx.beginPath();
            ctx.moveTo(left, bottom);
            ctx.lineTo(right * percent, bottom);
            ctx.stroke();
            ctx.textAlign = 'right';
            for(let i = 0; i <= 5; i++){
                let nb = bottom - i * hStep;
                ctx.fillText(Util.Formatter.thousands(nearRound / 5 * i), padding + textWidth, nb * percent);
            }

            // 绘制横坐标及bar
            ctx.textAlign = 'center';
            for(let i = 0; i < series.axisNames.length; i++){
                let
                    nl = left + barWidth + vStep * i,
                    maxHeight = bottom - top,
                    height = maxHeight * (series.data[i] / nearRound);
                ctx.fillStyle = '#fff';
                ctx.fillText(series.axisNames[i], nl * percent, bottom + lineHeight);

                drawBar(cvs, ctx, nl - barWidth / 2, nl + barWidth / 2, bottom - height - 5, bottom - 5, bottom - maxHeight - 5, percent);
            }
        };
}());