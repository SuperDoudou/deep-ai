const { merge } = require('webpack-merge');
const baseConfig = require('./webpack.diff.base.js');
module.exports = merge(baseConfig, {
  mode: 'production',
});