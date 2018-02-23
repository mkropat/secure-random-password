const path = require('path');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin')
const webpack = require('webpack');

module.exports = {
  entry: './index.web.js',
  output: {
    filename: 'secure-random-password.min.js',
    path: path.resolve(__dirname, 'dist')
  },
  externals: {
    './../../process/browser.js': '{}',
    './../../buffer/index.js': '{}',
  },
  plugins: [
    new UglifyJsPlugin(),
  ],
};
