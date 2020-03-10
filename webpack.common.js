const path = require('path');
var HtmlWebpackPlugin = require("html-webpack-plugin")

module.exports = {
  context: path.join(__dirname, './'),
  entry: './app/weather.js',
  resolve: {
    extensions: ['.js', '.jsx', '.css'],
  },
  plugins: [new HtmlWebpackPlugin({
    template: "./app/weather.html"
  })],
  module: {
    rules: [
      {
        test: /\.js$/,
        loader: 'babel-loader',
        options: {
          presets: ['react']
        },
        exclude: /node_modules/,
        include: path.join(__dirname, 'app'),
      },
      {
        test: /\.css$/,
        loader: ['style-loader', 'css-loader']
      }
    ]
  },
};