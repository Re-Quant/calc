const { CheckerPlugin } = require('awesome-typescript-loader');
const DefinePlugin = require('webpack/lib/DefinePlugin');

const { root } = require('./helpers');

module.exports = (options) => {
  const isProd = options.env === 'production';

  return {
    mode:    isProd ? 'production' : 'development',
    devtool: isProd ? 'source-map' : 'eval-source-map',
    entry: root('src/index.ts'),
    target: 'node',

    output: {
      filename: 'index.js',
      path: root('./dist'),
    },

    module: {
      rules: [
        {
          test: /\.ts$/,
          loader: 'awesome-typescript-loader',
          exclude: /node_modules/,
          // options: {
          //   useCache: true,
          // },
        },
      ]
    },

    /**
     * Options affecting the resolving of modules.
     *
     * See: https://webpack.js.org/configuration/resolve/
     */
    resolve: {
      /**
       * An array of extensions that should be used to resolve modules.
       *
       * See: https://webpack.js.org/configuration/resolve/#resolve-extensions
       */
      extensions: ['.ts', '.js', '.json'],

      /**
       * Make sure root is src
       */
      modules: [root('src'), root('node_modules')],
    },

    /**
     * Add additional plugins to the compiler.
     *
     * See: https://webpack.js.org/configuration/plugins/
     */
    plugins: [
      /**
       * Plugin: DefinePlugin
       * Description: Define free variables.
       * Useful for having development builds with debug logging or adding global constants.
       *
       * Environment helpers
       *
       * See: https://webpack.js.org/plugins/define-plugin/
       */
      // NOTE: when adding more properties make sure you include them in custom-typings.d.ts
      new DefinePlugin({
        ENV:         JSON.stringify(options.env),
        IS_ENV_DEV:  JSON.stringify(options.env === 'development'),
        IS_ENV_PROD: JSON.stringify(options.env === 'production'),
        IS_ENV_TEST: JSON.stringify(options.env === 'test'),
      }),

      new CheckerPlugin(),
    ],
  };
};
