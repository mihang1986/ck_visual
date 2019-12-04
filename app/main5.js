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
    Queue = require('./surface/queue/queue');



const
    mainSurface = new Surface({full : true, fps : true, bgImg : "./res/0593675dcb40c00821501cfa72881258.jpeg", limit :60}).appendTo(document.body).run(),
    point = new Point({x : 500, y : 300, r : 50, inner : .1}).appendTo(mainSurface),
    inter = new EaseCubicInterpolator({x1: .28, x2: .11, y1: .2, y2: .87});


const
    q = new Queue(point.opt, {
        prop : {
            x : {e : 100},
            y : {e : 100}
        },
        duration : 2000,
        interpolator : inter,
        callback : _ => console.log('finish one')
    },{
        prop : {
            x : {e : 400}
        },
        duration : 3000,
        interpolator : inter,
        callback : _ => console.log('finish two')
    },{
        prop : {
            y : {e : 400}
        },
        duration : 2000,
        interpolator : inter,
        callback : _ => console.log('finish three')
    },{
        prop : {
            x : {e : 200},
            y : {e : 200}
        },
        duration : 2000,
        interpolator : inter,
        callback : function () {
            this.replay();
        }
    });



