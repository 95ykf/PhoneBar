'use strict';
const baseWebpackConfig = require('./webpack.base.conf');
const merge = require('webpack-merge');
const path = require('path');

module.exports = merge(baseWebpackConfig, {
    output:{
        publicPath: '/'
    },
    devtool: 'source-map',
    devServer: {
        contentBase: path.resolve(__dirname, '../static'),
        port: 8088,
        historyApiFallback: true,
        inline:true
    },
    watchOptions: {
        ignored: /node_modules/, //忽略不用监听变更的目录
        aggregateTimeout: 500, //防止重复保存频繁重新编译,500毫米内重复保存不打包
        poll:1000 //每秒询问的文件变更的次数
    }
});
