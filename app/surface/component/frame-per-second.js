const Animation = require("../animation"),
    Utils = require("../utils");

// 详细动画类
module.exports = Animation.create({
    constructor : function (opt) {
        var that = this;
        this.opts = Utils.extends({
            showFrame : false,
            showElapsed : false
        }, opt);

        this.fps = 0;
        this.timer = Utils.timer((opt && opt.interval) || 1000, function (timePassed) {
            var surface = that.surface();

            if(this.__lastFrame){
                that.fps = (((surface.frame - this.__lastFrame) / timePassed) * 1000).toFixed(1);
            }
            this.__lastFrame = surface.frame;
        });
    },
    update : function (passed, elapsed, ctx, cvs) {
        this.timer.pass(passed);
    },
    render : function (passed, elapsed, ctx, cvs) {
        ctx.fillStyle = "#fff";
        ctx.textBaseline = "bottom";
        ctx.textAlign = "right";
        ctx.fillText("fps : " + this.fps
            + (this.opts.showFrame ? " , frame : " + this.surface().frame : "")
            + (this.opts.showElapsed ? " , elapsed : " + (this.surface().elapsed  / 1000).toFixed(1): ""), cvs.width -20, cvs.height -20);
    }
});
