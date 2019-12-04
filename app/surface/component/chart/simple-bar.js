const
    Util =  require('../../utils'),
    ChartUtil = require('./chart-util');

module.exports = function (cvs, ctx, series, chartData, percent) {
    ctx.fillRect(chartData.chartBound.boundLeft, chartData.chartBound.boundTop, chartData.chartBound.boundWidth, chartData.chartBound.boundHeight);

    chartData.partBounds.forEach(part => {
        // ctx.fillRect(part.left, part.top, part.right - part.left, part.bottom - part.top);

    });
};