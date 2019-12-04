require("./main.scss");

let RectPath = require('./surface/path/rect-path'),
    LinePath = require('./surface/path/line-path'),
    ArcPath = require('./surface/path/arc-path');



let rPath = new RectPath({x : 100, y: 100, w : 100, h : 100});
console.log(rPath.length());

let lPath = new LinePath({x0 : 0, y0 : 0, x1 : 100, y1 : 100});
console.log(lPath.length());

let aPath = new ArcPath({ x : 0, y : 0, r : 10, sAngle : 0, eAngle : Math.PI});
console.log(aPath.length());

