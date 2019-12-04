const
    Animation = require('../animation'),
    Buffer = require('../buffer'),
    BackInterplator = require('../interpolator/back-interpolator'),
    EaseCubicInterpolator = require('../interpolator/ease-cubic-interpolator'),
    _ = require('lodash'),
    Queue = require('../queue/queue2'),
    chroma = require('chroma-js'),
    Util =  require('../utils');

module.exports = (function () {
    const
        isCrossLine = function(line1, line2){   // 判断两条直线是否相交 https://www.cnblogs.com/tuyang1129/p/9390376.html
            let
                vec0 = Util.Math.vector(line1[0], line1[1]),
                vec1 = Util.Math.vector(line1[0], line2[0]),
                vec2 = Util.Math.vector(line1[0], line2[1]),
                cross1 = Util.Math.cross(vec0, vec1),
                cross2 = Util.Math.cross(vec0, vec2);

            if(!cross1 || !cross2 || cross1 >>> 31 ^ cross2 >>> 31){
                vec0 = Util.Math.vector(line2[0], line2[1]);
                vec1 = Util.Math.vector(line2[0], line1[0]);
                vec2 = Util.Math.vector(line2[0], line1[1]);
                cross1 = Util.Math.cross(vec0, vec1);
                cross2 = Util.Math.cross(vec0, vec2);

                if(!cross1 || !cross2 || cross1 >>> 31 ^ cross2 >>> 31)
                    return true;
                else
                    return false;

            }else
                return false;
        },
        getCrossPoint = function(line1, line2){
            let
                base = Util.Math.vector(line2[0], line2[1]),
                d1 = Math.abs(Util.Math.cross(base, Util.Math.vector(line2[0], line1[0]))),
                d2 = Math.abs(Util.Math.cross(base, Util.Math.vector(line2[0], line1[1]))),
                t = d1 / (d1 + d2),
                temp = Util.Math.multiply(Util.Math.vector(line1[0], line1[1]), t);
            return Util.Math.add(line1[0], temp);
        },
        centerRect = function (rect) {
            return [rect.x + rect.w / 2, rect.y + rect.h / 2];
        },
        lineCrossLines = function (line, lines) {
            return lines.findIndex(l => isCrossLine(l, line));
        };

    const
        inter = new EaseCubicInterpolator({x1: .46, x2: .01, y1: .39, y2: .81});


    return Animation.create({
        constructor(opt){
            this.opt = Object.assign({
                x : 0,
                y : 0,
                w : 300,
                h : 200,
                boundSize : 30,
                pointX : 0,
                pointY : 0
            }, opt);

            this._init();
            this.reRender();
        },
        // notify : {
        //     mousemove(event){
        //         this.setPoint([event.offsetX, event.offsetY], true);
        //     },
        //     mousedown(event){
        //         this.moveTo([event.offsetX, event.offsetY]);
        //     }
        // },
        methods : {
            _init(){
                // 初始化buffer
                this.buffer = new Buffer(this.opt.w, this.opt.h);
                this.buffer.context.lineWidth = .5;

                // 初始化队列
                this.queue = Queue.create(this.opt);

                // 初始化dock点
                this.docks = [
                    [0, 0],
                    [this.opt.w / 2, 0],
                    [this.opt.w, 0],
                    [this.opt.w, this.opt.h / 2],
                    [this.opt.w, this.opt.h],
                    [this.opt.w / 2, this.opt.h],
                    [0, this.opt.h],
                    [0, this.opt.h / 2]
                ];
            },
            _recalc(){
                let
                    rect = {x : this.opt.x + this.opt.boundSize, y : this.opt.y + this.opt.boundSize,
                        w : this.opt.w - this.opt.boundSize * 2, h : this.opt.h - this.opt.boundSize * 2},
                    bountSize = this.opt.boundSize,
                    boundRect = {x : this.opt.x, y : this.opt.y, w : this.opt.w, h : this.opt.h},
                    rectQuadLength = Math.sqrt(Math.pow(boundRect.w, 2) + Math.pow(boundRect.h, 2)) / 2,  //  矩形弦长的一半
                    rectCenter = centerRect(rect),
                    rectLines = [
                        [[rect.x, rect.y], [rect.x + rect.w, rect.y]],
                        [[rect.x + rect.w, rect.y], [rect.x + rect.w, rect.y + rect.h]],
                        [[rect.x + rect.w, rect.y + rect.h], [rect.x, rect.y + rect.h]],
                        [[rect.x, rect.y + rect.h], [rect.x, rect.y]]
                    ],
                    boundRectLines = [
                        [[boundRect.x, boundRect.y], [boundRect.x + boundRect.w, boundRect.y]],
                        [[boundRect.x + boundRect.w, boundRect.y], [boundRect.x + boundRect.w, boundRect.y + boundRect.h]],
                        [[boundRect.x + boundRect.w, boundRect.y + boundRect.h], [boundRect.x, boundRect.y + boundRect.h]],
                        [[boundRect.x, boundRect.y + boundRect.h], [boundRect.x, boundRect.y]]
                    ],
                    point = [this.opt.pointX, this.opt.pointY],
                    pointLine = [point, rectCenter],
                    crossIndex, crossBoundIndex, boundPoint,
                    dis, angle, line1, line2,
                    line1CrossInnerRectIndex, line2CrossInnerRectIndex,
                    line1CrossInnerRectPoint, line2CrossInnerRectPoint,
                    drawPoints = [];

                // 实际计算
                crossIndex = lineCrossLines(pointLine, rectLines);
                crossBoundIndex = lineCrossLines(pointLine, boundRectLines);
                if(crossIndex == -1){
                    drawPoints.push(
                        [rect.x, rect.y],
                        [rect.x + rect.w, rect.y],
                        [rect.x + rect.w, rect.y + rect.h],
                        [rect.x, rect.y + rect.h]
                    );
                }else{
                    if(crossBoundIndex != -1)
                        boundPoint = getCrossPoint(pointLine, boundRectLines[crossBoundIndex]);
                    else
                        boundPoint = point;

                    dis = Util.Math.distance(boundPoint, rectCenter);
                    angle = (bountSize / 2) * (2 - dis / rectQuadLength);   // 要根据 boundPoint 与外矩形中心的距离 与 外矩形的弦长一半的比值决定夹角的大小,这样可以在一定程度上稳定小尖的大小
                    line1 = [boundPoint, Util.Math.add(Util.Math.multiply(Util.Math.roate(Util.Math.normalize(Util.Math.vector(boundPoint, rectCenter)), angle), dis), boundPoint)];
                    line2 = [boundPoint, Util.Math.add(Util.Math.multiply(Util.Math.roate(Util.Math.normalize(Util.Math.vector(boundPoint, rectCenter)), - angle), dis), boundPoint)];
                    line1CrossInnerRectIndex = lineCrossLines(line1, rectLines);
                    line2CrossInnerRectIndex = lineCrossLines(line2, rectLines);
                    line1CrossInnerRectPoint = getCrossPoint(line1, rectLines[line1CrossInnerRectIndex]);
                    line2CrossInnerRectPoint = getCrossPoint(line2, rectLines[line2CrossInnerRectIndex]);

                    drawPoints.push(line2CrossInnerRectPoint);
                    for(let i = line2CrossInnerRectIndex; i < line2CrossInnerRectIndex + 4; i++){
                        let nidx = i % 4;
                        if(i == line2CrossInnerRectIndex + 3){
                            if(nidx == line1CrossInnerRectIndex){
                                drawPoints.push(line1CrossInnerRectPoint);
                            }else{
                                drawPoints.push(rectLines[nidx][1]);
                                drawPoints.push(line1CrossInnerRectPoint);
                            }
                        }else{
                            drawPoints.push(rectLines[nidx][1]);
                        }
                    }
                    drawPoints.push(boundPoint);
                }

                this.drawPoints = drawPoints.map(p => Util.Math.dec(p, [this.opt.x, this.opt.y]));
            },
            _render(){
                const
                    {canvas : cvs, context : ctx} = this.buffer;


                ctx.clearRect(0, 0, cvs.width, cvs.height);

                ctx.strokeStyle = '#000000';
                ctx.fillStyle = '#fff8';
                ctx.beginPath();
                this.drawPoints.forEach((point, index) => {
                    ctx[index == 0 ? 'moveTo' : 'lineTo'](point[0], point[1]);
                });
                ctx.closePath();
                ctx.fill();
                ctx.stroke();
            },
            setPoint(point, redraw = false){
                this.opt.pointX = point[0];
                this.opt.pointY = point[1];

                if(redraw){
                    this._recalc();
                    this._render();
                }
            },
            reRender(){
                this._recalc();
                this._render();
            },
            moveTo(pos, point){
                const
                    that = this;
                this.queue.stop().part([{
                    prop : {
                        x : {e : pos[0]},
                        y : {e : pos[1]},
                        pointX : {e : point[0]},
                        pointY : {e : point[1]}
                    },
                    duration : 1000,
                    interpolator : inter,
                    process : function(ep){
                        that.reRender();
                    }
                }]).replay();
            },
            nearest(point){
                const offset = [this.opt.x, this.opt.y];
                return _.minBy(this.docks, p => {
                    return Util.Math.distance(point, Util.Math.add(p, offset));
                });
            }
        },
        render(passed, elapsed, ctx, cvs, ret) {
            // ctx.globalCompositeOperation = 'lighter';
            ctx.drawImage(this.buffer.canvas, this.opt.x ,this.opt.y);
        }
    });
}());