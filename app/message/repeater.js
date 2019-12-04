const
    _ = require('lodash');

const
    SUCCESS = 'success',
    FAILED = 'failed';

module.exports = (function () {

    const
        bindWsEvent = function (ctx) {
            ['open', 'message', 'error', 'close'].forEach(event => {
                ctx.ws.addEventListener(event, function (e) {
                    const cap = _.capitalize(event);

                    if(ctx['ws' + cap])
                        ctx['ws' + cap].call(ctx, e);

                    if(ctx.events[event])
                        ctx.events[event].call(ctx, e);
                });
            });
        };

    class Repeater{
        constructor(url){
            this.url = url;
            this.ws = new WebSocket(url);
            this.events = {};
            this.els = {};

            bindWsEvent(this);
        }

        wsMessage(event){
            const
                data = JSON.parse(event.data);

            if(data.code == SUCCESS){
                if(this.els[data.response]){
                    this.els[data.response].forEach(function (v) {
                        v.callback ? v.callback(data.data) :
                            v.component[v.method].call(v.component, data.data);
                    });
                }
            }else{
                console.log(`发生错误:${data.message}`);
            }
        }

        on(type, callback){
            this.events[type] = callback;
            return this;
        }

        reg(type, component, method){
            if(!this.els[type]) this.els[type] = [];
            this.els[type].push(method ? {
                'component' : component,
                'method' : method
            } : {
                'callback' : component
            });

            return this;
        }
    }

    return Repeater;
}());