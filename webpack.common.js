const path = require('path');
var HtmlWebpackPlugin = require("html-webpack-plugin")
const {CleanWebpackPlugin} = require("clean-webpack-plugin");


module.exports = {
  context: path.join(__dirname, './'),
  entry: {
    login: './src/login.js',
    weather: './src/weather.js'
  },
  resolve: {
    extensions: ['.js', '.jsx', '.css'],
  },
  plugins: [
    new HtmlWebpackPlugin({
    template: "./src/weather.html",
    filename: 'weather.html',
    chunks: ['weather']
  }),
  new HtmlWebpackPlugin({
    template: "./src/login.html",
    filename: "login.html",
    chunks: ['login']
  }),
  new CleanWebpackPlugin()
  ],
  module: {
    rules: [
      {
        test: /\.js$/,
        loader: 'babel-loader',
        options: {
          presets: ['react']
        },
        exclude: /node_modules/,
        include: path.join(__dirname, 'src'),
      },
      {
        test: /\.css$/,
        loader: ['style-loader', 'css-loader'],
        exclude: /node_modules/,
        include: path.join(__dirname, 'src'),
      }
    ]
  },
};