const
    Utils = require('../utils');

module.exports = (function () {
    let
        wrapedQueueMap = [], timeOut = null,
        lastTime, nowTime, telapsed, elapsed,
        remove = function (queue, forceEnd) {
            for(let i = 0; i < wrapedQueueMap.length; i++)
                if(wrapedQueueMap[i].srcQueue === queue){
                    if(forceEnd) quickPlayWrapedQueue(wrapedQueueMap[i]);
                    wrapedQueueMap.splice(i, 1);
                    break;
                }
        },
        resetWrapQueuePlayStatus = function(wrapedQueue, timeElapsed = 0){
            wrapedQueue.playIndex = 0;
            wrapedQueue.timeElapsed = timeElapsed;
            wrapedQueue.playParts.forEach(pp => pp.played = false);
            wrapedQueue.playedCount += 1;
        },
        quickPlayWrapedQueue = function(wrapedQueue){       // 快速执行完成动画,执行所有未执行的part中的end,以及调用callback
            for(let i = wrapedQueue.playIndex; i < wrapedQueue.playParts.length; i++)
                if(!wrapedQueue.playParts[i].played)
                    playWrapedQueuePartEnd.call(wrapedQueue.srcQueue, wrapedQueue.obj, wrapedQueue.playParts[i]);
        },
        playWrapedQueuePart = function(obj, wrapedPart, elapsed){
            const
                percent = wrapedPart.interpolator ?
                    wrapedPart.interpolator.resolve(elapsed / wrapedPart.duration) : elapsed / wrapedPart.duration;

            if(wrapedPart.prop)
                Object.entries(wrapedPart.prop).forEach(([k, {s, e, p}]) => {
                    const
                        val = Utils.Math.mix(s, e, percent);
                    obj[k] = p ? p(val) : val;
                });

            if(wrapedPart.process)
                wrapedPart.process.call(this, percent);
        },
        playWrapedQueuePartEnd = function(obj, wrapedPart){
            wrapedPart.played = true;

            if(wrapedPart.end)
                Object.entries(wrapedPart.end).forEach(([k, v]) => {
                    obj[k] = v;
                });

            if(wrapedPart.callback)
                wrapedPart.callback.call(this);
        },
        playWrapedQueue = function (wrapedQueue, elapsed) {
            wrapedQueue.timeElapsed += elapsed;

            while(true){
                // 首先判断是否已经播放完最后一个part,如果是,则重置状态,并且判断播放次数是否完成
                // 如果完成则直接移除,如果没完成则,则将剩余时间放到下次播放中,,这样可以保证就算间隔很大一个时间,那么动画也能正常执行所有环节
                // 主要是保证完整性
                if(wrapedQueue.playIndex >= wrapedQueue.playParts.length){
                    resetWrapQueuePlayStatus(wrapedQueue, wrapedQueue.timeElapsed - wrapedQueue.totalDuration);

                    // 收尾工作,判断是否达到指定执行次数,如果达到,那么就移除
                    if(wrapedQueue.playedCount == wrapedQueue.loopc){
                        remove(wrapedQueue.srcQueue);
                        break;
                    }
                }

                let currentWrapedPart = wrapedQueue.playParts[wrapedQueue.playIndex];
                playWrapedQueuePart.call(wrapedQueue.srcQueue, wrapedQueue.obj, currentWrapedPart,
                    Math.min(wrapedQueue.timeElapsed - currentWrapedPart.timeStart, currentWrapedPart.duration));
                if(wrapedQueue.timeElapsed > currentWrapedPart.timeStart + currentWrapedPart.duration){
                    playWrapedQueuePartEnd.call(wrapedQueue.srcQueue, wrapedQueue.obj, currentWrapedPart);
                    wrapedQueue.playIndex ++;
                } else
                    break;
            }
        },
        mainRun = function(){       // 主循环函数
            nowTime = Date.now();
            elapsed = nowTime - lastTime;
            telapsed += elapsed;    // 计算总逝去时间,没啥用,暂且保留

            wrapedQueueMap.forEach(wq => playWrapedQueue(wq, elapsed));

            if(wrapedQueueMap.length) {
                lastTime = nowTime;
                timeOut = requestAnimationFrame(arguments.callee);
            }else
                timeOut = null;
        },
        mainStart = function(){     // 主启动函数
            if(!timeOut){
                lastTime = Date.now();
                mainRun();
            }
        },
        warpQueue = function (queue) {   // 返回一个包装对象,实际动画计算时候使用包装对象
            let
                {obj, parts, loopc} = queue,
                timeStart = 0;

            return {
                srcQueue : queue,
                obj : obj,
                loopc : loopc,
                playIndex : 0,        // 正在执行的位置,仅仅起到快速索引
                timeElapsed : 0,       // 总体逝去时间,
                totalDuration : parts.reduce((t, v) => t + v.duration, 0), // 动画总持续时间,
                playParts : parts.map(part => {
                    const
                        newProp = part.prop ?
                            Object.entries(part.prop).reduce((res, [k, v]) => {
                            res[k] = {};
                            res[k].s = v.s == undefined ? obj[k] : v.s;
                            res[k].e = v.e == undefined ? obj[k] : v.e;
                            res[k].p = v.p;
                            return res;
                        }, {}) : {},
                        newEnd = Object.assign({}, Object.entries(newProp).reduce((res, [k, v]) => {
                            res[k] = v.e;
                            return res;
                        }, {}) , part.end),
                        result = Object.assign({}, part, {
                            prop : newProp,
                            end : newEnd,
                            played : false,
                            timeStart : timeStart
                        });
                    timeStart += part.duration;
                    return result;
                }),
                playedCount : 0           // 已经播放的次数
            };
        };

    class _queue{
        constructor(obj, parts, loopc = 1, auto = true){
            this.obj = obj;
            this.parts = parts;
            this.loopc = loopc;

            if(auto)
                this.replay();
        }

        stop(forceEnd = false){
            remove(this, forceEnd);
            return this;
        }

        object(obj){
            if(obj){
                remove(this, true);
                this.obj = obj;
                return this;
            }
            return this.obj;
        }

        part(part){
            if (part){
                remove(this, true);
                this.parts = part;
                return this;
            }
            return this.parts;
        }

        replay(){
            if(this.obj && this.parts){
                wrapedQueueMap.push(warpQueue(this));
            }
            mainStart();
        }
    }

    _queue.create = function (obj, parts, loopc = 1) {
        return new _queue(obj, parts, loopc, false);
    };

    return _queue;
}());


// let
//     o = {val : 1000},
//     q = new Queue2(o, [{
//         prop : {                      // 动画播放的属性值s和e表示开始和结束,可以忽略任意参数,则被忽略的参数取当前值
//             val : {e : 0, p : Math.round}
//         },
//         end : {                       // 动画播放结束时进行赋值
//             val2 : 0
//         },
//         interpolator : null,        // 插值器
//         duration : 5000,             // 持续时间
//         process : function(){      // 在动画播放过程中调用
//             console.log(o.val);
//         },
//         callback : function(){    // 在动画播放结束后调用
//             console.log(this);
//         }
//     }]);
//
// setTimeout(function () {
//     q.stop(true);
//     console.log(o);
// }, 2000);
//
