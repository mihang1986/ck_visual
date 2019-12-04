const Shape = require('./shape');

module.exports = Shape.create({
    options : {
        x : 0,
        y : 0
    },
    equalsTo(point) {
        return this.x === point.x
            && this.y === point.y;
    }
});