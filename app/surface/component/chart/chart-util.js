const
    _ = require('lodash'),
    Util =  require('../../utils');

module.exports = (function () {

    const
        calcXYPos = function (x, y, bw, bh, sw = 0, sh = 0) {
            let rx, ry;

            rx = _.isNumber(x) ? x :
                x == 'center' ? bw / 2 :
                    x == 'left' ? sw / 2 :
                        x == 'right' ? bw - sw / 2 : 0;

            ry = _.isNumber(y) ? y :
                y == 'middle' ? bh / 2 :
                    y == 'top' ? sh / 2 :
                        y == 'bottom' ? bh - sh / 2 : 0;

            return [rx, ry];
        },
        calcChartData = function (series, cvs, ctx, percent) {
            const
                lineHeight = 24,                                 // 字行高
                horScale = _.clamp(series.scale[0], 0, 1),      // 横向缩放
                verScale = _.clamp(series.scale[1], 0, 1),      // 纵向缩放
                horPadding = (1 - horScale) * cvs.width / 2,    // 横向补白
                verPadding = (1 - verScale) * cvs.height / 2,   // 纵向补白
                dataMax = _.max(series.data),                    // 数据最大值
                scaleBound = Util.nearRoundNumber(dataMax),      // 刻度最大值
                scaleWidth = ctx.measureText(Util.Formatter.thousands(scaleBound)).width,
                [boundLeft, boundTop, boundRight, boundBottom] =
                    [horPadding + scaleWidth + 20, verPadding, cvs.width - horPadding, cvs.height - verPadding - lineHeight - 20],
                [boundWidth, boundHeight] = [boundRight - boundLeft, boundBottom - boundTop],
                halfBarWidth = series.style &&  series.style.barWidth || (boundWidth / series.data.length) * .6 / 2,
                partBounds = series.data.map((val, idx) => {
                    const
                        vPos = (boundWidth * .9) / series.data.length *  idx + boundLeft;

                    return {
                        left : vPos - halfBarWidth,
                        right : vPos + halfBarWidth,
                        top : boundBottom - (boundHeight * percent) * val / scaleBound,
                        bottom : boundBottom,
                    };
                });


            return {
                horPadding,
                verPadding,
                dataMax,
                scaleBound,
                scaleWidth,
                chartBound : {
                    boundLeft, boundTop, boundRight, boundBottom, boundWidth, boundHeight
                },
                partBounds
            };
        };


    return {
        calcXYPos,
        calcChartData
    };
}());