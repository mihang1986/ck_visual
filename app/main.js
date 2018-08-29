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
    Rect = require('./surface/component/rect'),
    Line = require('./surface/component/line'),
    ArcPath = require('./surface/path/arc-path'),
    RectPath = require('./surface/path/rect-path'),
    QuadraticPath = require('./surface/path/quadratic-path');

var mainSurface = new Surface({full : true, fps : true, bgImg : "./res/tim2222g.jpg", limit :0}).appendTo(document.body).run();


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
            }else if(this.path instanceof QuadraticPath){
                ctx.moveTo(this.path.x0, this.path.y0);
                ctx.quadraticCurveTo(this.path.x1, this.path.y1, this.path.x2, this.path.y2);
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


mainSurface.pushObject(new BallInPath({
    path : new ArcPath({
        x : 300,
        y : 300,
        r : 50,
        sAngle : Math.PI * .3,
        eAngle : Math.PI * 1.5,
        clockwise : true,
        inversion : false
    })
}));

mainSurface.pushObject(new BallInPath({
    path : new BezirePath({
        x0 : 328,
        y0 : 402,
        x1 : 957,
        y1 : 25,
        x2 : 1450,
        y2 : 94,
        x3 : 1578,
        y3 : 408
    })
}));

mainSurface.pushObject(new BallInPath({
    path : new RectPath({
        x : 100,
        y : 300,
        w : 200,
        h : 200
    })
}));

mainSurface.pushObject(new BallInPath({
    path : new QuadraticPath({
        x0 : 300,
        y0 : 500,
        x1 : 400,
        y1 : 300,
        x2 : 500,
        y2 : 500
    })
}));

mainSurface.pushObject(new (Animation.create({
    render (passed, elapsed, ctx, cvs, ret){
        ctx.beginPath();
        ctx.moveTo(100,20);
        ctx.lineTo(180,20);
        ctx.lineTo(150,70);
        ctx.strokeStyle = '#66bfff';
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(100,20);           // 创建开始点
        ctx.arcTo(180,20,150,70,90); // 创建弧
        ctx.strokeStyle = '#f0f';
        ctx.stroke();
    }
}))());


// var BZBall = Animation.create({
//     constructor : function (opt) {
//         this.opt = Utils.extends({
//             lineColor : "#fff",
//             arrowColor : "#fff",
//             duration : 10000
//         }, opt);
//
//         this.compoPath = new CompoPath().addPath(new BezirePath({
//             p0x : 65,
//             p0y : 209,
//             p1x : 200,
//             p1y : 300,
//             p2x : 637,
//             p2y : 300,
//             p3x : 760,
//             p3y : 150,
//         })).addPath(new LinePath({
//             sX : 760,
//             sY : 150,
//             tX : 1300,
//             tY : 150
//         })).addPath(new LinePath({
//             sX : 1300,
//             sY : 150,
//             tX : 200,
//             tY : 500
//         })).addPath(new LinePath({
//             sX : 200,
//             sY : 500,
//             tX : 65,
//             tY : 209
//         }));
//
//         this.addSubObject(new Point({
//             color : '#ffbaf4'
//         }), 100);
//
//         this.interpolator = new CubicInterpolator('easeInOut');
//     },
//     update : function (passed, elapsed, ctx, cvs) {
//         var p = this.interpolator.resolve((elapsed % this.opt.duration) / this.opt.duration);
//         return this.compoPath.resolve(p);
//     },
//     render : function (passed, elapsed, ctx, cvs, ret) {
//         var that = this;
//
//         this.compoPath.getPath().forEach(function (val) {
//             ctx.shadowBlur = 6;
//             ctx.shadowColor = that.opt.lineColor;
//             ctx.strokeStyle = that.opt.lineColor;
//             ctx.lineWidth = .2;
//
//             if(val instanceof BezirePath){
//                 ctx.save();
//                 ctx.beginPath();
//                 ctx.moveTo(val.p0x, val.p0y);
//                 ctx.bezierCurveTo(val.p1x, val.p1y, val.p2x, val.p2y, val.p3x, val.p3y);
//                 ctx.stroke();
//                 ctx.restore();
//             }else if(val instanceof LinePath){
//                 ctx.save();
//                 ctx.beginPath();
//                 ctx.moveTo(val.sX, val.sY);
//                 ctx.lineTo(val.tX, val.tY);
//                 ctx.stroke();
//                 ctx.restore();
//             }
//         });
//
//         // 绘制三角
//         ctx.save();
//         ctx.fillStyle = this.opt.arrowColor;
//         ctx.translate(ret[0], ret[1]);
//         if(ret[2]){
//             ctx.rotate(ret[2]* (Math.PI / 180));
//         }
//         ctx.beginPath();
//         ctx.moveTo(-15, -10);
//         ctx.lineTo(8, 0);
//         ctx.lineTo(-15, 10);
//         ctx.closePath();
//         ctx.fill();
//         ctx.restore();
//     }
// });
// mainSurface.pushObject(new BZBall());
//
//
// var BZBall2 = Animation.create({
//     constructor : function (opt) {
//         this.opt = Utils.extends({
//             lineColor : "#fff",
//             arrowColor : "#fff",
//             duration : 10000
//         }, opt);
//
//         this.compoPath = new CompoPath().addPath(new CirclePath({
//             cX : 1300,
//             cY : 400,
//             r : 200,
//             clockwise : false
//         }));
//
//         //this.interpolator = new LinearInterpolator();
//         this.interpolator = new QuadInterpolator({type : 'easeInOut'});
//         //this.interpolator = new EaseCubicInterpolator();
//     },
//     update : function (passed, elapsed, ctx, cvs) {
//         var p = this.interpolator.resolve((elapsed % this.opt.duration) / this.opt.duration);
//         return this.compoPath.resolve(p);
//     },
//     render : function (passed, elapsed, ctx, cvs, ret) {
//         var that = this;
//
//         this.compoPath.getPath().forEach(function (val) {
//             ctx.shadowBlur = 5;
//             ctx.shadowColor = that.opt.lineColor;
//             ctx.strokeStyle = that.opt.lineColor;
//             ctx.lineWidth = .3;
//
//             if(val instanceof BezirePath){
//                 ctx.save();
//                 ctx.beginPath();
//                 ctx.moveTo(val.p0x, val.p0y);
//                 ctx.bezierCurveTo(val.p1x, val.p1y, val.p2x, val.p2y, val.p3x, val.p3y);
//                 ctx.stroke();
//                 ctx.restore();
//             }else if(val instanceof LinePath){
//                 ctx.save();
//                 ctx.beginPath();
//                 ctx.moveTo(val.sX, val.sY);
//                 ctx.lineTo(val.tX, val.tY);
//                 ctx.stroke();
//                 ctx.restore();
//             }else if(val instanceof CirclePath){
//                 ctx.save();
//                 ctx.beginPath();
//                 ctx.arc(val.cX, val.cY, val.r, 0, Math.PI * 2);
//                 ctx.stroke();
//                 ctx.restore();
//             }
//         });
//
//
//         // 绘制小球
//         // ctx.save();
//         // ctx.beginPath();
//         // ctx.arc(ret[0], ret[1], 10,0, Math.PI * 2);
//         // ctx.fillStyle = this.opt.arrowColor;
//         // ctx.fill();
//         // ctx.restore();
//
//         // 绘制三角
//         ctx.save();
//         ctx.fillStyle = this.opt.arrowColor;
//         ctx.translate(ret[0], ret[1]);
//         if(ret[2]){
//             ctx.rotate(ret[2]* (Math.PI / 180));
//         }
//         ctx.beginPath();
//         ctx.moveTo(-8, -4);
//         ctx.lineTo(8, 0);
//         ctx.lineTo(-8, 4);
//         ctx.closePath();
//         ctx.fill();
//         ctx.restore();
//
//     }
// });
// mainSurface.pushObject(new BZBall2());
//
// var point1 = new Point({x : 760, y : 150, r : 30, color : '#61ffa2'}),
//     point2 = new Point({x : 600, y : 300, r : 20, color : '#ff91cf'}),
//     point3 = new Point({x : 365, y : 409, r : 40, color : '#63f0ff'});
// mainSurface.pushObject(point1, Surface.LEVEL.LOWER)
//     .pushObject(point2, Surface.LEVEL.LOWER)
//     .pushObject(point3, Surface.LEVEL.LOWER);
//
//
// var point = new Point({
//     x : 400,
//     y : 100,
//     r : 80,
//     color : "#3fff7b"
// }).addSubObject(new Point({
//     x : 10,
//     y : 20,
//     r : 80,
//     color : "#ff73a1"
// }), -100).addSubObject(new Point({
//     x : -10,
//     y : 20,
//     r : 80,
//     color : "#ffe74e"
// }), 100);

// mainSurface.pushObject(point, 333);




// var wrapIt = function (obj) {
//     var wrapObj = {},
//         _set = function (prop, val) {
//             console.log("set", prop, val);
//             this[prop] = val;
//         },
//         _get = function (prop) {
//             console.log("get", prop);
//             return this[prop];
//         };
//
//     for(var i in obj){
//         Object.defineProperty(wrapObj, i, {
//             get : function () {
//                 return _get.call(obj, i);
//             },
//             set : function (val) {
//                 _set.call(obj, i, val);
//             }
//         });
//     }
//     return wrapObj;
// };
//
// var x = wrapIt({
//     name : "米航",
//     age : 32
// });
//
// x.name = "牛逼";
// console.log(x.name);