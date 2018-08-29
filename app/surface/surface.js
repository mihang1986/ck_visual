const FramePerSecond = require("./component/frame-per-second"),
    BackGround = require("./component/back-ground");

// 画板
module.exports = (function () {
    var adjustCanvas = function (surface) {
        return function () {
            var parent = surface.surface.parentNode;
            surface.surface.width = parent.offsetWidth;
            surface.surface.height = parent.offsetHeight;
            surface.width = surface.surface.width;
            surface.height = surface.surface.height;
        };
    };

    var _surface = function (opts) {
        this.width = opts.width || 100;
        this.height = opts.height || 100;
        this.limitInterval = 0;
        this.limit = opts.limit || 0;
        this.objects = [];
        this.elapsed = 0;   // 画布总渲染时间
        this.frame = 0;     // 渲染总帧数
        this.surface = document.createElement("canvas");
        this.surface.width = this.width;
        this.surface.height = this.height;
        this.context = this.surface.getContext("2d");

        // 事件
        var that = this,
            attachEvent = function (type) {
                that.surface.addEventListener(type, function (event) {
                    that.objects.forEach(function (p1, p2, p3) {
                        p1.obj.notify && p1.obj.notify[type] && p1.obj.notify[type].call(p1.obj, event);
                    });
                });
            };

        [
            "mousewheel",
            "mousedown",
            "mouseup",
            "mousemove"
        ].forEach(function (eventName) {
            attachEvent(eventName);
        });



        // 初始化
        if(opts.fps) this.pushObject(new FramePerSecond({showFrame : true, showElapsed : true}), _surface.LEVEL.TOP);
        if(opts.bgColor) this.pushObject(new BackGround({color : opts.bgColor}), _surface.LEVEL.BACK);
        if(opts.bgImg) this.pushObject(new BackGround({image : opts.bgImg, scale : opts.scale}),  _surface.LEVEL.BACK);
        if(opts.full){
            var resizeFun = adjustCanvas(this);
            window.addEventListener("load", function () {resizeFun()});
            window.addEventListener("resize", function () {resizeFun()});
        };
    };

    _surface.LEVEL = {
        TOP : 999,
        HIGHER :100,
        NORMAL : 0,
        LOWER : -100,
        BACK : -999
    };

    _surface.prototype = {
        getContext : function(){
            return this.context;
        },
        appendTo : function (elem) {
            elem.appendChild && elem.appendChild(this.surface);
            return this;
        },
        pushObject : function (amiObj, level) {
            amiObj.__surface = this;

            var o = {
                level : level == undefined ?  _surface.LEVEL.NORMAL : level,
                obj : amiObj,
                elapsed : 0 // 动画运行时间
            }, idx = -1;

            for(var i=0; i<this.objects.length; i++){
                if(o.level < this.objects[i].level){
                    idx = i;
                    break;
                }
            }

            this.objects.splice(idx == -1 ? this.objects.length : idx, 0, o);

            return this;
        },
        run : function () {
            var last, frameLast, that = this,
                _drawObj = function _d(amiobj, elapsed, parent, pret){
                    var drawMaster = false;

                    amiobj.elapsed += elapsed;

                    var ret = amiobj.obj.update ? amiobj.obj.update(elapsed, amiobj.elapsed, that.context, that.surface, pret, parent && parent.obj) : null;

                    // 如果没有子对象,那么直接绘制子对象
                    if(!amiobj.obj.subObjs.length){
                        that.context.save();
                        amiobj.obj.render ? amiobj.obj.render(elapsed, amiobj.elapsed, that.context, that.surface, ret, pret, parent && parent.obj) : null;
                        that.context.restore();
                    }else{
                        // 循环绘制子对象
                        amiobj.obj.subObjs.forEach(function (sub) {
                            // 如果没有绘制主对象,并且符合绘制时机,这里子对象的层级要依赖父对象的层级也就是父对象的相对层级
                            if(!drawMaster && amiobj.level < (sub.level + amiobj.level)){
                                that.context.save();
                                amiobj.obj.render ? amiobj.obj.render(elapsed, amiobj.elapsed, that.context, that.surface, ret, pret, parent && parent.obj) : null;
                                that.context.restore();
                                drawMaster = true;
                            }

                            _d(sub, elapsed, amiobj, ret);
                        });

                        if(!drawMaster){
                            that.context.save();
                            amiobj.obj.render ? amiobj.obj.render(elapsed, amiobj.elapsed, that.context, that.surface, ret, pret, parent && parent.obj) : null;
                            that.context.restore();
                            drawMaster = true;
                        }
                    }
                },
                _draw = function () {
                    var now = new Date();

                    // 判断是否跳帧
                    if(that.limit){
                        var frameElapsed = frameLast ? now.getTime() - frameLast.getTime() : 0;
                        frameLast = now;
                        that.limitInterval += frameElapsed;
                        // 先根据限制计算出绘制每帧所需要的时间,然后每次判断本次绘制是否大于限制时间
                        // 如果小于,则跳过本次绘制,继续执行下次绘制,否则重置帧计时执行绘制
                        // 这里要注意,因为系统时间并不是精确的,所以帧计时一定要保留余数后在参与下次计算
                        if(that.limitInterval <= (1000 / that.limit)){
                            requestAnimationFrame(_draw);
                            return;
                        }else{
                            that.limitInterval %= (1000 / that.limit);
                        }
                    }

                    // 绘制帧前置动作
                    var elapsed = last ? now.getTime() - last.getTime() : 0;
                    last = now;
                    that.elapsed += elapsed;
                    that.frame++;
                    that.context.clearRect(0, 0, that.surface.width, that.surface.height);

                    // 循环绘制obj
                    that.objects.forEach(function (obj) {
                        _drawObj(obj, elapsed);
                    });

                    requestAnimationFrame(_draw);
                }

            _draw();

            return this;
        }
    };

    return _surface;
}());