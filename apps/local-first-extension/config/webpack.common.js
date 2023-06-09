'use strict';

const CopyWebpackPlugin = require('copy-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

const PATHS = require('./paths');

// used in the module rules and in the stats exlude list
const IMAGE_TYPES = /\.(png|jpe?g|gif|svg)$/i;

// To re-use webpack configuration across templates,
// CLI maintains a common webpack configuration file - `webpack.common.js`.
// Whenever user creates an extension, CLI adds `webpack.common.js` file
// in template's `config` folder
const common = {
  output: {
    // the build folder to output bundles and assets in.
    path: PATHS.build,
    // the filename template for entry chunks
    filename: '[name].js',
    publicPath: '/',
  },
  stats: {
    all: false,
    errors: true,
    builtAt: true,
    assets: true,
    excludeAssets: [IMAGE_TYPES],
  },
  module: {
    rules: [
      // Help webpack in understanding CSS files imported in .js files
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader', 'postcss-loader'],
      },
      // Check for images imported in .js files and
      {
        test: IMAGE_TYPES,
        use: [
          {
            loader: 'file-loader',
            options: {
              outputPath: 'images',
              name: '[name].[ext]',
            },
          },
        ],
      },
    ],
  },
  plugins: [
    // Copy static assets from `public` folder to `build` folder
    new CopyWebpackPlugin({
      patterns: [
        {
          from: '**/*',
          context: 'public',
        },
      ],
    }),
  ],
  experiments: { asyncWebAssembly: true, topLevelAwait: true },
  performance: {
    // we dont want the wasm blob to generate warnings
    hints: false,
    maxEntrypointSize: 512000,
    maxAssetSize: 512000,
  },
  resolve: {
    fallback: {
      stream: require.resolve('stream-browserify'),
      querystring: require.resolve('querystring-es3'),
      url: require.resolve('url/'),
      assert: require.resolve('assert/'),
      util: require.resolve('util/'),
      crypto: require.resolve('crypto-browserify'),
    },
  },
};

module.exports = common;
