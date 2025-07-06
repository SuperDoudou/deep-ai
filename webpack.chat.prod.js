const { merge } = require('webpack-merge');
const baseConfig = require('./webpack.chat.base.js');
module.exports = merge(baseConfig, {
  mode: 'production',
});