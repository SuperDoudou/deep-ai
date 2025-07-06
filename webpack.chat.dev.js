const path = require('path');
const { merge } = require('webpack-merge');
const baseConfig = require('./webpack.chat.base.js');

module.exports = merge(baseConfig, {
  mode: 'development',
  devtool: 'source-map',
  devServer: {
    server: 'http',
    headers: {
      "Access-Control-Allow-Origin": "*"
    },
    port: 3000,
    compress: false,
    hot: true,
    historyApiFallback: true,
    static: {
      directory: path.join(__dirname, './src/view/public'),
    }
  },
});