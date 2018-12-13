var path = require('path');

/**
 * If -p flag is set, minify the files
 * @type {boolean}
 */
var src = (process.argv.indexOf('-p') === -1);
var filenamePostfix = src ? '.src' : '';

var froalaExternals = {
  'froala-editor': {
    root: 'froala-editor',
    commonjs2: 'froala-editor/js',
    commonjs: 'froala-editor/js',
    amd: 'froala-editor/js'
  }
};

var reactExternals = {
  react: {
    root: 'React',
    commonjs2: 'react',
    commonjs: 'react',
    amd: 'react'
  },
  'react-dom': {
    root: 'ReactDOM',
    commonjs2: 'react-dom',
    commonjs: 'react-dom',
    amd: 'react-dom'
  }
};

var externals = [reactExternals];

module.exports = {
  entry: {
    // Array syntax to workaround https://github.com/webpack/webpack/issues/300
    'index': ['./lib/FroalaEditor.jsx'],
    'FroalaEditorA': ['./lib/FroalaEditorA.jsx'],
    'FroalaEditorButton': ['./lib/FroalaEditorButton.jsx'],
    'FroalaEditorImg': ['./lib/FroalaEditorImg.jsx'],
    'FroalaEditorInput': ['./lib/FroalaEditorInput.jsx'],
    'FroalaEditorView': ['./lib/FroalaEditorView.jsx']
  },
  module: {
    rules: [
      {
        test: /\.jsx$/,
        use: [
          {
            loader: 'babel-loader',
            options: {
              cacheDirectory: true,
              presets: ['react','es2015', 'stage-2']
            }
          }
        ]
      }
    ]
  },
  externals: externals,
  resolve: {
    modules: ['./node_modules']
  },
  output: {
    filename: 'dist/[name]' + filenamePostfix + '.js',
    libraryTarget: 'umd',
    library: '[name]'
  }
};