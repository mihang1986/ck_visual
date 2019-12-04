require("./main.scss");

var Surface = require('./surface/surface'),
    BezirePath = require('./surface/path/bezier-path'),
    LinePath = require('./surface/path/line-path'),
    ComboPath = require('./surface/path/combo-path'),
    Animation = require('./surface/animation'),
    Utils = require('./surface/utils'),
    LinearInterpolator = require('./surface/interpolator/linear-interpolator'),
    QuadInterpolator = require('./surface/interpolator/quad-interpolator'),
    CubicInterpolator = require('./surface/interpolator/cubic-interpolator'),
    QuartInterpolator = require('./surface/interpolator/quart-interpolator'),
    EaseCubicInterpolator = require('./surface/interpolator/ease-cubic-interpolator'),
    BounceInterpolator = require('./surface/interpolator/bounce-interpolator'),
    Point = require('./surface/component/point'),
    Path = require('path'),
    ArcToPath = require('./surface/path/arcto-path'),
    Rect = require('./surface/component/rect'),
    Line = require('./surface/component/line'),
    ArcPath = require('./surface/path/arc-path'),
    RectPath = require('./surface/path/rect-path'),
    QuadraticPath = require('./surface/path/quadratic-path'),
    TextArea = require('./surface/component/text-area'),
    ScrollBar = require('./surface/component/scroll-bar'),
    TextInput = require('./surface/component/text-input'),
    ArcToPath = require('./surface/path/arcto-path'),
    LinerInterpolator = require('./surface/interpolator/linear-interpolator');

var mainSurface = new Surface({full : true, fps : true, limit :0, bgColor : '#000'}).appendTo(document.body).run();

var BallInPath = Animation.create({
    constructor : function (opt) {
        this.path = opt.path;
        this.dur = opt.dur || 3000;
        this.interpolator = new CubicInterpolator('easeInOut');
    },
    update : function (passed, elapsed, ctx, cvs) {
        var p = this.interpolator.resolve((elapsed % this.dur) / this.dur),
            ret = this.path.resolve(p);

        return ret;
    },
    render : function (passed, elapsed, ctx, cvs, ret) {
        ctx.beginPath();
        if(this.path instanceof ArcPath){
            ctx.arc(this.path.x, this.path.y, this.path.r, this.path.sAngle, this.path.eAngle, this.path.clockwise);
        }else if(this.path instanceof BezirePath){
            ctx.moveTo(this.path.x0, this.path.y0);
            ctx.bezierCurveTo(this.path.x1, this.path.y1, this.path.x2, this.path.y2, this.path.x3, this.path.y3);
        }else if(this.path instanceof RectPath){
            ctx.rect(this.path.x, this.path.y, this.path.w, this.path.h);
        }else if(this.path instanceof QuadraticPath) {
            ctx.moveTo(this.path.x0, this.path.y0);
            ctx.quadraticCurveTo(this.path.x1, this.path.y1, this.path.x2, this.path.y2);
        }else if(this.path instanceof  ArcToPath){
            ctx.moveTo(this.path.x1, this.path.y1);
            ctx.arcTo(this.path.x2, this.path.y2, this.path.x3, this.path.y3, this.path.radius);
        }else if(this.path instanceof ComboPath){
            this.path.paths.forEach(function (val) {
                if(val instanceof BezirePath){
                    ctx.save();
                    ctx.beginPath();
                    ctx.moveTo(val.x0, val.y0);
                    ctx.bezierCurveTo(val.x1, val.y1, val.x2, val.y2, val.x3, val.y3);
                    ctx.stroke();
                    ctx.restore();
                }else if(val instanceof LinePath){
                    ctx.save();
                    ctx.beginPath();
                    ctx.moveTo(val.x0, val.y0);
                    ctx.lineTo(val.x1, val.y1);
                    ctx.stroke();
                    ctx.restore();
                }
            });
        }

        ctx.strokeStyle = '#000';
        ctx.stroke();

        ctx.beginPath();
        ctx.translate(ret[0], ret[1]);
        ctx.rotate(ret[2]);
        //ctx.arc(ret[0], ret[1], 10, 0, Math.PI * 2);
        ctx.moveTo(-10, -5);
        ctx.lineTo(10, 0);
        ctx.lineTo(-10, 5);
        ctx.closePath();

        ctx.fillStyle = '#f0f';
        ctx.fill();
    }
});


var BZBall = Animation.create({
    constructor : function (opt) {
        this.opt = Utils.extends({
            lineColor : "#ffff",
            arrowColor : "#fff",
            duration : 10000
        }, opt);

        this.compoPath = new ComboPath().addPath(new BezirePath({
            x0 : 65,
            y0 : 209,
            x1 : 200,
            y1 : 300,
            x2 : 637,
            y2 : 300,
            x3 : 760,
            y3 : 150,
        })).addPath(new LinePath({
            x0 : 760,
            y0 : 150,
            x1 : 1300,
            y1 : 150
        })).addPath(new LinePath({
            x0 : 1300,
            y0 : 150,
            x1 : 200,
            y1 : 500
        })).addPath(new LinePath({
            x0 : 200,
            y0 : 500,
            x1 : 65,
            y1 : 209
        }));

        this.addSubObject(new Point({
            color : '#fff854'
        }), 100);

        this.interpolator = new LinerInterpolator();
    },
    update : function (passed, elapsed, ctx, cvs) {
        var p = this.interpolator.resolve((elapsed % this.opt.duration) / this.opt.duration);
        return this.compoPath.resolve(p);
    },
    render : function (passed, elapsed, ctx, cvs, ret) {
        var that = this;

        this.compoPath.getPath().forEach(function (val) {
            //ctx.shadowBlur = 6;
            //ctx.shadowColor = that.opt.lineColor;
            ctx.strokeStyle = that.opt.lineColor;
            ctx.lineWidth = 1;

            if(val instanceof BezirePath){
                ctx.save();
                ctx.beginPath();
                ctx.moveTo(val.x0, val.y0);
                ctx.bezierCurveTo(val.x1, val.y1, val.x2, val.y2, val.x3, val.y3);
                ctx.stroke();
                ctx.restore();
            }else if(val instanceof LinePath){
                ctx.save();
                ctx.beginPath();
                ctx.moveTo(val.x0, val.y0);
                ctx.lineTo(val.x1, val.y1);
                ctx.stroke();
                ctx.restore();
            }
        });

        // 绘制三角
        // ctx.save();
        // ctx.fillStyle = this.opt.arrowColor;
        // ctx.translate(ret[0], ret[1]);
        // if(ret[2]){
        //     ctx.rotate(ret[2]* (Math.PI / 180));
        // }
        // ctx.beginPath();
        // ctx.moveTo(-15, -10);
        // ctx.lineTo(8, 0);
        // ctx.lineTo(-15, 10);
        // ctx.closePath();
        // ctx.fill();
        // ctx.restore();
    }
});
mainSurface.pushObject(new BZBall());
