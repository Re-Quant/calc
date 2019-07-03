const webpackMerge = require('webpack-merge');

const commonConfig = require('./_webpack.common');
const testCommonConfig = require('./_webpack.test-common');

/**
 * Webpack configuration
 *
 * See: https://webpack.js.org/configuration/
 */
module.exports = function(options) {
  const ENV = (process.env.ENV = process.env.NODE_ENV = 'test');

  const config = webpackMerge(
    commonConfig({ env: ENV }),
    testCommonConfig({ env: ENV }),
  );

  config.resolve.extensions = config.resolve.extensions.filter(item => item !== '.ts');
  config.module.rules = config.module.rules.filter(v => v.loader !== 'ts-loader');
  return config;
};
