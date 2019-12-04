const Path = require('./path');

module.exports = (function () {
    return Path.create({
        options : {
            x0 : 0,
            y0 : 0,
            x1 : 100,
            y1 : 100,
            x2 : 200,
            y2 : 200
        },
        resolve : function (percent) {
            var x = this.x0 * Math.pow(1 - percent, 2) + 2 * this.x1 * percent * (1 - percent) + this.x2 * Math.pow(percent, 2),
                y = this.y0 * Math.pow(1 - percent, 2) + 2 * this.y1 * percent * (1 - percent) + this.y2 * Math.pow(percent, 2),
                r = Math.atan2(this.y0 * 2 * (1 - percent) * -1 + 2 * this.y1 * ((1 - percent) + (-1) * percent) + this.y2 * 2 * percent,
                    this.x0 * 2 * (1 - percent) * -1 + 2 * this.x1 * ((1 - percent) + (-1) * percent) + this.x2 * 2 * percent);

            return [x, y, r];
        },
        length : function (point = 30) {
            let result = 0;
            if(point < 2) return 0;

            let cp = this.resolve(0);
            for(let i=1; i<=point; i++){
                let p = 1 / point * i,
                    np = this.resolve(p),
                    d = Math.sqrt(Math.pow(cp[0] - np[0],2) + Math.pow(cp[1] - np[1], 2));

                cp = np;
                result += d;
            }
            return result;
        }
    });
}());