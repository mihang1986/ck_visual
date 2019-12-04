const
    Surface = require('./surface/surface'),
    CImage = require('./surface/cimage'),
    ChinaMap = require('./surface/map/chinamap'),
    Repeater = require('./message/repeater'),
    Connecting = require('./surface/component/connecting'),
    XBg = require('./surface/component/x-bg'),
    Counter = require('./surface/component/counter'),
    Queue2 = require('./surface/queue/queue2'),
    Rank = require('./surface/component/rank'),
    Logger = require('./surface/component/logger'),
    Chart = require('./surface/component/chart'),
    MapToolTip = require('./surface/component/map-tooltip'),
    chroma = require('chroma-js'),
    Util =  require('./surface/utils'),
    axios = require('axios'),
    _ = require('lodash');


(async function () {
    const
        bgImage = (await CImage.loadImage('./res/a2s.png')).effect("gauss", {radius : 4, sigma : 4}),
        rankImage = await CImage.loadImage('./res/rank.png'),
        cmp1Image = await CImage.loadSvg('./res/svg/cmp3.svg'),
        rkImg = await CImage.loadSvg('./res/svg/45678.svg', v=>v.replace(/\#000000/g, '#fff9')),
        perImg = await CImage.loadSvg('./res/svg/对.svg'),
        punImg = await CImage.loadSvg('./res/svg/错.svg'),
        sgsLogTypeImgs = [await CImage.loadSvg('./res/svg/synchronize.svg',  v=>v.replace(/\#000000/g, '#a5ffa6')),
            await CImage.loadSvg('./res/svg/synchronize.svg',  v=>v.replace(/\#000000/g, '#ff9f93'))];


    // program
    const
        mainSurface = (new Surface({full : true, fps : true, bg : bgImage, limit : -1})).appendTo(document.body).run(),
        chinaMap = (new ChinaMap({centerImg : cmp1Image, offsetX : -200})).appendTo(mainSurface, Surface.LEVEL.LOWER),
        connecting = (new Connecting()).appendTo(mainSurface, Surface.LEVEL.HIGHER),
        xBG = (new XBg()).appendTo(mainSurface, Surface.LEVEL.LOWER),
        rank = (new Rank({rkImg})).appendTo(mainSurface, Surface.LEVEL.TOP),
        counterPer = (new Counter({offsetX : -120, y : 40, icon : perImg, color : '#a5ffa6'})).appendTo(mainSurface, Surface.LEVEL.TOP),
        counterPun = (new Counter({offsetX : 120, y : 40, icon : punImg, color : '#ff9f93'})).appendTo(mainSurface, Surface.LEVEL.TOP),
        logger = (new Logger({right : 10, bottom : 10})).appendTo(mainSurface),
        tooltip = (new MapToolTip({x : mainSurface.width / 2, y : mainSurface.height / 2})).appendTo(mainSurface, Surface.LEVEL.TOP + 999);
        // chart = (new Chart({
        //     pos : {
        //         bottom : 10,
        //         left : 10
        //     },
        //     title : {
        //         text : '测试表头一',
        //         x : 'center',
        //         y : 30
        //     },
        //     series : [{
        //         type : 'simpleBar',
        //         axisNames : ['测试1', '测试2', '测试3', '测试4', '测试5', '测试6', '测试7', '测试8'],
        //         scale : [.8, .8],
        //         offset : [0, 20],
        //         data : [10000, 20000, 30000, 40000, 50000, 60000, 70000, 80000]
        //     }]
        // })).appendTo(mainSurface) 

    // tooltip.aaa();

    const
        repeater = new Repeater('ws://192.168.43.152:8080/cp/webSocket/1');

    repeater.on('open', function (event) {
        console.log('open');
        mainSurface.removeObject(connecting);
    }).on('error', function (event) {
        console.log('error');
    }).on('close', function (event) {
        console.log('close');
        // mainSurface.pushObject(connecting, Surface.LEVEL.HIGHER);
    }).reg('a001', function (data) {
        console.log(data);
    }).reg('a001', chinaMap, 'newTick');

    // 关联事件
    rank.onSwitch(function (id) {
        const
            data = rank.idxDatas[id],
            pt = chinaMap.idxMapData[id].cp,
            npt = Util.Math.add(pt, [mainSurface.width / 2, mainSurface.height / 2]),
            nearsetPt = tooltip.nearest(npt),
            movePt = Util.Math.dec(npt, nearsetPt);

        tooltip.setData(data);
        tooltip.moveTo(movePt, npt);
    });



    // 测试代码
    const
        rChoose = (arr) => arr[Math.floor(Math.random() * arr.length)],
        keys = Object.keys(chinaMap.paths);

    mainSurface.removeObject(connecting);
    (function(){
        chinaMap.tick(rChoose(keys), rChoose(['#ff9f93', '#a5ffa6']));
        setTimeout(arguments.callee, 300);
    }());


    let pun = 0, per = 0;
    (function(){
        const
            punx = Math.round(Math.random() * 100),
            perx = Math.round(Math.random() * 100);

        pun += punx;
        per += perx;

        counterPun.value(pun);
        counterPer.value(per);

        setTimeout(arguments.callee, 2000);
    }());


    // logger
    const
        provinceNmaes = chinaMap.mapData.map(v => v.name),
        sgsColor = ['#a5ffa6', '#ff9f93'],
        sgsName = ['行政许可', '行政处罚'];

    setInterval(function () {
        const
            pIdx = Math.floor(provinceNmaes.length * Math.random()),
            sgsType = Math.floor(2 * Math.random());
        logger.log(`[${provinceNmaes[pIdx]}]上传[${sgsName[sgsType]}]数据[${Math.floor(Math.random() * 100)}]条.`, sgsColor[sgsType]);
    }, 1000);






    // test code
    // (new RankRect({x : 500, y : 300, icon : rank1Image})).appendTo(mainSurface);
    // const
    //     q = new Queue({offset : 1}, {
    //         duration : 5000
    //     },{
    //         prop : {
    //             offset : {s : 0, e : 1}
    //         },
    //         end : {
    //             offset : 0
    //         },
    //         duration : 1000,
    //         message : function(idx, elapse){
    //             console.log(elapse);
    //         },
    //         callback : function () {
    //             console.log('c end');
    //             this.replay();
    //         }
    //     });


    // 测试新队列
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
}());



