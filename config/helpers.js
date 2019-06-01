const path = require('path');

const ROOT = path.resolve(__dirname, '..');

const root = path.join.bind(path, ROOT);

module.exports.root = root;
