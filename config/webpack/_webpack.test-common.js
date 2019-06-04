const ProvidePlugin = require('webpack/lib/ProvidePlugin');

module.exports = (options) => {
  const isProd = options.env === 'production';

  return {
    mode: 'development',
    /**
     * Notice: Wallaby.js doesn't show errors correctly for eval-* devtool's values.
     */
    devtool: 'source-map',

    /**
     * Add additional plugins to the compiler.
     *
     * See: https://webpack.js.org/configuration/plugins/
     */
    plugins: [
      /**
       * The ProvidePlugin makes a package available as a variable in every module compiled through webpack.
       *
       * See: https://webpack.js.org/guides/shimming/#shimming-globals
       */
      new ProvidePlugin({
        expect: ['chai', 'expect'],
      }),
    ],
  };
};
