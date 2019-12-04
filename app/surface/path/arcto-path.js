const Path = require('./path'),
    ComboPath = require('./combo-path'),
    Point = require('../shape/point'),
    LinePath = require('./line-path'),
    ArcPath = require('./arc-path');

module.exports = (function () {
    return Path.create({
        options : {
            x1 : 100,
            y1 : 10,
            x2 : 200,
            y2 : 40,
            x3 : 200,
            y3 : 140,
            radius : 30
        },
        init : function(){
            this.cp = new ComboPath();

            let p0 = new Point({x : this.x1, y: this.y1}),
                p1 = new Point({x : this.x2, y: this.y2}),
                p2 = new Point({x : this.x3, y: this.y3}),
                radius = this.radius,
                dir = (p2.x - p1.x) * (p0.y - p1.y) + (p2.y - p1.y) * (p1.x - p0.x);

            // 检测参数是否重复
            if (p0.equalsTo(p1) || p1.equalsTo(p2) ||  radius == 0 || dir == 0) {
                this.cp.addPath(new LinePath({
                    x0 : p0.x,
                    y0 : p0.y,
                    x1 : p1.x,
                    y1 : p1.y
                }));
                return;
            }

            // 这段算法没明白,反正照着写就是了
            let a2 = (p0.x - p1.x) * (p0.x - p1.x) + (p0.y - p1.y) * (p0.y - p1.y),
                b2 = (p1.x - p2.x) * (p1.x - p2.x) + (p1.y - p2.y) * (p1.y - p2.y),
                c2 = (p0.x - p2.x) * (p0.x - p2.x) + (p0.y - p2.y) * (p0.y - p2.y),
                cosx = (a2 + b2 - c2) / (2 * Math.sqrt(a2 * b2)),
                sinx = Math.sqrt(1 - cosx * cosx),
                d = radius / ((1 - cosx) / sinx),
                anx = (p1.x - p0.x) / Math.sqrt(a2),
                any = (p1.y - p0.y) / Math.sqrt(a2),    // 此处应该为向量标准化
                bnx = (p1.x - p2.x) / Math.sqrt(b2),
                bny = (p1.y - p2.y) / Math.sqrt(b2),
                x3 = p1.x - anx * d,
                y3 = p1.y - any * d,
                x4 = p1.x - bnx * d,
                y4 = p1.y - bny * d,
                anticlockwise = (dir < 0),
                cx = x3 + any * radius * (anticlockwise ? 1 : -1),
                cy = y3 - anx * radius * (anticlockwise ? 1 : -1),
                angle0 = Math.atan2((y3 - cy), (x3 - cx)),
                angle1 = Math.atan2((y4 - cy), (x4 - cx));

            this.cp.addPath(new LinePath({
                x0 : p0.x,
                y0 : p0.y,
                x1 : x3,
                y1 : y3
            })).addPath(new ArcPath({
                x : cx,
                y : cy,
                r : radius,
                sAngle : angle0,
                eAngle : angle1,
                clockwise : anticlockwise,
                inversion : false
            }));
        },
        resolve : function (percent) {
            return this.cp.resolve(percent);
        },
        length : function () {
            return this.cp.length();
        }
    });
}());
