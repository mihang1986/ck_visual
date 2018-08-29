const Animation = require("../animation"),
    Utils = require("../utils");

var defOpt = {
        color : "#000",
        image : null,
        scale : false
    },
    renderFn = {
        color : function (passed, elapsed, ctx, cvs) {
            ctx.fillStyle = this.options.color;
            ctx.fillRect(0, 0, cvs.width, cvs.height);
        },
        image : function (passed, elapsed, ctx, cvs) {
            var image = this.image.getCanvas(),
                srcW = this.image.getWidth(),
                srcH = this.image.getHeight(),
                cW = cvs.width,
                cH = cvs.height;

            if(this.options.scale)
                ctx.drawImage(image, 0, 0, srcW, srcH, 0, 0, cW, cH);
            else
                ctx.drawImage(image,
                    srcW > cW ? -((srcW - cW )/ 2) : (cW - srcW) / 2,
                    srcH > cH ? -((srcH - cH )/ 2) : (cH - srcH) / 2);
        }
    };

module.exports = Animation.create({
    constructor : function (opt) {
        var that = this;
        this.options = Utils.extends(defOpt, opt);

        if(this.options.image){
            Utils.loadImage(this.options.image, function () {
                that.image = Utils.tranImage(this, "gauss", {sigma : 20});
                that.renderFn = renderFn.image;
            });
        }

        this.renderFn = renderFn.color;
    },
    render : function (passed, elapsed, ctx, cvs) {
        this.renderFn ? this.renderFn.call(this, passed, elapsed, ctx, cvs) : null;
    }
});
