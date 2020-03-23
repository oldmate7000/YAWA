const path = require('path');
const common = require("./webpack.common");
const merge = require("webpack-merge");
const {CleanWebpackPlugin} = require("clean-webpack-plugin");

module.exports = merge(common, {
  mode: 'development',
  output: {
    path: path.join(__dirname, 'public'),
    filename: 'bundle.[contentHash].js',
  },
  plugins: [new CleanWebpackPlugin()]
});