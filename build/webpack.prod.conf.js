'use strict';
const baseWebpackConfig = require('./webpack.base.conf');
const merge = require('webpack-merge');
const path = require('path');

const CleanWebpackPlugin = require('clean-webpack-plugin'); // 清空打包目录的插件
const OptimizeCSSPlugin = require('optimize-css-assets-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin')

const webpackConfig = merge(baseWebpackConfig, {
    output:{
        publicPath: './', //这里要放的是静态资源CDN的地址(一般只在生产环境下配置)
        filename: 'js/[name].min.js',
    },
    plugins: [
        new CleanWebpackPlugin(['dist'], {
            root: path.resolve(__dirname, '../'),
            verbose: true,
            dry:  false
        }),
        new OptimizeCSSPlugin({
            cssProcessorOptions: {safe: true}
        }),
        new CopyWebpackPlugin([
          {
            from: path.resolve(__dirname, '../static'),
            // to: config.build.assetsSubDirectory,
          }
        ])
    ]
});

// 是否生产构建报表
if (process.env.npm_config_report) {
    const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
    webpackConfig.plugins.push(new BundleAnalyzerPlugin())
}

module.exports = webpackConfig;
