module.exports = (function () {
    class Buffer{
        constructor(width = 100, height = 100){
            this.cvs = document.createElement('canvas');
            this.ctx = this.cvs.getContext('2d');

            this.cvs.width = width;
            this.cvs.height = height;
        }

        get context(){
            return this.ctx;
        }

        get canvas(){
            return this.cvs;
        }

    }

    return Buffer;
}());