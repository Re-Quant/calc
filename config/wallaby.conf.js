'use strict';

const wallabyWebpack = require('wallaby-webpack');
const webpackMerge   = require('webpack-merge');

const commonConfig = require('./webpack.common')({ env: 'test' });

const wallabyPostprocessor = wallabyWebpack(
  webpackMerge(
    commonConfig,
    {
      entryPatterns: [
        // 'src/**/*.js',
        'src/**/*.spec.js',
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
      { pattern: 'src/**/*.spec.ts', load: false },
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











// const { root } = require('./helpers');
//
// module.exports = function (w) {
//   // w.projectCacheDir = root('.wallaby.js-cache');
//   console.log('w', w.projectCacheDir, w.localProjectDir);
//   // console.log();
//
//   return {
//     files: [
//       'src/**/*.ts',
//       '!src/**/*.spec.ts',
//     ],
//
//     tests: [
//       'src/**/*.spec.ts',
//     ],
//
//     env: {
//       type: 'node',
//       // kind:   'chrome',
//       // // runner: '/Users/user/path/to/chrome',
//       // params: { runner: '--web-security=false --headless' }
//     },
//
//     compilers: {
//       '**/*.ts': w.compilers.typeScript({
//         typescript: require('typescript'),
//         // module: 'es2015',
//         // "paths": {
//         //   "*": ["./node_modules/*", "./src/*"]
//         // },
//       })
//     },
//
//     debug: true,
//
//   };
// };









// module.exports = function (w) {
//
//   return {
//     files: [
//       'src/**/*.ts'
//     ],
//
//     tests: [
//       'src/**/*.spec.ts'
//     ],
//
//     env: {
//       type: 'node'
//     },
//
//     // or any other supported testing framework:
//     // https://wallabyjs.com/docs/integration/overview.html#supported-testing-frameworks
//     testFramework: 'mocha'
//   };
// };









// 'use strict';
//
// const wallabyWebpack = require('wallaby-webpack');
// // const webpackMerge   = require('webpack-merge');
// //
// // const { entry: _entry, ...commonConfig } = require('./webpack.common')({ env: 'test' });
// //
// // const webpackPostprocessor = wallabyWebpack(
// //   webpackMerge(
// //     commonConfig,
// //     {
// //       entryPatterns: [
// //         // 'config/webpack/spec-bundle.js',
// //         'src/**/*.spec.js',
// //       ],
// //     },
// //   ),
// // );
//
// module.exports = function (wallaby) {
//
//   return {
//     files: [
//       // 'src/**/*.ts',
//       { pattern: 'src/**/*.ts', load: false },
//       { pattern: 'src/**/*.spec.ts', ignore: true }
//     ],
//
//     tests: [
//       { pattern: 'src/**/*.spec.ts', load: false },
//       // 'src/**/*.spec.ts',
//     ],
//
//     testFramework: 'mocha',
//
//     env: {
//       type: 'node'
//       // kind:   'chrome',
//       // // runner: '/Users/user/path/to/chrome',
//       // params: { runner: '--web-security=false --headless' }
//     },
//
//     compilers: {
//       '**/*.ts': wallaby.compilers.typeScript({
//         typescript: require('typescript'),
//         // module: 'commonjs',
//         // jsx: 'React'
//       })
//     },
//
//     // postprocessor: webpackPostprocessor,
//     // postprocessor: wallabyWebpack({}),
//
//     // setup: function () {
//     //   window.__moduleBundler.loadTests();
//     // },
//
//     debug: true
//   };
// };











// 'use strict';
//
// const wallabyWebpack = require('wallaby-webpack');
// // const webpackMerge   = require('webpack-merge');
// //
// // const { entry: _entry, ...commonConfig } = require('./webpack.common')({ env: 'test' });
// //
// // const webpackPostprocessor = wallabyWebpack(
// //   webpackMerge(
// //     commonConfig,
// //     {
// //       entryPatterns: [
// //         // 'config/webpack/spec-bundle.js',
// //         'src/**/*.spec.js',
// //       ],
// //     },
// //   ),
// // );
//
// module.exports = function (wallaby) {
//
//   return {
//     files: [
//       'src/**/*.ts',
//       // { pattern: 'src/**/*.ts', load: false },
//       // { pattern: 'src/**/*.spec.ts', ignore: true }
//     ],
//
//     tests: [
//       // { pattern: 'src/**/*.spec.ts', load: false },
//       'src/**/*.spec.ts',
//     ],
//
//     // testFramework: 'mocha',
//
//     env: {
//       kind:   'chrome',
//       // runner: '/Users/user/path/to/chrome',
//       params: { runner: '--web-security=false --headless' }
//     },
//
//     compilers: {
//       '**/*.ts': wallaby.compilers.typeScript({
//         typescript: require('typescript'),
//         // module: 'commonjs',
//         // jsx: 'React'
//       })
//     },
//
//     // postprocessor: webpackPostprocessor,
//     postprocessor: wallabyWebpack({}),
//
//     // setup: function () {
//     //   window.__moduleBundler.loadTests();
//     // },
//
//     debug: true
//   };
// };
