const
    Animation = require('../animation'),
    chinaGeo = require('./maps/china'),
    chinaAround = require('./maps/china-around'),
    EaseCubicInterpolator = require('../interpolator/ease-cubic-interpolator'),
    Util = require('../utils'),
    ArcPath = require('../path/arc-path'),
    Buffer = require('../buffer'),
    ComboPath = require('../path/combo-path'),
    LinePath = require('../path/line-path'),
    Transmit = require('../map/transmit'),
    Ripple = require(`../map/ripple`),
    Queue = require('../queue/queue'),
    Focus = require('../map/focus'),
    axios = require('axios');

module.exports = (function () {
    const
        drawPoint = function(point, ctx, {color = '#000', radius = 3} = {}){
            ctx.beginPath();
            ctx.fillStyle = color;
            ctx.arc(point[0], point[1], radius, 0, Math.PI * 2);
            ctx.fill();
        },
        drawText = function(point, text, ctx, {color = '#000'} = {}){
            ctx.textBaseline = 'middle';
            ctx.textAlign = 'center';
            ctx.fillStyle = color;
            ctx.fillText(text, point[0], point[1]);
        },
        drawArc = function (ctx, o, r, start = 0, end = Math.PI * 2, color = '#000') {
            ctx.strokeStyle = color;
            ctx.beginPath();
            ctx.arc(o[0], o[1], r, start, end);
            ctx.stroke();
        },
        drawProvince = function (md, ctx) {
            Util.Helper.clearShadow(ctx);
            ctx.globalCompositeOperation = "source-over";
            // ctx.strokeStyle = '#666666';
            ctx.fillStyle = '#508b92';
            // ctx.lineWidth = .5;
            // ctx.lineCap = 'square';
            md.coordinates.forEach(function (cd) {
                ctx.beginPath();
                cd.forEach((cood, idx) => {
                    ctx[idx ? 'lineTo' : 'moveTo'](cood[0], cood[1]);
                });

                // Util.Helper.setShadow(ctx);
                ctx.globalAlpha = .2;
                ctx.fill();
                // Util.Helper.clearShadow(ctx);


                // ctx.globalCompositeOperation = "distination-over";
                // ctx.globalAlpha = 1;
                // ctx.stroke();

                // drawPoint(md.cp, ctx);
                // drawText(md.cp, md.name, ctx, {color : '#fff608'});
            });
        },
        drawProvinceShadow = function (md, ctx) {
            ctx.globalCompositeOperation = "xor";
            Util.Helper.setShadow(ctx, '#fff', 10);
            ctx.fillStyle = '#fff';
            md.coordinates.forEach(function (cd) {
                ctx.beginPath();
                cd.forEach((cood, idx) => {
                    ctx[idx ? 'lineTo' : 'moveTo'](cood[0], cood[1]);
                });

                ctx.fill();
            });
        },
        drawProvinceBorder = function (md, ctx) {
            Util.Helper.clearShadow(ctx);
            ctx.globalAlpha = 1;
            ctx.globalCompositeOperation = "destination-out";
            ctx.strokeStyle = '#fff97d';
            ctx.lineWidth = .5;
            md.coordinates.forEach(function (cd) {
                ctx.beginPath();
                cd.forEach((cood, idx) => {
                    ctx[idx ? 'lineTo' : 'moveTo'](cood[0], cood[1]);
                });

                ctx.stroke();
            });
        },
        drawProvinceText = function (md, ctx) {
            Util.Helper.clearShadow(ctx);
            ctx.globalAlpha = 1;
            ctx.globalCompositeOperation = "source-over";
            md.coordinates.forEach(function (cd) {
                ctx.beginPath();
                cd.forEach((cood, idx) => {
                    ctx[idx ? 'lineTo' : 'moveTo'](cood[0], cood[1]);
                });

                drawText(md.cp, md.name, ctx, {color : '#fff608'});

                // drawPoint(md.cp, ctx);
                // drawText(md.cp, md.name, ctx, {color : '#fff608'});
            });
        },
        drawChinaAround = function (ctx, dts, color = '#0ff', width = 2) {
            ctx.globalCompositeOperation = "source-over";
            ctx.lineCap="round";
            // ctx.globalAlpha = .8;
            ctx.lineWidth = width;
            ctx.strokeStyle = color;
            ctx.beginPath();
            for(let i = 0; i < dts.length; i++){
                ctx[i == 0 ? 'moveTo' : 'lineTo'](dts[i][0], dts[i][1]);
            }
            ctx.closePath();
            ctx.stroke();
        };

    const
        inter = new EaseCubicInterpolator({x1: .46, x2: .01, y1: .39, y2: .81});

    const
        colors = {
            'xzxk' : '#a5ffa6',
            'xzcf' : '#ff9f93'
        };

    return Animation.create({
            constructor : function({scaleX = 20, scaleY = 25, offsetX = 0, offsetY = 0, centerImg = null} = {}){
                const
                    that = this;
                this.scaleX = scaleX;
                this.scaleY = scaleY;
                this.offsetX = offsetX;
                this.offsetY = offsetY;
                this.centerImg = centerImg;
                this.bound = chinaGeo.features.flatMap(v=>v.geometry.coordinates).flat().reduce((v, o)=>{
                    v.left = Math.min(o[0], v.left);
                    v.right = Math.max(o[0], v.right);
                    v.top = Math.min(o[1], v.top);
                    v.bottom = Math.max(o[1], v.bottom);
                    return v;
                }, {left : Number.MAX_VALUE, right : Number.MIN_VALUE, top : Number.MAX_VALUE, bottom : Number.MIN_VALUE});
                this.hWidth = (this.bound.right - this.bound.left) / 2;
                this.hHeight = (this.bound.bottom - this.bound.top) / 2;
                this.transformPoint = function (point) {
                    return [(point[0] - this.bound.left - this.hWidth) * this.scaleX,
                        -(point[1] - this.bound.top - this.hHeight) * this.scaleY];
                };
                this.mapData = chinaGeo.features.map(f => ({
                    'id' : f.id,
                    'name' : f.properties.name,
                    'cp' : this.transformPoint(f.properties.cp, this.scaleX, this.scaleY),
                    'coordinates' : f.geometry.coordinates.map(c=>c.map(v=>this.transformPoint(v, this.scaleX, this.scaleY)))
                }));
                this.idxMapData = this.mapData  .reduce((a, o) => {
                    a[o.id] = o;
                    return a;
                }, {});
                // this.bj = this.mapData.filter(md => md.id == 'bei_jing')[0];
                this.bj = {cp : [450, 0]};
                this.paths = this.mapData.reduce((res, md) => {
                    const
                        d = Util.Math.distance(md.cp, this.bj.cp),
                        arc = Util.Math.twoPointArc(md.cp, this.bj.cp, d),
                        path = new ArcPath({
                            x : arc.origin[0],
                            y : arc.origin[1],
                            r : arc.radius,
                            sAngle : arc.start < arc.end ? arc.start : arc.end,
                            eAngle : arc.end > arc.start ? arc.end : arc.start,
                            clockwise : arc.start > arc.end,
                            inversion : arc.start > arc.end
                        });

                    res[md.id] = {
                        path : path,
                        length : path.length()
                    };

                    return res;
                }, {});
                this.buffer = new Buffer(this.hWidth * 2 * this.scaleX + 10, this.hHeight * 2  * this.scaleY + 10);
                this.bufferCenter = new Buffer(100, 100);
                this.aroundData = chinaAround.map(ca => ca.map(p=>[p[0] * that.scaleX, p[1] * this.scaleY]));
                this.aroundPath = this.aroundData.map(ad => ad.reduce((cp, p, idx) => cp.addPath((new LinePath({
                    x0 : p[0],
                    y0 : p[1],
                    x1 : Util.getArrayAt(ad, idx + 1)[0],
                    y1 : Util.getArrayAt(ad, idx + 1)[1]
                }))), new ComboPath()));

                this.focusBj = (new Focus({point : this.bj.cp}));
                this.addSubObject(this.focusBj, 1);


                this.tpDuration = 30000;
                this.tp1 = new Transmit({path : this.aroundPath[0], color : '#ff9f93', length : 100, atte : 1, baseR : 3, step : 0.00055, nl : 40, limit : false, canAtte : false});
                this.addSubObject(this.tp1);

                this.tp2 = new Transmit({path : this.aroundPath[0], color : '#a5ffa6', length : 80, atte : 1, baseR : 3, step : 0.00055, nl : 40, limit : false, canAtte : false});
                this.addSubObject(this.tp2);

                this._init();
            },
            attach : function({surface, canvas : cvs, context : ctx}){
            },
            update : function (passed, elapsed, ctx, cvs) {
                const
                    p = (elapsed % this.tpDuration) / this.tpDuration;
                this.tp1.opt.percent = p;
                this.tp2.opt.percent = p + .5;
            },
            methods : {
                _init : function () {
                    let
                        [cvs, ctx] = [this.buffer.canvas, this.buffer.context];
                    ctx.translate(cvs.width / 2 + 5, cvs.height / 2 + 5); // 加5个像素是因为创建CANVAS的时候,宽度加了10,所以左边要+5
                    ctx.font = '12px Arial';
                    this.mapData.forEach(prov => drawProvince(prov, ctx));
                    this.mapData.forEach(prov => drawProvinceShadow(prov, ctx));
                    this.mapData.forEach(prov => drawProvinceBorder(prov, ctx));
                    this.aroundData.forEach(ad => drawChinaAround(ctx, ad, '#fdffb1', 1.5));
                    this.mapData.forEach(prov => drawProvinceText(prov, ctx));

                    if(this.centerImg){
                        [cvs, ctx] = [this.bufferCenter.canvas, this.bufferCenter.context];
                        ctx.font = '12px Arial';
                        ctx.textBaseline = 'middle';
                        ctx.textAlign = 'center';
                        ctx.fillStyle = '#f9ff7c';
                        ctx.globalAlpha = .8;
                        ctx.drawImage(this.centerImg.canvas, cvs.width / 2 - 30, 15, 60, 60);
                        Util.Helper.setShadow(ctx);
                        ctx.fillText('国家信用中心', 50, 85);
                    }
                },
                tick : function (id, color) {
                    const
                        that = this,
                        ripple = new Ripple({point : this.idxMapData[id].cp, color : color}).appendTo(this.surface()),
                        tran = new Transmit({path : this.paths[id].path, color : color, length : Math.floor(this.paths[id].length / 10)}).appendTo(this.surface()),
                        queuet = new Queue(tran.opt, {
                            prop : {
                                percent : {s : 0, e : 1}
                            },
                            duration : 2000,
                            interpolator : inter,
                            callback : function () {
                                that.surface().removeObject(tran);
                            }
                        }),
                        queuer = new Queue(ripple.opt, {
                            prop : {
                                percent : {s : 0, e : 1}
                            },
                            duration : 1000,
                            interpolator : inter,
                            callback : function () {
                                that.surface().removeObject(ripple);
                            }
                        });
                },
                newTick : function (data) {
                    this.tick(data.orgid, colors[data.sgsType]);
                }
            },
            render : function (passed, elapsed, ctx, cvs, ret) {
                ctx.drawImage(this.buffer.canvas,
                    (cvs.width - this.buffer.canvas.width) / 2 - 5,
                    (cvs.height - this.buffer.canvas.height) / 2 - 5);

                    ctx.drawImage(this.bufferCenter.canvas, this.bj.cp[0] + cvs.width / 2 - 50, this.bj.cp[1] + cvs.height / 2 - 50);
            }
        });
}());



// 找地图边线
// const
// Test = Animation.create({
//     constructor : function (path) {
//         this.path = path;
//         this.index = 0;
//         this.start = 0;
//         this.end = 1;
//         console.log(this.path.coordinates[this.index].length);
//     },
//     render : function (passed, elapsed, ctx, cvs, ret) {
//         const
//             points = this.path.coordinates[this.index];
//
//         ctx.translate(cvs.width / 2, cvs.height / 2);
//
//         ctx.lineWidth = 2;
//         ctx.strokeStyle = '#f0f';
//         ctx.beginPath();
//         for(let i = this.start; i <= this.end; i++){
//             ctx[i == this.start ? 'moveTo' : 'lineTo'](points[i][0], points[i][1]);
//         }
//         ctx.stroke();
//     }
// }),
// t1 = new Test(chinaMap.idxMapData['gan_su']).appendTo(mainSurface),

// Test2 = Animation.create({
//     constructor : function ({chinaMap, list}) {
//         this.chinaMap = chinaMap;
//         this.list = list;
//         this.points = [];
//         this.current = 0;
//         this.p = 0;
//         this._init();
//     },
//     update : function(passed, elapsed, ctx, cvs){
//         this.p += passed;
//         if(this.p > 50){
//             this.current = (this.current + 1) % this.points.length;
//             this.p = this.p % 50;
//         }
//     },
//     render : function (passed, elapsed, ctx, cvs, ret) {
//         ctx.translate(cvs.width / 2, cvs.height / 2);
//
//         ctx.lineWidth = 2;
//         ctx.strokeStyle = '#5eff00';
//         ctx.beginPath();
//         for(let i = 0; i < this.points.length; i++){
//             ctx[i == 0 ? 'moveTo' : 'lineTo'](this.points[i][0], this.points[i][1]);
//         }
//         ctx.stroke();
//
//         Utils.Helper.fillArc(ctx, this.points[this.current][0], this.points[this.current][1], 5, '#0ff');
//     },
//     methods : {
//         _init : function () {
//             const
//                 that = this;
//
//             this.list.forEach(v => {
//                 if(v.id){
//                     const
//                         index = v.i || 0,
//                         step = v.s > v.e ? -1 : 1;
//                     for(let i = v.s; i != v.e; i += step){
//                         that.points.push(that._parse(this.chinaMap.idxMapData[v.id].coordinates[index][i], 20, 25));
//                     }
//                 }else{
//                     that.points.push(...v.map(p=>that._parse(p, 20, 25)));
//                 }
//             });
//
//             console.log(JSON.stringify(this.points));
//         },
//         _parse : function (pt, sX, sY) {
//             const
//                 nX = pt[0] / sX,
//                 nY = pt[1] / sY,
//                 nXF = Math.round(nX * 10000) / 10000,
//                 nYF = Math.round(nY * 10000) / 10000;
//
//             return [nXF, nYF];
//         }
//     }
// }),
// t2 = new Test2({chinaMap, list : [
//         {id : 'xin_jiang', s : 150, e : 51},
//         {id : 'xi_zang', s : 146, e : 78},
//         {id : 'yun_nan', s : 125, e : 73},
//         {id : 'guang_xi', s : 73, e : 53},
//         {id : 'guang_dong', s : 83, e : 78},
//         {id : 'hai_nan', s : 3, e : -1},
//         {id : 'hai_nan', s : 18, e : 5},
//         {id : 'guang_dong', s : 75, e : 59},
//         {id : 'xiang_gang', s : 0, e : 1},
//         {id : 'guang_dong', s : 55, e : 46},
//         {id : 'fu_jian', s : 34, e : 8},
//         {id : 'zhe_jiang', s : 32, e : 12},
//         {id : 'shang_hai', s : 7, e : 4},
//         {id : 'jiang_su', s : 24, e : 13},
//         {id : 'shan_dong', s : 40, e : 8},
//         {id : 'tian_jin', s : 17, e : 13},
//         {id : 'he_bei', s : 43, e : 35},
//         {id : 'liao_ning', s : 47, e : 28},
//         {id : 'ji_lin', s : 52, e : 28},
//         {id : 'hei_long_jiang', s : 56, e : -1},
//         {id : 'nei_meng_gu', s : 67, e : -1},
//         {id : 'gan_su', s : 1, e : -1},
//     ]}).appendTo(mainSurface);