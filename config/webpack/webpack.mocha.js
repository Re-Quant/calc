const webpackMerge = require('webpack-merge');
const nodeExternals = require('webpack-node-externals');

const commonConfig = require('./_webpack.common');
const testCommonConfig = require('./_webpack.test-common');

/**
 * Webpack configuration
 *
 * See: https://webpack.js.org/configuration/
 */
module.exports = function(options) {
  const ENV = (process.env.ENV = process.env.NODE_ENV = 'test');

  return webpackMerge(
    commonConfig({ env: ENV }),
    testCommonConfig({ env: ENV }),
    {
      output: {
        // use absolute paths in sourcemaps (important for debugging via IDE)
        devtoolModuleFilenameTemplate:         '[absolute-resource-path]',
        devtoolFallbackModuleFilenameTemplate: '[absolute-resource-path]?[hash]'
      },

      externals: [ nodeExternals() ], // in order to ignore all modules in node_modules folder
    },
  );
};
