const path = require('path');
const dotenv = require('dotenv')
dotenv.config({path: path.join(__dirname, 'config.env')})

module.exports = {
  mode: process.env.NODE_ENV || 'development', // mode: production by default
  devtool: 'none',
  entry: path.join(__dirname, 'public','js','index.js'),
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'public', 'js')
  },
  // module: {
  //   rules: [
  //     {
  //       test: /\.css$/,
  //       // css-loader will bundle your css into Js code inside your bundle.js file
  //       // style-loader will inject <style> tag into the DOM, adding CSS
  //       use: ['style-loader', 'css-loader']
  //     },
  //     {
  //       // we need file-loader to incorporate img file into our system
  //       test: /\.(png|svg|jpg|gif)$/,
  //       include: path.join(__dirname, 'public', 'img'),
  //       use: ['file-loader',]
  //     }
  //   ]
  // },
  watch: true
}
