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

    var _amiObj = function (opt) {
        this.actions = [];
        this.subObjs = (opt && opt.subObjs) || [];
    };

    _amiObj.prototype = {
        _action : function (type, duration, opt, callback) {
            this.actions.push({
                type : type,
                elapsed : 0,
                duration : duration,
                callback : callback,
                opt : opt
            });
        },
        addSubObject : function (subObj, level) {
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
        surface : function () {
            return this.__surface || null;
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