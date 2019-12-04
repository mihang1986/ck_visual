const
    Animation = require('../animation'),
    Utils = require('../utils');

module.exports = Animation.create({
    render : function (passed, elapsed, ctx, cvs) {
        ctx.fillStyle = '#0008';
        ctx.fillRect(0, 0, cvs.width, cvs.height);
        ctx.fillStyle = '#fff';
        ctx.fillText('连接中....', 100, 100);
    }
});