'use strict';

const wallabyWebpack = require('wallaby-webpack');
const webpackMerge   = require('webpack-merge');

const wallabyPostprocessor = wallabyWebpack(
  webpackMerge(
    require('./webpack/webpack.wallabyjs')({ env: 'test' }),
    {
      entryPatterns: [
        'src/chai/index.js',
        'src/**/*.spec.js',
        // 'src/**/*.js',
      ],
    },
  ),
);

module.exports = function (w) {

  return {
    files: [
      { pattern: 'src/chai/index.ts', load: false },
      { pattern: 'src/**/*.ts', load: false },
      { pattern: 'src/**/*.spec.ts', ignore: true },
    ],

    tests: [
      { pattern: 'src/**/*.spec.ts', load: false, instrument: true },
    ],


    postprocessor: wallabyPostprocessor,

    testFramework: 'mocha',


    env: {
      kind:   'chrome',
      // runner: '/Users/user/path/to/chrome',
      params: { runner: '--web-security=false --headless' }
    },

    compilers: {
      '**/*.ts': w.compilers.typeScript({
        typescript: require('typescript'),
      }),
    },


    setup: function () {
      window.__moduleBundler.loadTests();
    },

    debug: true,

  };
};
