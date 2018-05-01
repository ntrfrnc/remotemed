const path = require('path');
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const isProduction = process.env.NODE_ENV === 'production';

const extractSass = new ExtractTextPlugin({
  filename: 'css/[name].css'
});

const config = {
  entry: {
    'base': './front/base.js',
    'patientPanel': './front/patientPanel/patientPanel.js',
    'doctorPanel': './front/doctorPanel/doctorPanel.js'
  },
  output: {
    path: path.resolve(__dirname, 'public/'),
    filename: 'js/[name].js'
  },
  mode: 'development',
  module: {
    rules: [
      {
        test: /\.scss$/,
        use: extractSass.extract({
          fallback: 'style-loader',
          use: ['css-loader', 'sass-loader']
        })
      }
    ]
  },
  optimization: {
    splitChunks: {
      chunks: "initial",
    },
    runtimeChunk: {
      name: "manifest",
    },
  },
  plugins: [
    extractSass
  ]
};

if (isProduction) {
  config.plugins = config.plugins.concat([
    new OptimizeCssAssetsPlugin({
      assetNameRegExp: /\.css$/,
      cssProcessor: require('cssnano'),
      cssProcessorOptions: {discardComments: {removeAll: true}}
    })]
  );
}

module.exports = config;
