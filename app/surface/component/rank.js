const
    Animation = require('../animation'),
    Buffer = require('../buffer'),
    _ = require('lodash'),
    chroma = require('chroma-js'),
    ArcPath = require('../path/arc-path'),
    RankItem = require('./rank-item'),
    EaseCubicInterpolator = require('../interpolator/ease-cubic-interpolator'),
    Queue = require('../queue/queue2'),
    china = require('../map/maps/china'),
    Surface = require('../surface'),
    Util =  require('../utils');

module.exports = (function () {
    const
        inter = new EaseCubicInterpolator({x1: .29, x2: .47, y1: .47, y2: .48}),
        inter2 = new EaseCubicInterpolator({x1: .46, x2: .01, y1: .39, y2: .81});

    const
        arcPointsSize = 100;

    return Animation.create({
        constructor(opt){
            const
                that = this;

            this.opt = Object.assign({
                rkImg : null
            }, opt);

            // 数据相关
            this.datas = china.features.map(f =>({
                id : f.id,
                name : f.properties.name,
                aTotal : 1000,
                pTotal : 800,
                eTotal : 200,
                xkTotal : 50000,
                cfTotal : 80000,
                rank : Math.floor(Math.random() * 33)
            }));
            this.idxDatas = this.datas.reduce((a, d) => {
                a[d.id] = d;
                return a;
            }, {});

            // 显示相关
            this.path = new ArcPath({inversion : true});
            this.rankItemSize = 7;
            this.rankItemCenter = Math.floor(this.rankItemSize / 2);
            this.rankStep = 1 / (this.rankItemSize - 1);
            this.rankItems = Array.apply(null, {length : this.rankItemSize}).map((_, idx) => {
                const
                    rr = new RankItem({ rkImg :that.opt.rkImg });
                rr.data = that.datas.shift();
                that.addSubObject(rr, 100);
                return rr;
            });
        },
        attach : function({canvas, context}){
            this._calcArcPath(canvas.width, canvas.height);
            this._calcArcPoints();
            this._initItemPos();
            this._updateItemSPos();
            this._calcItemPos();
            this._startRun();
        },
        methods : {
            onSwitch : function(fun){
                this.switchListener = fun;
            },
            _calcArcPath : function (width, height) {
                const
                    pt1 = [width / 2 - 500, -50],
                    pt2 = [width / 2 + 500, -50],
                    r = Util.Math.distance(pt1, pt2) * .7 ,
                    tp = Util.Math.twoPointArc(pt1, pt2, r, true);

                Object.assign(this.path, {
                    x : tp.origin[0],
                    y : tp.origin[1],
                    r : r,
                    sAngle : tp.start,
                    eAngle : tp.end,
                });
            },
            _calcArcPoints : function(){
                const
                    that = this;
                this.arcPoints = Array.apply(null, {length : arcPointsSize}).map((_, idx) => that.path.resolve(idx * 1 / (arcPointsSize - 1)));
            },
            _initItemPos : function(){
                const
                    length = this.rankItems.length - 1;
                this.rankItems.forEach((ri, idx) => {
                    ri.p = idx / length;
                });
            },
            _offsetItemPos : function(offset){
                this.rankItems.forEach(ri => {
                    ri.p = ri.sp + offset;
                });
            },
            _updateItemSPos : function(){
                this.rankItems.forEach(ri => {
                    ri.sp = ri.p;
                });
            },
            _calcItemPos : function(){
                const
                    that = this,
                    path = this.path;
                this.rankItems.forEach((ri, idx) => {
                    // if(idx == that.rankItemSize) return ;
                    const
                        pos = path.resolve(ri.p);
                    ri.opt.x = pos[0];
                    ri.opt.y = pos[1];
                    ri.opt.opacity = Math.sin(ri.p * Math.PI);
                });
            },
            _swapItemBEAndReTakeData : function(){
                const temp = this.rankItems.pop();
                temp.p = 0; temp.sp = 0;
                this.datas.push(temp.data);
                temp.data = this.datas.shift();
                this.rankItems.unshift(temp);
            },
            _resetAllRankItem : function(){
                this.rankItems.forEach(ri => {
                    ri.opt.renderType = 'small';
                    ri.opt.renderPercent = 0;
                    // ri.opt.opacity = 1;
                });
            },
            _startRun : function () {
                const
                    that = this,
                    subQueue = new Queue(null, [{
                        duration : 500,
                        end : {
                            renderType : 'large'
                        }
                    },{
                        prop : {
                            renderPercent : {s : 0, e : 1}
                        },
                        duration : 1000
                    },{
                        duration : 3000
                    },{
                        prop : {
                            renderPercent : {s : 1, e : 0}
                        },
                        end : {
                            renderType : 'small'
                        },
                        duration : 1000
                    }]),
                    mainQueue = new Queue(that, [{
                        duration : 0,
                        callback : function () {    // 仅仅是为了执行回调
                            // 执行回调
                            if(that.switchListener)
                                that.switchListener.call(that, that.rankItems[that.rankItemCenter - 1].data.id);
                        }
                    },{
                        prop : {
                            offset : {s : 0, e : 1}
                        },
                        end : {
                            offset : 0
                        },
                        duration : 1000,
                        process : function(ep){
                            that._offsetItemPos(that.rankStep * inter2.resolve(ep));
                            that._calcItemPos();
                        },
                        callback : function () {
                            that._updateItemSPos();
                            that._swapItemBEAndReTakeData();
                            that._resetAllRankItem();

                            // 播放子动画
                            subQueue.object(that.rankItems[that.rankItemCenter].opt).replay();
                        }
                    },{
                        duration : 6000,
                        callback : function () {
                            this.replay();
                        }
                    }]);
            }
        },
        notify : {
            parentresize : function ({surface : parent}) {
                this._calcArcPath(parent.width, parent.height);
                this._calcArcPoints();
            }
        },
        render : function (passed, elapsed, ctx, cvs, ret) {
            // ctx.strokeStyle = '#ffd5a955';
            // ctx.lineWidth = .5;
            // ctx.beginPath();
            // ctx.arc(this.path.x, this.path.y, this.path.r,
            //     this.path.sAngle, this.path.eAngle);
            // ctx.stroke();

            // ctx.fillStyle = '#fff';
            // this.arcPoints.forEach(([x, y]) => {
            //    ctx.beginPath();
            //    ctx.arc(x, y, 3, 0, Math.PI * 2);
            //    ctx.fill();
            // });

            const
                offset = elapsed % 1000 / 1000 * Math.PI * 2,
                _c = arcPointsSize - 1;

            ctx.lineWidth = .5;

            for(let loop = 0; loop < 3; loop ++){
                ctx.strokeStyle = ['#ffd5a9aa', '#ff9f93aa', '#a5ffa6aa'][loop];
                ctx.beginPath();
                this.arcPoints.forEach(([x, y], idx) => {
                    let
                        _x = idx / _c,
                        _z = Math.sin(Math.PI * _x),  // 衰减系数-线性
                        _y = Math.cos(20 * Math.PI * _x + offset + loop) * 5;   // y实际值

                    ctx[idx == 0 ? 'moveTo' : 'lineTo'](x,  _y * _z + y);
                });
                ctx.stroke();
            }

        }
    });
}());