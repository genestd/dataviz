var webpack = require('webpack');
var path = require('path');
var HtmlWebpackPlugin = require('webpack-html-plugin');
var CopyWebpackPlugin = require('copy-webpack-plugin');
var HTMLWebpackPluginConfig = new HtmlWebpackPlugin({
  template: __dirname + '/src/index.html',
  filename: 'index.html',
  inject: 'body'
});
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var devFlagPlugin = new webpack.DefinePlugin({
  __DEV__: JSON.stringify(JSON.parse(process.env.DEBUG || 'false'))
});

module.exports={
//  devtool: "source-map",
  entry: [
    './src/index.js'
  ],
  output: {
    path: __dirname + '/dist',
    //publicPath: './dist',
    filename: "index_bundle.js",
    publicPath: '/'
  },
  devServer: {
    contentBase: __dirname + '/dist',
    publicPath: 'http://localhost:8080'
  },
  module: {
    loaders: [
      { test: /\.(jpe?g|png|gif|svg|tsv|csv)$/i, loader: 'file-loader' },
      { test: /\.js$/, exclude: /node_modules/, loader: "babel-loader"},
      { test: /\.css/, loader: ExtractTextPlugin.extract(["css"])},
      { test: /\.scss$/, loaders: [ 'style', 'css', 'resolve-url-loader', 'sass?outputStyle=compressed' ]}
    ]
  },
  sassLoader: {
    includePaths: [
      './node_modules',
      // this is required only for NPM < 3.
      // Dependencies are flat in NPM 3+ so pointing to
      // the internal grommet/node_modules folder is not needed
      './node_modules/grommet/node_modules'
    ]
  },
  plugins: [
    HTMLWebpackPluginConfig,
    new CopyWebpackPlugin([
            { from: './src/icons', to: 'icons' },
            { from: './src/icons/flags.png', to: 'flags.png'},
            { from: './src/data.csv' },
            { from: './src/tempData.json'},
            { from: './src/countryData.json'}
        ]),
    new ExtractTextPlugin("styles.css"),
    devFlagPlugin
  ]
};
