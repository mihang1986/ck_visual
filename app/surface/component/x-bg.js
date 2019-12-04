const
    Animation = require('../animation'),
    Buffer = require('../buffer'),
    _ = require('lodash'),
    chroma = require('chroma-js'),
    Util =  require('../utils');

module.exports = (function () {
    return Animation.create({
        constructor({color = '#fff'} = {}){
            this.opt = {
                rMin : 5,
                rMax : 15,
                pSize : 100,
                particle : [],
                lines : [],
                color : color,
                buffer : {}
            }

            this._initBuffer();
        },
        attach : function(){
            this._initParticle(100, 100, 1820, 980);
        },
        methods : {
            _initBuffer : function () {
                for(let i=this.opt.rMin; i<=this.opt.rMax; i++){
                    let bf = new Buffer(i * 2, i * 2);
                    this._drawBuffer(bf, i);
                    this.opt.buffer[i] = bf;
                }
            },
            _drawBuffer : function (bf, r) {
                const
                    [cvs, ctx] = [bf.canvas, bf.context],
                    grad = ctx.createRadialGradient(0, 0, 0, 0, 0, r),
                    color = chroma(this.opt.color);

                grad.addColorStop(0, color.alpha(.7).hex());
                // grad.addColorStop(.2, color.alpha(.5).hex());
                grad.addColorStop(1, color.alpha(0).hex());

                ctx.translate(r, r);

                ctx.fillStyle = grad;
                ctx.beginPath();
                ctx.arc(0, 0, r, 0, Math.PI * 2);
                ctx.fill();
            },
            _initParticle : function (bl, bt, width, height) {
                for (let i = 0; i < this.opt.pSize; i++) {
                    this.opt.particle.push({
                        sx: Math.floor(width * Math.random()) + bl,      // x
                        sy: Math.floor(height * Math.random() + bt),     // y,
                        x: 0,  // nx
                        y: 0,  // ny
                        size: Math.floor(Math.random() * (this.opt.rMax - this.opt.rMin)) + this.opt.rMin, // size
                        current: Math.floor(Math.random() * 360),    // start
                        speed: (Math.random() - 0.5) / 1.5,             // speed
                        r: Math.floor(Math.random() * 50) + 5 // 半径,
                    });
                }
            }
        },
        update : function (passed, elapsed, ctx, cvs) {
            for(let p of this.opt.particle){
                p.current += (passed / 1000) * p.speed;
                p.x = Math.cos(p.current) * p.r + p.sx;
                p.y = Math.sin(p.current) * p.r + p.sy;
            }
        },
        render : function (passed, elapsed, ctx, cvs, ret) {
            this.opt.particle.forEach(p => {
                ctx.drawImage(this.opt.buffer[p.size].canvas, p.x - p.size, p.y - p.size);
            });


        }
    });
}());