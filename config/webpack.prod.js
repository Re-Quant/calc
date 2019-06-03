const webpackMerge = require('webpack-merge');
const CopyPlugin = require('copy-webpack-plugin');

const commonConfig = require('./webpack.common');

/**
 * Webpack configuration
 *
 * See: https://webpack.js.org/configuration/
 */
module.exports = function(options) {
  const ENV = (process.env.ENV = process.env.NODE_ENV = 'production');

  return webpackMerge(commonConfig({ env: ENV }), {
    /**
     * Add additional plugins to the compiler.
     *
     * See: https://webpack.js.org/configuration/plugins/
     */
    plugins: [

      /**
       * See: https://webpack.js.org/plugins/copy-webpack-plugin
       */
      new CopyPlugin([
        { from: 'README.md',    to: '.' },
        { from: 'package.json', to: '.' },
        { from: 'LICENSE',      to: '.' },
      ]),
    ],
  });
};
