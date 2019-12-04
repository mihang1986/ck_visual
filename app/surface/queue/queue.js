module.exports = (function () {
    // const
    //     loopFn = requestAnimationFrame;

    const
        loopFn = function (callback) {
            return setTimeout(callback, 1);
        };

    let
        queueMap = [],
        lastTime, nowTime,
        elapsed = 0, telapsed, current, idx, i,
        getPartIndex = function(part){
            for(i=0; i<part.s.length; i++){
                if(part.e < part.s[i]){
                    return i;
                }
            }
            return part.s.length;
        },
        remove = function(part){
            return queueMap.splice(queueMap.indexOf(part), 1)[0];
        },
        setupPlay = function(el, qp){
            if(!qp.prop) return;

            Object.keys(qp.prop).forEach(k => {
                if(typeof(qp.prop[k].s) == 'undefined')
                    qp.prop[k].xs = el[k]
                else
                    qp.prop[k].xs = qp.prop[k].s;

                if(typeof(qp.prop[k].e) == 'undefined')
                    qp.prop[k].xe = el[k]
                else
                    qp.prop[k].xe = qp.prop[k].e;
            });
        },
        playStart = function(el, part){
            if(!part.prop) return;

            for(let [key, val] of Object.entries(part.prop)){
                el[key] = val.xs;
            }
        },
        playProcess = function(el, part, elapsed){
            const percent = part.interpolator ?
                part.interpolator.resolve(elapsed / part.duration) :
                elapsed / part.duration;

            if(!part.prop) return;
            for(let [key, val] of Object.entries(part.prop)){
                el[key] = (1 - percent) * val.xs + percent * val.xe;
            }
        },
        playEnd = function(el, part){
            if(!part.prop) return;
            for(let [key, val] of Object.entries(part.prop)){
                el[key] = val.xe;
            }
        },
        playPart = function(part, elapsed){
            if(part.x){
                const rp = remove(part);
                setupPlay(rp.q.el, rp.q.qs[rp.q.qs.length - 1]);
                playEnd(rp.q.el, rp.q.qs[rp.q.qs.length - 1]);
            }else{
                part.e += elapsed;
                idx = getPartIndex(part);
                if(part.c != idx){
                    part.c = idx;
                    if(part.c > 0){
                        playEnd(part.q.el, part.q.qs[idx - 1]);

                        if(part.q.qs[idx - 1].end)
                            Object.entries(part.q.qs[idx - 1].end).forEach(([k, v])=>part.q.el[k] = v);

                        if(part.q.qs[idx - 1].message)
                            part.q.qs[idx - 1].message.call(part.q, idx - 1, 1);

                        if(part.q.qs[idx - 1].callback)
                            part.q.qs[idx - 1].callback.call(part.q);
                    };

                    if(idx >= part.q.qs.length){
                        remove(part);
                    }else{
                        setupPlay(part.q.el, part.q.qs[idx]);
                        playStart(part.q.el, part.q.qs[idx]);
                        if(part.q.qs[idx].message)
                            part.q.qs[idx].message.call(part.q, idx, 0);
                    }
                }else{
                    playProcess(part.q.el, part.q.qs[idx], part.q.qs[idx].duration + part.e - part.s[idx]);

                    if(part.q.qs[idx].message)
                        part.q.qs[idx].message.call(part.q, idx, (idx == 0 ? part.e : part.e - part.s[i - 1]) / part.q.qs[idx].duration);
                }
            }
        },
        play = function(){
            nowTime = new Date();
            telapsed = nowTime - lastTime;
            elapsed += telapsed;

            if(queueMap.length){
                queueMap.forEach(part=>playPart(part, telapsed));

                lastTime = nowTime;
                loopFn(play);
            }else{
                lastTime = null;
            }
        },
        stop = function(part, forceEnd){
            if(!part) return;
            forceEnd ? part.x = true : remove(part);
        },
        start = function () {
            if(!lastTime){
                lastTime = new Date();
                play();
            }
        };


    class _queue{
        constructor(el, ...qs){
            this.el = el;
            this.qs = qs;

            if(el && qs) this.replay();
        }

        stop(forceEnd = false){
            const that = this;
            stop(queueMap.filter(v=>v.q === that)[0], forceEnd);
            return this;
        }

        setElem(el){
            this.el = el;
            return this;
        }

        setQs(...qs){
            this.qs = qs;
            return this;
        }

        replay(){
            let
                stepD = [],
                total = 0;

            this.qs.forEach(q => {
                total += q.duration;
                stepD.push(total);
            });

            queueMap.push({q : this, c : -1, e : 0, s : stepD, x : false});
            start();

            return this;
        }
    }

    return _queue;
}());