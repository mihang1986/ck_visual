const Utils = require("./utils"),
    _ = require('lodash');

// 动画类
module.exports = (function () {
    var wraperUpdate = function (updateFun) {
        return function () {
            var _args = [].slice.call(arguments, 0);

            // 计算所有action
            for(var i=0; i<this.actions.length; i++){
                var action = this.actions[i];

                action.elapsed += _args[0];

                var percent = Math.min(action.elapsed / action.duration, 1),
                    act = this.action && this.action[action.type];
                act ? act.call(this, percent, action.opt) : null;

                if(action.elapsed >= action.duration){
                    action.callback ? action.callback.call(this) : null;
                    this.actions.splice(i, 1);
                    i--;
                }
            }

            return updateFun ? updateFun.apply(this, _args) : null;
        }
    };

    var watchData = function (obj, path) {
        var ret = {};

        if(!_.isPlainObject(obj) && !_.isArray(obj)){
            return obj;
        }

       Object.keys(obj).forEach(function (key) {
           var _path = function(){
                   var x = (path || []).slice(0);
                   x.push(key);
                   return x;
               }(),
               _value = obj[key], _path;

           Object.defineProperty(ret, key, {
               set : function (val) {
                   //console.log(`set, path : ${_path.join('.')}, val : ${val}`);
                   _value = watchData(val);
               },
               get : function () {
                   //console.log(`get, path : ${_path.join('.')}, val : ${_value}`);
                   return _value;
               }
           });

           if(_.isPlainObject(obj[key])){
               _value = watchData(_value, _path);
           }else if(_.isArray(obj[key])){
                _value = new Utils.WatchArray(function (type, obj) {
                    var _p = function(){
                        var x = (_path || []).slice(0);
                        x.push("[]");
                        return x;
                    }();

                    console.log(`array opt : ${type}, args : ${[].slice.call(arguments, 1)}`);
                    if(type == "push" || type == "unshift"){
                        Array.prototype[type].call(this, watchData(obj, _p));
                        return false;
                    }
                });
                obj[key].forEach(function (val) {
                    _value.push(val);
                });
           }
       });

       return ret;
    };

    var _amiObj = function (opt) {
        this.actions = [];
        this.subObjs = (opt && opt.subObjs) || [];

        if(opt && opt.data)
             this.bindData(opt.data);
    };

    _amiObj.prototype = {
        _action(type, duration, opt, callback) {
            this.actions.push({
                type : type,
                elapsed : 0,
                duration : duration,
                callback : callback,
                opt : opt
            });
        },
        addSubObject(subObj, level) {
            if(!(subObj instanceof  _amiObj))
                throw "必须添加Animation对象";

            var o = {
                parent : this,
                elapsed : 0,
                level : level == undefined ? 0 : level,
                obj : subObj
            }, idx = -1;

            for(var i=0; i<this.subObjs.length; i++){
                if(o.level < this.subObjs[i].level){
                    idx = i;
                    break;
                }
            }

            this.subObjs.splice(idx == -1 ? this.subObjs.length : idx, 0, o);

            return this;
        },
        surface() {
            return this.__surface || null;
        },
        bindData(data){
            this.data = watchData(data);
        },
        fire(event, args){
            var _event = this.events[event];
            if(_event && _event instanceof Function){
                _event.call(this, args);
            }
        },
        trigger(type, event){
            this.notify && this.notify[type] && this.notify[type].call(this, event);
        }
    };

    return {
        create : function (opt) {

            var _clazz =  function (ops) {
                _amiObj.call(this, ops);
                opt.constructor ? opt.constructor.call(this, ops) : null;
            };

            _clazz.prototype = new _amiObj(opt);  // 为了让该类有父类的方法,其子属性会被构造函数所覆盖
            _clazz.prototype.update = wraperUpdate(opt.update);
            _clazz.prototype.action = opt.action || null;
            _clazz.prototype.events = opt.events || null;
            _clazz.prototype.render = opt.render || null;
            _clazz.prototype.notify = opt.notify || null;

            if(opt.methods){
                for(var method in opt.methods){
                    _clazz.prototype[method] = opt.methods[method];
                }
            }

            return _clazz;
        }
    };
}());