'use strict';

const wallabyWebpack = require('wallaby-webpack');
const webpackMerge   = require('webpack-merge');

const wallabyPostprocessor = wallabyWebpack(
  webpackMerge(
    require('./webpack/webpack.wallabyjs')({ env: 'test' }),
    {
      entryPatterns: [
        'src/**/*.spec.js',
        // 'src/**/*.js',
      ],
    },
  ),
);

module.exports = function (w) {

  return {
    files: [
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


    setup: function () {
      window.__moduleBundler.loadTests();
    },

    debug: true,

  };
};
