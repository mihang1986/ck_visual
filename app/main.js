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
    ArcToPath = require('./surface/path/arcto-path');

var mainSurface = new Surface({full : true, fps : true, bgImg : "./res/MYXJ_20180605170158_fast.jpg", limit :60}).appendTo(document.body).run();

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

// mainSurface.pushObject(new BallInPath({
//     path : new QuadraticPath({
//         x0 : 300,
//         y0 : 500,
//         x1 : 400,
//         y1 : 300,
//         x2 : 500,
//         y2 : 500
//     })
// }));

// var x = new (Animation.create({
//     data : {
//         name : "dsadasdas",
//         sex : "m",
//         x : 10,
//         y : 50,
//         friedns : [
//             {name : "a", sex : "f"},
//             {name : "b", sex : "f"},
//             {name : "c", sex : "f"},
//             {name : "d", sex : "f"},
//             {name : "e", sex : "f"}
//         ]
//     },
//     render (passed, elapsed, ctx, cvs, ret){
//         ctx.beginPath();
//         ctx.moveTo(100,20);
//         ctx.lineTo(180,20);
//         ctx.lineTo(150,70);
//         ctx.strokeStyle = '#66bfff';
//         ctx.stroke();
//
//         ctx.beginPath();
//         ctx.moveTo(100,20);           // 创建开始点
//         ctx.arcTo(180,20,150,70,90); // 创建弧
//         ctx.strokeStyle = '#f0f';
//         ctx.stroke();
//
//         ctx.font="40px Arial";
//         ctx.fillStyle = "#f0f";
//         ctx.fillText(this.data.name, this.data.x, this.data.y);
//     }
// }))();
//
// mainSurface.pushObject(x);

// x.data.sex = "m";
// x.data.friedns.push({name : "x", sex : "f"});
// console.log(x.data);


var BZBall = Animation.create({
    constructor : function (opt) {
        this.opt = Utils.extends({
            lineColor : "#fff",
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
            color : '#ffbaf4'
        }), 100);

        this.interpolator = new CubicInterpolator('easeInOut');
    },
    update : function (passed, elapsed, ctx, cvs) {
        var p = this.interpolator.resolve((elapsed % this.opt.duration) / this.opt.duration);
        return this.compoPath.resolve(p);
    },
    render : function (passed, elapsed, ctx, cvs, ret) {
        var that = this;

        this.compoPath.getPath().forEach(function (val) {
            ctx.shadowBlur = 6;
            ctx.shadowColor = that.opt.lineColor;
            ctx.strokeStyle = that.opt.lineColor;
            ctx.lineWidth = .2;

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


// var BZBall2 = Animation.create({
//     constructor : function (opt) {
//         this.opt = Utils.extends({
//             lineColor : "#fff",
//             arrowColor : "#fff",
//             duration : 10000
//         }, opt);
//
//         this.compoPath = new ComboPath().addPath(new ArcPath({
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
//             }else if(val instanceof ArcPath){
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

// var point1 = new Point({x : 760, y : 150, r : 30, color : '#61ffa2'}),
//     point2 = new Point({x : 600, y : 300, r : 20, color : '#ff91cf'}),
//     point3 = new Point({x : 365, y : 409, r : 40, color : '#63f0ff'});
// mainSurface.pushObject(point1, Surface.LEVEL.LOWER)
//     .pushObject(point2, Surface.LEVEL.LOWER)
//     .pushObject(point3, Surface.LEVEL.LOWER);


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
//     x : 70,
//     y : 20,
//     r : 80,
//     color : "#ffe74e"
// }), 100);
//
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


var textArea = new TextArea({
    x : 600,
    y : 300,
    w : 300,
    h : 300,
    textColor : "#fff",
    text : "法国企业界援助资金16日起纷纷涌入。酩悦·轩尼诗-路易·威登集团及其老板贝尔纳·阿尔诺表示，巴黎圣母院是法国的一个象征，在此次火灾造成的“国殇”中，该集团和家族与全民同哀，愿捐资2亿欧元帮助修复这座非凡的教堂。欧莱雅集团及其继承人贝当古·迈耶斯宣布，将为重建工程出资2亿欧元，其中1亿欧元来自贝当古·舒莱尔基金会。开云集团董事长弗朗索瓦-亨利·皮诺宣布，其家族投资公司将捐资1亿欧元，“这一悲剧不仅是对教徒的打击，而是对所有法国人的打击，每个人都希望我们的国家瑰宝早日重绽光芒。”他说。道达尔集团董事长潘彦磊宣布，集团将为重建提供1亿欧元特殊捐助。德高广告集团宣布将出资2000万欧元，并在广告宣传方面给予协助。法国布依格电信集团将从个人和集团双方面提供援助，首先该集团首席执行官马丁·布依格及其兄弟、公司总经理奥利维耶将通过他们管理的布依格家族控股公司提供1000万欧元。法国凯捷科技服务公司宣布捐资100万欧元。"
});
mainSurface.pushObject(textArea);




var textArea2 = new TextArea({
    x : 1100,
    y : 300,
    w : 400,
    h : 300,
    textColor : "#fff",
    text : "迈凯伦600LT Spider在沿袭长尾车型核心特征的同时进一步丰富了迈凯伦运动跑车系列车型的激情驾驶乐趣。得益MonoCell II碳纤维底盘的强度优势，600LT Spider拥有和600LT Coupé相媲美的动态表现和整体性能。重量仅比600LT Coupé重50公斤，且无需进行额外的结构加固处理。同时，它的重量也比竞品车型更轻。新车还保留了由Coupé车型引入的顶部排气管设计。令人欣喜的是，顶部排气管在车顶或后车窗打开后能够带来更加震撼人心的视听感觉”。迈凯伦600LT Spider在沿袭长尾车型核心特征的同时进一步丰富了迈凯伦运动跑车系列车型的激情驾驶乐趣。得益MonoCell II碳纤维底盘的强度优势，600LT Spider拥有和600LT Coupé相媲美的动态表现和整体性能。重量仅比600LT Coupé重50公斤，且无需进行额外的结构加固处理。同时，它的重量也比竞品车型更轻。新车还保留了由Coupé车型引入的顶部排气管设计。令人欣喜的是，顶部排气管在车顶或后车窗打开后能够带来更加震撼人心的视听感觉”。迈凯伦600LT Spider在沿袭长尾车型核心特征的同时进一步丰富了迈凯伦运动跑车系列车型的激情驾驶乐趣。得益MonoCell II碳纤维底盘的强度优势，600LT Spider拥有和600LT Coupé相媲美的动态表现和整体性能。重量仅比600LT Coupé重50公斤，且无需进行额外的结构加固处理。同时，它的重量也比竞品车型更轻。新车还保留了由Coupé车型引入的顶部排气管设计。令人欣喜的是，顶部排气管在车顶或后车窗打开后能够带来更加震撼人心的视听感觉”。迈凯伦600LT Spider在沿袭长尾车型核心特征的同时进一步丰富了迈凯伦运动跑车系列车型的激情驾驶乐趣。得益MonoCell II碳纤维底盘的强度优势，600LT Spider拥有和600LT Coupé相媲美的动态表现和整体性能。重量仅比600LT Coupé重50公斤，且无需进行额外的结构加固处理。同时，它的重量也比竞品车型更轻。新车还保留了由Coupé车型引入的顶部排气管设计。令人欣喜的是，顶部排气管在车顶或后车窗打开后能够带来更加震撼人心的视听感觉”。"
});
mainSurface.pushObject(textArea2);


var scrollBar = new ScrollBar({
    x : 910,
    y : 300,
    h : 300,
    w : 10,
    change : function (value) {
        console.log(value);
    }
});
mainSurface.pushObject(scrollBar);

var scrollBar2 = new ScrollBar({
    x : 600,
    y : 610,
    h : 10,
    w : 300,
    min : -10000,
    max : 10000,
    type : "h",
    change : function (value) {
        console.log(value);
    }
});
mainSurface.pushObject(scrollBar2);


var input = new TextInput({
    x : 100,
    y : 100,
    w : 200,
    h: 30,
    value : "一二三四五六七八九十"
});
mainSurface.pushObject(input);


var input = new TextInput({
    x : 100,
    y : 200,
    w : 200,
    h: 30
});
mainSurface.pushObject(input);

// setInterval(function () {
//     console.log(document.activeElement);
// }, 100)


const waves = [{
        waveWidth : 0.05,
        waveHeight : 5,
        startOffset : 20,
        color : "#0f0",
        step : 1
    }, {
        waveWidth : 0.05,
        waveHeight : 10,
        startOffset : 0,
        color : "#f0f",
        step : 2
    }];

var Glass = Animation.create({
    constructor : function (opt) {
        this.opt = Utils.extends({
            x : 700,
            y : 300,
            r : 200,
            value : 50
        },  opt);

        this._init();
    },
    render : function (passed, elapsed, ctx, cvs, ret, pret, parent) {
        let that = this;

        // 裁剪区域
        ctx.beginPath();
        ctx.arc(this.opt.x, this.opt.y, this.opt.r, 0, Math.PI * 2);
        ctx.clip();

        // 绘制波浪
        ctx.globalAlpha = .7;
        waves.forEach(function (wave, idx) {
            ctx.fillStyle = that.calculate.colors[idx];
            ctx.beginPath();
            for (let x = that.calculate.x; x < that.calculate.x + that.calculate.w; x += 20 / that.calculate.w) {
                const y = wave.waveHeight * Math.sin((that.calculate.x + x) * wave.waveWidth + that.calculate.offset[idx]);
                ctx.lineTo(x, (that.calculate.h * (1 - (that.opt.value / 100))) + y + that.calculate.y);
            }
            ctx.lineTo(that.calculate.x + that.calculate.w, that.calculate.y + that.calculate.h);
            ctx.lineTo(that.calculate.x, that.calculate.y + that.calculate.h);
            ctx.closePath();
            ctx.fill();
        });

        // 绘制外圈
        ctx.beginPath();
        ctx.lineWidth = 2;
        ctx.arc(this.opt.x, this.opt.y, this.opt.r, 0, Math.PI * 2);
        ctx.stroke();

    },
    update : function (passed, elapsed){
        for(let i=0; i<this.calculate.offset.length; i++){
            this.calculate.offset[i] += (passed / 1000) * waves[i].step;
        }
    },
    methods : {
        _init : function () {
            let that = this;

            // 初始化
            this.resource = {};

            // 初始化计算资源
            this.calculate = {
                x : this.opt.x - this.opt.r,
                y : this.opt.y - this.opt.r,
                w : this.opt.r * 2,
                h : this.opt.r * 2,
                offset : waves.map(function (v) {
                  return v.startOffset;
                })
            };
        }
    },
    notify : {
        resource : function (event) {
            let ctx = event.context, that = this;
            this.calculate.colors = waves.map(function (wave) {
                let lg = ctx.createLinearGradient(0, that.calculate.y, 0, that.calculate.y + that.calculate.h);
                lg.addColorStop(0, wave.color);
                lg.addColorStop(1, "#fff");
                return lg;
            });
        }
    },
    action : {
    }
});

var glass = new Glass();
mainSurface.pushObject(glass);



mainSurface.pushObject(new BallInPath({
    path : new ArcToPath()
}));

