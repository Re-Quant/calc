# Z-Brain Calc

## Environment

* [ESLint](https://eslint.org) for linting JS & TS files ([TSLint is deprecated in 2019](https://github.com/palantir/tslint#tslint)). Basic rules configured.
* Very strict linting [config](/src/.eslintrc.js) ([airbnb](https://www.npmjs.com/package/eslint-config-airbnb-base) + [unicorn](https://www.npmjs.com/package/eslint-plugin-unicorn) + [some other plugins](/src/.eslintrc.js#L11))
* [TypeScript](http://typescriptlang.org/) 3.6+ via [Babel](https://babeljs.io/docs/en/babel-preset-typescript)
* Yarn for packages installation and [`check-yarn`](/tools/check-yarn.js) utility to prevent packages installation via `npm`
* [`.nvmrc`](https://github.com/nvm-sh/nvm#nvmrc)
* Nothing platform related. This repository template can be used for NodeJS and for Browser development.
* [Utility](/tools/merge-with-repository-template.sh) to automatically pull updates from this template repository (`npm run merge-tpl-repo`)
* Git hooks via [husky](https://www.npmjs.com/package/husky)
    * pre-push `npm run prepush`
    * post-merge `yarn install`

## How to

### How to use

```sh
cd /code/z-brain
git clone git@github.com:z-brain/calc.git calc
cd calc
yarn install

npm run merge-tpl-repo
```

### How to use NodeJS version from the `.nvmrc`

1. Install NVM
2. Use `.nvmrc` file one of the next ways:

    * Execute `nvm use` in the project root directory
    * Install [NVM Loader](https://github.com/korniychuk/ankor-shell) and your .nvmrc will be loaded automatically when you open the terminal.
      ![NVM Loader demo](./resources/readme.nvm-loader.png)

### How to make a build

`npm run build`

### How to run lint

* Just show problems `npm run lint`
* Fix problems if it is possible `npm run lint:fix`

### How to run tests

* All tests

  `npm run test`  
  `npm run test:watch`
* Specific tests

  `npm run test -- src/my.spec.ts`  
  `npm run test:watch -- src/my.spec.ts`

## Authors

| [<img src="https://www.korniychuk.pro/avatar.jpg" width="100px;"/><br /><sub>Anton Korniychuk</sub>](https://korniychuk.pro) |
| :---: |
