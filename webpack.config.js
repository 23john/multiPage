const portName = 8094;
var webpack = require('webpack');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var path = require('path');
var ROOT_PATH = path.resolve(__dirname);
var BUILD_PATH = path.resolve(ROOT_PATH, 'dist');
var glob = require('glob');
var ETPGPage = require('extract-text-webpack-plugin');
var ETPGReset = require('extract-text-webpack-plugin');

let env = process.env.NODE_ENV;
var envPath = function () {
  if (env === 'prod') {
    env = 'prod';
    return (path.resolve(__dirname, 'src/js/config/prod.js'));
  } else if (env === 'dev') {
    env = 'dev';
    return (path.resolve(__dirname, 'src/js/config/dev.js'));
  } else if (env === 'uat') {
    env = 'uat';
    return (path.resolve(__dirname, 'src/js/config/uat.js'));
  } else if (env === 'test') {
    env = 'test';
    return (path.resolve(__dirname, 'src/js/config/test.js'));
  } else {
    throw "环境错误";
  }
}();

const devServer = function () {
  var server = {
    contentBase: path.resolve(__dirname),
    historyApiFallback: true,
    hot: true,
    inline: true,
    progress: true,
    port: portName //端口你可以自定义
  }
  return server;
}();
var entries = function () {
  var jsDir = path.resolve(__dirname, 'src/js/enter');
  var entryFiles = glob.sync(jsDir + '/*.js');
  var map = {};
  entryFiles.forEach(function (filePath) {
    var filename = filePath.split('enter/')[1].split('.js')[0];
    map[filename] = filePath;
  });
  return map;
}();
var htmlPages = function () {
  var artDir = path.resolve(__dirname, 'src/view');
  var artFiles = glob.sync(artDir + '/*.art');
  var array = [];
  artFiles.forEach(function (filePath) {
    var filename = filePath.split('view/')[1].split('.art')[0];
    array.push(new HtmlWebpackPlugin({
      title: filename,
      template: path.resolve(__dirname, 'src/tpl/index.html'), // 模版页面
      filename: filename + '.html', // 生成后的文件名
      hash: true,
      chunks: ['env', 'common', filename], // 加载公共js
      chunksSortMode: function (chunk1, chunk2) { // 加载公共js的顺序
        var order = ['env', 'common', filename];
        var order1 = order.indexOf(chunk1.names[0]);
        var order2 = order.indexOf(chunk2.names[0]);
        return order1 - order2;
      },
      /*
      minify: {
        removeComments: env != 'dev' ? true : false, //删除注释引号
        collapseWhitespace: env != 'dev' ? true : false, //删除空格，但是不会删除SCRIPT、style和textarea中的空格
      }
      */
    }));
  });
  return array;
}();
config = {
  entry: entries,
  output: {
    path: BUILD_PATH,
    filename: 'js/[name].js',
  },
  resolve: {
    // require时省略的扩展名，如：require('module') 不需要module.js
    extensions: ['.art', '.js', '.css', '.scss'],
    // 别名，可以直接使用别名来代表设定的路径以及其他
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@view': path.resolve(__dirname, 'src/view'),
      '@css': path.resolve(__dirname, 'src/css'),
      '@image': path.resolve(__dirname, 'src/image'),
      '@js': path.resolve(__dirname, 'src/js'),
      '@path': envPath,
    }
  },
  module: {
    rules: [{
        test: /\.js$/,
        use: {
          loader: 'babel-loader'
        },
        exclude: /node_modules/
      },
      {
        test: /\.(html|tpl)$/,
        use: ['html-loader']
      },
      {
        test:  /[^(resetStyle)].scss$/,
        use: ETPGPage.extract({
          fallback: 'style-loader',
          use: ['css-loader', 'sass-loader']
        })
      },
      {
        test: /resetStyle.scss$/,
        use: ETPGReset.extract({
          fallback: 'style-loader',
          use: ['css-loader', 'sass-loader']
        })
      },
      /*
        问题 2 
        由于是在没解决 scss 单独打包时的问题，所以就采用了用两次extract-text-webpack-plugin 
        但这块的test 目录我实在是没弄明白， 我上面是想排除resetStyle以外名字的所有 scss
        下面这块单独匹配resetStyle.scss，然后打包就能打包出来了。不过貌似是我写的有毛病，
        现在还是全打包到一起了
      */
      {
        test: /\.(png|jpg|gif)$/,
        use: ['url-loader?limit=8192&name=/image/[name].[hash:16].[ext]']
      },
      {
        test: /\.(eot|woff|ttf|svg)\??.*$/,
        use: ['url-loader?limit=8192&name=/font/[name].[hash:16].[ext]']
      },
      {
        test: /\.art$/,
        use: ['art-template-loader']
      }
    ]
  },
  
  optimization: {
    splitChunks: {
      cacheGroups: {
        env: {
          // 实际路径
          test: envPath,
          name: "env",
          chunks: "all",
          enforce: true
        },
        common: {
          // 实际路径
          test: path.resolve(__dirname, 'src/js/common/common.js'),
          name: "common",
          chunks: "all",
          enforce: true
        },
        /*
        问题 1
        resetStyle: {
          test: path.resolve(__dirname, 'src/css/resetStyle.scss'),
          name: "resetStyle",
          chunks: "all",
          enforce: true
        }
        之前出问题的代码，我觉得如果可以还是独立打包的好，但目前出的问题是，
        如果这块配置了匹配再对应的Index.js入口文件里只要引入这个scss就一定不报错而且还不运行
        */
      }
    }
  },
  externals: {
    jquery: "jQuery"
  },
  devServer: devServer,
  plugins: [
    new ETPGPage({
      filename: 'css/[name].css',
      ignoreOrder: true
    }),
    new ETPGReset({
      filename: 'css/base.css',
      ignoreOrder: true
    }),
    new webpack.HotModuleReplacementPlugin(),
    /*
    new webpack.ProvidePlugin({
      $: "jquery",
      jQuery: "jquery",
      "window.jQuery": "jquery"
    }),
    new webpack.DefinePlugin({
      '__DEV__': true,
      __envPath__: JSON.stringify(envPath)
    })
    */
  ].concat(htmlPages),
};
module.exports = config;


