const Animation = require('../animation'),
    ScrollBar = require('./scroll-bar'),
    Surface = require('../surface'),
    Utils = require('../utils');

module.exports = (function () {

    var getAbsoluteLocation = function(elem) {
        if (arguments.length != 1 || elem == null)
            return null;

        var offsetTop = elem.offsetTop;
        var offsetLeft = elem.offsetLeft;
        var offsetWidth = elem.offsetWidth;
        var offsetHeight = elem.offsetHeight;

        while (elem = elem.offsetParent) {
            offsetTop += elem.offsetTop;
            offsetLeft += elem.offsetLeft;
        }
        return {
            x: offsetTop, y: offsetLeft,
            w: offsetWidth, h: offsetHeight
        };
    },
    _assistInput = (function () {
        var ai = document.createElement("input");
        ai.type = "text";
        //ai.style = "position: absolute;transform: scale(0);";
        ai.style = "position: absolute;z-index: 0;transform: scale(0);";
        ai.addEventListener("input", function (event) {
            if(_currentTextInput){
                _currentTextInput._prop.value = this.value;
                _currentTextInput._adjust();
                _currentTextInput._loadCursor();
                _currentTextInput._resetSelect();
            };
        });


        ai.addEventListener("keydown", function (event) {
            if(event.keyCode === 9){
                console.log(_getNextInput());

                event.stopPropagation();
                event.preventDefault();
            }
        });

        ai.addEventListener("keyup", function (event) {
            if(event.keyCode >= 35 || event.keyCode <= 40){
                if(_currentTextInput)
                    _currentTextInput._loadCursor();
            }
        });

        ai.addEventListener("blur", function (event) {
            if(_currentTextInput)
                _currentTextInput._stat.focus = false;
        });

        document.body.appendChild(ai);
        return ai;
    }()),
    _rejectAssistInput = function(x, y, w, v){
        _assistInput.style.left = x + "px";
        _assistInput.style.top = y + "px";
        _assistInput.style.width = w + "px";
        _assistInput.value = v;
        _assistInput.focus();
    },
    _offScreenCvs = document.createElement("canvas"),
    _offScreenCxt = _offScreenCvs.getContext("2d"),
    _currentTextInput  = null,
    _speculateCharPos = function (str, font, fontSize, width) { // 判断字符串中刚好大于width的位置
        var tl = 0, tc = 0;
        _offScreenCxt.font = fontSize + "px " +  font;

        if(width < 0) return 0;
        if(_offScreenCxt.measureText(str).width < width) return 0;

        for(let c of str){
            tl += _offScreenCxt.measureText(c).width;
            tc++;
            if(tl > width) break;
        }
        return tc;
    },
    _speculateNearlyCharPos = function (str, font, fontSize, width) { // 判断字符串中刚好大于width的位置
        var tw = 0, tc = 0, cw = 0;
        _offScreenCxt.font = fontSize + "px " +  font;

        if(_offScreenCxt.measureText(str).width < width) return str.length;

        for(let c of str){
            cw = _offScreenCxt.measureText(c).width; tc++;

            if(tw + cw < width){
                tw += cw;
            }else{
                if(tw + cw / 2 > width){
                    return --tc;
                }else{
                    return tc;
                }
            }
        }

    },
    _parseCharPosToPixel = function (str, font, fontSize, pos) {
        str = str.substr(0, pos);
        _offScreenCxt.font = fontSize + "px " +  font;

        return _offScreenCxt.measureText(str).width;
    },
    _textInputs = [],
    _getNextInput = function () {
        var idx = 0;
        for(;idx<_textInputs.length; idx++){
            if(_textInputs[idx] === _currentTextInput)
                break;
        }

        return _textInputs[++idx % _textInputs.length];
    },
    _dragInfo = {drag : false, start : 0},
    _textWidth = function (str, font, fontSize) {
        if(!str) return 0;
        _offScreenCxt.font = fontSize + "px " +  font;
        return _offScreenCxt.measureText(str).width;
    };


    return Animation.create({
        constructor : function (opt) {
            this.opt = Utils.extends({
                x : 0,
                y : 0,
                w : 200,
                textColor : "#000",
                font : "宋体",
                fontSize : 14,
                placeholder : "请输入文字...",
                placeholderColor : "#fff8c1",
                padding : 5,
                value : "",
                lineColor : "#fff8c1",
                focusLineColor : "#ff776f",
                selectColor : "#815ff0"
            },  opt);

            this._prop = {};
            this._stat = {};    // 状态变量
            this._biv = {};     // 中间变量
            this._calc = {};    // 计算变量

            this._init();
            this._adjust();
            _textInputs.push(this);
        },
        render : function (passed, elapsed, ctx, cvs, ret, pret, parent) {
            // 绘制背景
            ctx.globalAlpha = this._biv.lineBiv * .1 + .05;
            ctx.fillStyle = this.opt.focusLineColor;
            ctx.beginPath();
            ctx.rect(this.opt.x, this.opt.y, this.opt.w, this._calc.height);
            ctx.fill();

            // 绘制选中
            if(this._prop.selectStart != this._prop.selectEnd && this._stat.focus){
                var _y = this.opt.y + ((this._calc.height - this.opt.fontSize) / 2);
                ctx.globalAlpha = this._biv.lineBiv * .3 + .05;
                ctx.fillStyle = this.opt.selectColor;
                ctx.beginPath();
                ctx.rect(this._calc.selectRange.x, _y, this._calc.selectRange.w, this.opt.fontSize);
                ctx.fill();
            }

            // 绘制底线
            ctx.globalAlpha = 1;
            ctx.strokeStyle = Utils.color.excessive(this._calc.lineColor, this._calc.focusLineColor, this._biv.lineBiv);
            ctx.beginPath();
            ctx.moveTo(this.opt.x, this.opt.y + this._calc.height - .5);
            ctx.lineTo(this.opt.x + this.opt.w, this.opt.y + this._calc.height - .5);
            ctx.stroke();

            // 绘制文字
            ctx.textAlign = "start";
            ctx.textBaseline = "middle";
            ctx.font = this.opt.fontSize + "px " + this.opt.font;

            if(this._prop.value !== ""){
                ctx.fillStyle = this.opt.textColor;
                ctx.fillText(this._prop.value.substr(this._calc.hiddenChars), this.opt.x + this.opt.padding, this.opt.y + this._calc.height / 2);
            }else{
                ctx.fillStyle = this.opt.placeholderColor;
                ctx.fillText(this.opt.placeholder, this.opt.x + this.opt.padding, this.opt.y + this._calc.height / 2);
            }


            // 绘制光标
            if(this._stat.focus){
                var _cx = this.opt.x + this.opt.padding + this._calc.operator.pos,
                    _cy = this.opt.y  + (this._calc.height - this.opt.fontSize) / 2,
                    _alpha = parseInt(this._calc.operator.alpha * 100) / 100;

                ctx.globalAlpha = _alpha;
                ctx.strokeStyle = this.opt.textColor;
                ctx.beginPath();
                ctx.moveTo(_cx + .5, _cy);
                ctx.lineTo(_cx + .5, _cy + this.opt.fontSize);
                ctx.stroke();
            }
        },
        update(passed, elapsed, ctx, cvs){
            this._calc.operator.timer.pass(passed);
        },
        methods : {
            _init : function () {
                var that = this;

                // 设置属性变量
                this._prop.value = this.opt.value;
                this._prop.selectStart = 0;
                this._prop.selectEnd = 0;

                // 设置状态变量
                this._stat.focus = false;
                this._stat.over = false;

                // 设置中间变量
                this._biv.lineBiv = 0;

                // 设置计算变量
                this._calc.height = this.opt.h || this.opt.fontSize;
                this._calc.lineColor = Utils.color.parseColorToRGB(this.opt.lineColor);
                this._calc.focusLineColor = Utils.color.parseColorToRGB(this.opt.focusLineColor);
                this._calc.hiddenChars = 0;
                this._calc.selectRange = {x : 0, w : 0};
                this._calc.operator = {
                    pos : 0,
                    alpha :0,
                    step : .1,
                    timer : new Utils.timer(25, function () {
                        if(that._calc.operator.alpha >= 1)
                            that._calc.operator.step = -.1;

                        if(that._calc.operator.alpha <=0)
                            that._calc.operator.step = 0.1;

                        that._calc.operator.alpha += that._calc.operator.step;

                        that._calc.operator.alpha = Math.max(that._calc.operator.alpha, 0);
                    })
                };
            },
            _focus : function (event) {
                this._action("line", 300, {focus : true});

                _rejectAssistInput(this._calc.toggle.x, this._calc.toggle.y,
                    this.opt.w, this._prop.value);

                _currentTextInput = this;
                _currentTextInput._calc.operator.alpha = 0;

                _assistInput.focus();
            },
            _resetSelect : function(){
                this._prop.selectStart = 0;
                this._prop.selectEnd = 0;
            },
            _blur : function (event) {
                this._action("line", 300, {focus : false});

                if(_currentTextInput == this){
                    _currentTextInput._prop.value = _assistInput.value;
                    _assistInput.blur();
                    this._resetSelect();
                }
            },
            _over : function(){
                this.surface.surface.style.cursor = "text";
            },
            _out : function(){
                this.surface.surface.style.cursor = "default";
            },
            _select : function(start, end){
                this._prop.selectStart = start;
                this._prop.selectEnd = end;
                var bound = [start, end].sort(function (v1, v2) {
                       return v1 - v2;
                    }),
                    val = this._prop.value.substr(this._calc.hiddenChars),
                    x = this.opt.x + this.opt.padding + _textWidth(val.substr(0, bound[0]), this.opt.font, this.opt.fontSize),
                    w = _textWidth(val.substr(bound[0], bound[1] - bound[0]));

                this._calc.selectRange = {x : x, w : w};
                this._setCursor(bound[0], bound[1]);
            },
            _adjust : function () {
                _offScreenCxt.font = this.opt.fontSize + "px " + this.opt.font;
                var str = this._prop.value,
                    sw = _offScreenCxt.measureText(str).width,
                    tw = this.opt.w - this.opt.padding * 2,
                    hc = _speculateCharPos(str, this.opt.font, this.opt.fontSize, sw - tw);
                this._calc.hiddenChars = hc;
            },
            _loadCursor : function(){
                var pos = _parseCharPosToPixel(this._prop.value, this.opt.font, this.opt.fontSize,
                    _assistInput.selectionEnd - this._calc.hiddenChars);
                this._calc.operator.pos = pos;
            },
            _setCursor : function (start, end) {
                end = end || start;
                _assistInput.selectionStart = start + this._calc.hiddenChars;
                _assistInput.selectionEnd = end+ this._calc.hiddenChars;
                this._loadCursor();
            }
        },
        notify : {
            mousedown : function(event){
                var inRange = Utils.physics.ptInRect(event.offsetX, event.offsetY, this.opt.x, this.opt.y, this.opt.w, this.opt.h);
                if(this._stat.focus != inRange){
                    this._stat.focus = inRange;
                    this._stat.focus ? this._focus(event) : this._blur(event);
                }

                if(inRange){
                    // 设置光标位置
                    var pos = Math.min(Math.max(event.offsetX - this.opt.x - this.opt.padding, 0), this.opt.w - this.opt.padding * 2),
                        cat = _speculateNearlyCharPos(this._prop.value, this.opt.font, this.opt.fontSize, pos);
                    this._setCursor(cat);

                    // 设置拖动
                    _dragInfo.start = event.offsetX;
                    _dragInfo.drag = true;
                }

                event.stopPropagation();
                event.preventDefault();
            },
            mousemove : function(event){
                var inRange = Utils.physics.ptInRect(event.offsetX, event.offsetY, this.opt.x, this.opt.y, this.opt.w, this.opt.h);
                if(inRange != this._stat.over){
                    this._stat.over = inRange;
                    this._stat.over ? this._over() : this._out();
                }

                if(_dragInfo.drag && _currentTextInput === this){     // 处理选择
                    var spos = Math.min(Math.max(_dragInfo.start - this.opt.x - this.opt.padding, 0), this.opt.w - this.opt.padding * 2),
                        scat = _speculateNearlyCharPos(this._prop.value, this.opt.font, this.opt.fontSize, spos),
                        epos = Math.min(Math.max(event.offsetX - this.opt.x - this.opt.padding, 0), this.opt.w - this.opt.padding * 2),
                        ecat = _speculateNearlyCharPos(this._prop.value, this.opt.font, this.opt.fontSize, epos);

                    this._select(scat, ecat);
                }
            },
            mouseup : function(event){
                _dragInfo.drag = false;
            },
            parentresize : function (event) {
                // var _bound = getAbsoluteLocation(event.surface.surface);
            },
            resource : function (event) {
                var _bound = getAbsoluteLocation(event.surface.surface);
                this._calc.toggle = {x : _bound.x + this.opt.x, y : _bound.y + this.opt.y + this._calc.height};
                this.surface = event.surface;
            }
        },
        action : {
            "line" : function (percent, opt) {
                if(opt.focus)
                    this._biv.lineBiv = percent;
                else
                    this._biv.lineBiv = 1 - percent;
            }
        }
    });
}());