var path = require('path');
var UglifyJSPlugin = require('uglifyjs-webpack-plugin');
var ExtractTextPlugin = require('extract-text-webpack-plugin');

var moduleBundle = {

  entry: {
    'quill-cursors': ['./src/cursors.js', './src/cursors.scss'],
    'quill-cursors.min': ['./src/cursors.js'],
  },

  output: {
    filename: '[name].js',
    library: 'QuillCursors',
    libraryExport: 'default',
    libraryTarget: 'umd',
    path: path.resolve(__dirname, 'dist')
  },

  externals: {
    quill: {
      root: 'Quill',
      commonjs2: 'quill',
      commonjs: 'quill',
      amd: 'quill'
    }
  },

  module: {
    rules: [{
      test: /\.scss$/,
      loader: ExtractTextPlugin.extract(['css-loader', 'sass-loader'])
    }]
  },

  plugins: [
    new UglifyJSPlugin({
      test: /\.min\.js$/
    }),
    new ExtractTextPlugin({ // define where to save the file
      filename: '[name].css'
    })
  ],

  devServer: {
    contentBase: [
      path.join(__dirname, 'example'),
      path.join(__dirname, 'node_modules/normalize.css'),
      path.join(__dirname, 'node_modules/quill/dist')
    ]
  },
};

module.exports = [moduleBundle];
