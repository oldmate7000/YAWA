const path = require('path');
const common = require("./webpack.common");
const merge = require("webpack-merge")

module.exports = merge(common, {
  mode: 'development',
  devtool: "none",
  watch: true,
  output: {
    path: path.join(__dirname, 'public'),
    filename: '[name].bundle.js',
  },
});