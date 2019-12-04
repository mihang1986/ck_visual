const Path = require('./path');

module.exports = (function () {
    return Path.create({
        options : {
        },
        init : function () {
            this.paths = [];
            this.calcs = [];
            this.quick = {};
        },
        methods : {
            addPath : function (path) {
                this.paths.push(path);
                this._recalc();
                return this;
            },
            getPath : function (index) {
                if(index)
                    return this.paths[index];
                else
                    return this.paths;
            },
            _recalc : function(){
                let
                    pls = this.paths.map(path => path.length()),
                    tl = pls.reduce((v, a) => v + a, 0),
                    cp = 0, key, li;

                Object.keys(this.quick).forEach(key => delete this.quick[key]);
                this.calcs.splice(0, this.calcs.length, ...pls.map(p => {
                    cp += p;
                    return [cp / tl, p / tl];
                }));
                for(let i = 0; i < this.calcs.length; i ++){
                    li = this.calcs[i][0];
                    key = Math.floor(li * 10);

                    if(this.quick[key] == undefined && li * 10 >= key)
                        this.quick[key] = i;
                }

                // console.log(this.calcs);
                // console.log(this.quick);
            }
        },
        resolve : function (percent) {
            if(this.paths.length == 0) return [0, 0];

            percent = percent % 1.0;
            percent = percent >= 0 ? percent : 1 + percent;

            let index = this.quick[Math.floor(percent * 10)] || 0;
            for(; index < this.calcs.length; index++){
                if(percent < this.calcs[index][0]) break;
            }

            // 在及其极端的情况下,有可能进度会为1,这种时候索引就会取得最大值+1,这里要处理一下
            index = index % this.paths.length;

            return this.paths[index].resolve(1 - (this.calcs[index][0] - percent) / this.calcs[index][1]);
        },
        length : function () {
            let tl = 0;
            for(let path of this.paths){
                tl += path.length();
            }
            return tl;
        }
    });


    //  原始备份
    // return Path.create({
    //     options : {
    //     },
    //     init : function () {
    //         this.paths = [];
    //         this.calcs = [];
    //     },
    //     methods : {
    //         addPath : function (path) {
    //             this.paths.push(path);
    //             this._recalc();
    //             return this;
    //         },
    //         getPath : function (index) {
    //             if(index)
    //                 return this.paths[index];
    //             else
    //                 return this.paths;
    //         },
    //         _recalc : function(){
    //             let bs = 0, total = this.length();
    //             this.calcs.splice(0, this.calcs.length);
    //             for(let path of this.paths){
    //                 let p = path.length() / total;
    //                 bs += p;
    //                 this.calcs.push({s : bs, p : p});
    //             }
    //         }
    //     },
    //     resolve : function (percent) {
    //         if(this.paths.length == 0) return [0, 0];
    //         // 首先计算当前百分比落在那个路径上,
    //         // 并且计算当前百分比下的整体进度
    //         // var s = 1 / this.paths.length,
    //         //     i = Math.min(Math.max(Math.ceil(percent / s) - 1, 0), this.paths.length - 1),
    //         //     p = (percent % s) * this.paths.length;
    //         // return this.paths[i].resolve(p);
    //
    //         // 考虑到长度问题,不能简单的对动画进行平分
    //         let index, calc;
    //         for([index, calc] of Object.entries(this.calcs)){
    //             if(percent <= calc.s) break;
    //         }
    //
    //         return this.paths[index].resolve(1 - ((calc.s - percent) / calc.p));
    //     },
    //     length : function () {
    //         let tl = 0;
    //         for(let path of this.paths){
    //             tl += path.length();
    //         }
    //         return tl;
    //     }
    // });

}());


