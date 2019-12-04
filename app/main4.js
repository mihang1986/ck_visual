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
    LinerInterpolator = require('./surface/interpolator/linear-interpolator'),
    chroma = require('chroma-js');

(async function () {
    const
        bgImage = await Utils.loadImageAsync('res/test.jpg');

    const
        fillArc = function (ctx, radius, width, start, end) {
            ctx.beginPath();
            ctx.arc(0, 0, radius - width / 2, start, end);
            ctx.lineTo(Math.cos(end) * (radius + width / 2), Math.sin(end) * (radius + width / 2));
            ctx.arc(0, 0, radius + width / 2, end, start, true);
            // ctx.lineTo(Math.cos(start) * (radius - width / 2), Math.sin(start) * (radius - width / 2));
            ctx.closePath();
            ctx.fill();
        };

    const
        BackGround = Animation.create({
            constructor : function (opt) {
                this.image = bgImage;
                this.radian = 0;
            },
            update : function (passed, elapsed, ctx, cvs) {
                this.radian -= passed / 30000 * Math.PI;
            },
            render : function (passed, elapsed, ctx, cvs, ret) {
                ctx.translate(this.surface().width / 2, this.surface().height / 2);
                ctx.rotate(this.radian);
                ctx.drawImage(this.image.getCanvas(), -this.image.getWidth() / 2 , -this.image.getHeight() / 2);
            }
        }),
        Annulus = Animation.create({
            constructor : function ({radius = 100, width = 1, start = 0, end = Math.PI * 2, color = '#fff', opacity = 0.5, floodlight = false} = {}) {
                this.opt = {radius, width, start, end, color, opacity, floodlight};
            },
            render : function (passed, elapsed, ctx, cvs, ret) {
                ctx.translate(this.surface().width / 2, this.surface().height / 2);

                ctx.globalAlpha = this.opt.opacity;
                ctx.fillStyle = this.opt.color;
                if(this.opt.floodlight)
                    [ctx.shadowOffsetX, ctx.shadowOffsetY, ctx.shadowBlur, ctx.shadowColor] = [0, 0, 10, this.opt.color];
                fillArc(ctx, this.opt.radius, this.opt.width, this.opt.start, this.opt.end);
            }
        }),
        DAnnulus = Animation.create({
            constructor : function ({begin = 0, radius = 100, width = 1, start = 0, end = Math.PI * 2, color = '#fff', opacity = 0.5, floodlight = 0, cw = true} = {}) {
                this.opt = {begin, radius, width, start, end, color, opacity, floodlight, cw};
                this.radian = 0;
                this.opt.pcolor = chroma(color).brighten(2).hex();
            },
            update : function (passed, elapsed, ctx, cvs) {
                this.radian += passed / 5000 * Math.PI * (this.opt.cw ? 1 : -1);
            },
            render : function (passed, elapsed, ctx, cvs, ret) {
                ctx.translate(this.surface().width / 2, this.surface().height / 2);
                ctx.rotate(this.radian + this.opt.begin);

                ctx.globalAlpha = this.opt.opacity;
                ctx.fillStyle = this.opt.color;
                if(this.opt.floodlight)
                    [ctx.shadowOffsetX, ctx.shadowOffsetY, ctx.shadowBlur, ctx.shadowColor] = [0, 0, this.opt.floodlight, this.opt.color];
                fillArc(ctx, this.opt.radius, this.opt.width, this.opt.start, this.opt.end);

                ctx.globalAlpha = 1;
                ctx.shadowBlur = 5;
                ctx.fillStyle = this.opt.pcolor;
                ctx.beginPath();
                ctx.arc(Math.cos(this.opt.end) * this.opt.radius, Math.sin(this.opt.end) * this.opt.radius, 4, 0, Math.PI * 2);
                ctx.fill();
            }
        }),
        Sun = Animation.create({
            constructor : function(){
                this.opt = {
                    baseColor : chroma('#FFA07A')
                };
            },
            attach : function({surface, canvas : cvs, context : ctx}){
                const
                    color1 = ctx.createRadialGradient(0, 0, 40, 0, 0, 60),
                    color2 = ctx.createRadialGradient(0, 0, 40, 0, 0, 50),
                    color3 = this.opt.baseColor.brighten(.5),
                    color4 = this.opt.baseColor.brighten(1.2);

                color1.addColorStop(0, this.opt.baseColor.alpha(.5).hex());
                color1.addColorStop(1, this.opt.baseColor.alpha(.0).hex());

                color2.addColorStop(0, this.opt.baseColor.alpha(.0).hex());
                color2.addColorStop(.5, this.opt.baseColor.alpha(.5).hex());
                color2.addColorStop(1, this.opt.baseColor.alpha(.0).hex());

                this.opt.color1 = color1;
                this.opt.color2 = color2;
                this.opt.color3 = color3;
                this.opt.color4 = color4;
            },
            render : function (passed, elapsed, ctx, cvs, ret) {
                ctx.translate(this.surface().width / 2, this.surface().height / 2);

                ctx.fillStyle = this.opt.color1;
                ctx.fillRect(-cvs.width / 2, -cvs.height / 2, cvs.width, cvs.height);

                ctx.fillStyle = this.opt.color2;
                ctx.fillRect(-cvs.width / 2, -cvs.height / 2, cvs.width, cvs.height);

                [ctx.shadowOffsetX, ctx.shadowOffsetY, ctx.shadowBlur, ctx.shadowColor] = [0, 0, 80, this.opt.color];
                ctx.fillStyle = this.opt.color3;
                ctx.globalAlpha = 1;
                ctx.beginPath();
                ctx.arc(0, 0, 30, 0, Math.PI * 2);
                ctx.fill();

                ctx.fillStyle = this.opt.color4;
                ctx.beginPath();
                ctx.arc(0, 0, 26, 0, Math.PI * 2);
                ctx.fill();
            }
        }),
        RoundBuffer = Animation.create({
            constructor : function({surface, radius = 100, begin = 0, cw = true, speed = 20000} = {}){
                this.buf = surface;
                this.radius = radius;
                this.radian = begin;
                this.cw = cw;
                this.speed = speed;
            },
            update : function (passed, elapsed, ctx, cvs) {
                this.radian += passed / this.speed * Math.PI * (this.cw ? 1 : -1);
            },
            render : function (passed, elapsed, ctx, cvs, ret) {
               const
                   x = Math.cos(this.radian) * this.radius,
                   y = Math.sin(this.radian) * this.radius;

                ctx.translate(this.surface().width / 2, this.surface().height / 2);
                ctx.drawImage(this.buf.surface, x - this.buf.width / 2, y - this.buf.height / 2);
            }
        }),
        Message =  Animation.create({
            constructor : function(){
                const
                    rMT = Utils.toRadian(25),
                    rST = Utils.toRadian(60),
                    baseColor = chroma('#14c4ff'),
                    radian = 30;

                this.opt = {
                    baseColor : baseColor,
                    borderColor1 : baseColor.hex(),
                    borderColor2 : baseColor.brighten(.5).hex(),
                    pointColor1 : baseColor.brighten(1.5).hex(),
                    backColor2 : baseColor.brighten(.8).alpha(.4).hex(),
                    backColor3 : baseColor.brighten(1.2).hex(),
                    mainTextColor : baseColor.brighten(.2).hex(),
                    mainTextPos : [Math.cos(rMT) * radian, Math.sin(rMT) * radian],
                    subTextPos : [Math.cos(rST) * radian, Math.sin(rST) * radian],
                    radian : radian
                };

                this.radianOut = 0;
            },
            attach : function({surface, canvas : cvs, context : ctx}){
                const
                    backColor1 = ctx.createRadialGradient(0, 0, 0, 0, 0, this.opt.radian);

                backColor1.addColorStop(0, this.opt.baseColor.alpha(.1).hex());
                backColor1.addColorStop(.9, this.opt.baseColor.alpha(.1).hex());
                backColor1.addColorStop(1, this.opt.baseColor.alpha(0).hex());

                this.opt.backColor1 = backColor1;
            },
            update : function (passed, elapsed, ctx, cvs) {
                this.radianOut += passed / 5000 * Math.PI;
            },
            render : function (passed, elapsed, ctx, cvs, ret) {
                ctx.translate(this.surface().width / 2, this.surface().height / 2);

                ctx.fillStyle = this.opt.backColor1;
                ctx.beginPath();
                ctx.arc(0, 0, this.opt.radian, 0, Math.PI * 2);
                ctx.fill();

                ctx.save();
                ctx.rotate(this.radianOut);
                ctx.setLineDash([5, 5]);
                ctx.lineWidth = .5;
                ctx.strokeStyle = this.opt.borderColor1;
                ctx.beginPath();
                ctx.arc(0, 0, this.opt.radian, 0, Math.PI * 1.5);
                ctx.stroke();
                ctx.restore();

                ctx.fillStyle = this.opt.mainTextColor;
                ctx.font = '12px Arial';
                ctx.textBaseline = 'middle';
                ctx.textAlign = 'left';
                ctx.fillText('短信', this.opt.mainTextPos[0], this.opt.mainTextPos[1]);

                ctx.font = '10px Arial';
                ctx.fillText('Message', this.opt.mainTextPos[0], this.opt.subTextPos[1]);

                ctx.save();
                ctx.rotate(this.radianOut);
                ctx.setLineDash([]);
                ctx.lineWidth = .5;
                ctx.strokeStyle = this.opt.borderColor2;
                ctx.beginPath();
                ctx.arc(0, 0, this.opt.radian * .7, 0, Math.PI * 2);
                ctx.stroke();

                [ctx.shadowOffsetX, ctx.shadowOffsetY, ctx.shadowBlur, ctx.shadowColor] = [0, 0, this.opt.floodlight, this.opt.color];
                ctx.beginPath();
                ctx.arc(this.opt.radian * .7, 0, 3, 0, Math.PI * 2);
                ctx.fill();

                ctx.beginPath();
                ctx.arc(Math.cos(Math.PI * .7) * this.opt.radian * .7,
                    Math.sin(Math.PI * .7) * this.opt.radian * .7
                    , 2, 0, Math.PI * 2);
                ctx.fill();

                ctx.restore();

                ctx.fillStyle = this.opt.backColor2;
                ctx.beginPath();
                ctx.arc(0, 0, this.opt.radian * .44, 0, Math.PI * 2);
                ctx.fill();

                ctx.fillStyle = this.opt.backColor3;
                ctx.beginPath();
                ctx.arc(0, 0, this.opt.radian * .25, 0, Math.PI * 2);
                ctx.fill();
            }
        }),
        WeiBo =  Animation.create({
            constructor : function(){
                const
                    rMT = Utils.toRadian(25),
                    rST = Utils.toRadian(60),
                    baseColor = chroma('#F5DEB3'),
                    radian = 30;

                this.opt = {
                    baseColor : baseColor,
                    lineColor : baseColor.hex(),
                    textColor : baseColor.brighten(.2).hex(),
                    mainColor : baseColor.brighten(.8).hex(),
                    pointColor : baseColor.brighten(1).hex(),
                    mainTextPos : [Math.cos(rMT) * radian, Math.sin(rMT) * radian],
                    subTextPos : [Math.cos(rST) * radian, Math.sin(rST) * radian],
                    radian : radian
                };

                this.radianOut = 0;
            },
            attach : function({surface, canvas : cvs, context : ctx}){
                const
                    backColor1 = ctx.createRadialGradient(0, 0, 0, 0, 0, this.opt.radian);

                backColor1.addColorStop(0, this.opt.baseColor.alpha(1).hex());
                backColor1.addColorStop(.4, this.opt.baseColor.alpha(0).hex());

                this.opt.backColor1 = backColor1;
            },
            update : function (passed, elapsed, ctx, cvs) {
                this.radianOut += passed / 5000 * Math.PI;
            },
            render : function (passed, elapsed, ctx, cvs, ret) {
                ctx.translate(this.surface().width / 2, this.surface().height / 2);

                [ctx.shadowOffsetX, ctx.shadowOffsetY, ctx.shadowBlur, ctx.shadowColor] = [0, 0, this.opt.floodlight, this.opt.color];
                ctx.save();
                ctx.lineWidth = .5;
                ctx.rotate(this.radianOut);

                // 画边框
                ctx.save();
                ctx.scale(1, .3);
                ctx.beginPath();
                ctx.strokeStyle = this.opt.lineColor;
                ctx.arc(0, 0, this.opt.radian, 0, Math.PI * 2);
                ctx.stroke();
                ctx.restore();

                ctx.fillStyle = this.opt.pointColor;
                ctx.beginPath();
                ctx.arc(Math.cos(Utils.toDegree(55)) * this.opt.radian,
                    Math.sin(Utils.toDegree(55)) * this.opt.radian * .3, 3, 0, Math.PI * 2);
                ctx.fill();

                ctx.rotate(Math.PI * .3);
                ctx.save();
                ctx.scale(1, .3);
                ctx.beginPath();
                ctx.strokeStyle = this.opt.lineColor;
                ctx.arc(0, 0, this.opt.radian * .7, 0, Math.PI * 2);
                ctx.stroke();
                ctx.restore();

                ctx.fillStyle = this.opt.pointColor;
                ctx.beginPath();
                ctx.arc(Math.cos(Utils.toRadian(15)) * this.opt.radian * .7,
                    Math.sin(Utils.toRadian(15)) * this.opt.radian * .7 * .3, 2, 0, Math.PI * 2);
                ctx.fill();

                ctx.beginPath();
                ctx.arc(Math.cos(Utils.toRadian(195)) * this.opt.radian * .7,
                    Math.sin(Utils.toRadian(195)) * this.opt.radian * .7 * .3, 2, 0, Math.PI * 2);
                ctx.fill();

                ctx.restore();


                [ctx.shadowOffsetX, ctx.shadowOffsetY, ctx.shadowBlur, ctx.shadowColor] = [0, 0, 0, this.opt.color];
                ctx.fillStyle = this.opt.textColor;
                ctx.font = '12px Arial';
                ctx.textBaseline = 'middle';
                ctx.textAlign = 'left';
                ctx.fillText('微博', this.opt.mainTextPos[0], this.opt.mainTextPos[1]);

                ctx.font = '10px Arial';
                ctx.fillText('Mircoblog', this.opt.mainTextPos[0], this.opt.subTextPos[1]);


                ctx.fillStyle = this.opt.backColor1;
                ctx.fillRect(-cvs.width / 2, -cvs.height / 2, cvs.width, cvs.height);

                ctx.fillStyle = this.opt.mainColor;
                ctx.beginPath();
                ctx.arc(0, 0, this.opt.radian * .1, 0, Math.PI * 2);
                ctx.fill();
            }
        });


    const
        surface = new Surface({width : 450, height : 700, fps : true, limit :0, bgColor : '#000'}).appendTo(document.body).run(),
        surfaceMessage = new Surface({width : 200, height : 200, fps : false, limit :0}).pushObject(new Message()).run(),
        surfaceWeiBo = new Surface({width : 200, height : 200, fps : false, limit :0}).pushObject(new WeiBo()).run();

    surface.pushObject(new BackGround());
    surface.pushObject(new Annulus({radius : 340, width : 4, start : 0, end : Math.PI * 2, opacity : 0.3, floodlight : 0}));
    surface.pushObject(new Annulus({radius : 250, width : 3, start : 0, end : Math.PI * 2, opacity : 0.3, floodlight : 0}));
    surface.pushObject(new Annulus({radius : 244, width : 10, start : -Math.PI / 2, end : Math.PI, opacity : 0.1, floodlight : 0}));
    surface.pushObject(new Annulus({radius : 180, width : 2, start : 0, end : Math.PI * 2, opacity : 0.3, floodlight : 0, color : '#FFAEB9'}));
    surface.pushObject(new DAnnulus({radius : 130, width : 2, start : 0, end : Math.PI * 1.5, opacity : .3, floodlight : 10, color : '#FFA54F', cw : false}));
    surface.pushObject(new DAnnulus({radius : 80, width : 2, start : 0, end : Math.PI * 1.5, opacity : .3, floodlight : 10, color : '#FFA54F', cw : true, begin : Math.PI}));
    surface.pushObject(new Sun());

    surface.pushObject(new RoundBuffer({surface : surfaceMessage, radius : 180, cw : false}));
    surface.pushObject(new RoundBuffer({surface : surfaceWeiBo, radius : 180, cw : false, begin : Math.PI  * 2  / 3}));
}());



