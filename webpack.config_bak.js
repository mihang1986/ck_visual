const webpack = require('webpack'),
        path = require('path');

module.exports = {
    devtool: 'eval-source-map',
    entry:  __dirname + "/app/main.js",//已多次提及的唯一入口文件
    output: {
        path: __dirname + "/main",//打包后的文件存放的地方
        filename: "bundle.js"//打包后输出文件的文件名
    },
    watchOptions : {
        ignored : /node_modules/,   // 忽略监听目录
        aggregateTimeout : 300, // 防止编译过快
        poll : 1000
    },
    module: {
        rules: [
            {
                test: /(\.jsx|\.js)$/,
                include : path.resolve(__dirname, 'app'),
                use: {
                    loader: "babel-loader",
                    options: {
                        presets: [
                            "env"
                        ]
                    }
                }//,
                //exclude: /node_modules/
            },
            // {
            //     test: /(\.jsx|\.js)$/,
            //     use: {
            //         loader: "babel-loader"
            //     },
            //     exclude: /node_modules/
            // },
            // {
            //     test: /\.css$/,
            //     use: [
            //         {
            //             loader: "style-loader"
            //         }, {
            //             loader: "css-loader"
            //         }
            //     ]
            // },
            {
                test: /\.scss$/,
                include : path.resolve(__dirname, 'app'),
                use:[ 'style-loader','css-loader','sass-loader'],
            }
        ]
    },
    plugins: [
        new webpack.BannerPlugin('canvas by navia')
    ],
    devServer: {
        contentBase: "./main",//本地服务器所加载的页面所在的目录
        historyApiFallback: true,//不跳转
        inline: true//实时刷新
    }
}