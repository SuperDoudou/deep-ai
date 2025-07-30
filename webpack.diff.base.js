const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin');
const { type } = require('os');
const { use } = require('react');

module.exports = {
  entry: path.join(__dirname, './src/diff/app/index.tsx'), // 入口文件
  output: {
    filename: 'static/js/[name].js',
    path: path.join(__dirname, './dist_react/diff'),
    clean: true,
    publicPath: './',
  },
  module: {
    rules: [
      {
        test: /.(ts|tsx)$/, // 匹配.ts, tsx文件
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              '@babel/preset-react',
              '@babel/preset-typescript'
            ]
          }
        }
      },
      {
        test: /\.css$/,
        use: [
          'style-loader',
          'css-loader'
        ]
      },
      {
        test: /\.(png|svg|jpg|jpeg|gif)$/,
        use: ['raw-loader'],
      }
    ]
  },
  resolve: {
    extensions: ['.js', '.tsx', '.ts', '.css'],
  },
  plugins: [
    new MonacoWebpackPlugin(),
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, './src/diff/app/index.html'),
      inject: true, // 自动注入静态资源
    }),
  ],
};