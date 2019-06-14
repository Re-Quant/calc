const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const availableNpmTags = new Set(['latest', 'rc', 'dev']);
const verRegEx = /^(?<base>\d+\.\d+\.\d+)(?:$|-(?<tag>\w+)\.(?<tagVersion>\d+)$)/;

const root = path.join.bind(path, __dirname, '..');
const { env, isProd, isDev } = getEnv();

const allVersions = getAllVersions();
const currentBaseVersion = getCurrentBaseVersion();
const variations = allVersions.filter(({ base }) => base === currentBaseVersion);
const isBaseVersionPublished = variations.some(v => v.base === currentBaseVersion);

const findNextByTag = (tag) => variations.filter(v => v.tag === tag)
                              .map(v => +v.tagVersion)
                              .concat(-1)
                              .reduce((a, b) => Math.max(a, b)) + 1;

if (isProd) {
  const nextRcTag  = findNextByTag('rc');
  if (isBaseVersionPublished) {
    const version = makeVersion(currentBaseVersion, 'rc', nextRcTag);
    saveNewVersionToDist(version);
    publish('rc');
  } else {
    publish();
  }
} else if (isDev) {
  const nextDevTag = findNextByTag('dev');
  const version = makeVersion(currentBaseVersion, 'dev', nextDevTag);
  saveNewVersionToDist(version);
  publish('dev');
} else {
  throw new Error(`Unsupported environment: '${env}'`);
}

function makeVersion(base, tag, tagVersion) {
  return `${base}-${tag}.${tagVersion}`;
}

function getEnv() {
  const rawEnv = process.env.ENV || process.env.NODE_ENV;
  let env;

  switch (rawEnv) {
    case 'prod':
    case 'production':
      env = 'production';
      break;

    case 'dev':
    case 'development':
    case 'test':
      env = 'development';
      break;

    default:
      throw new Error(`Wrong environment: '${rawEnv}'`);
  }

  const isProd = env === 'production';
  const isDev  = env === 'development';

  return {env, isProd, isDev};
}

function publish(npmTag = 'latest') {
  if (!availableNpmTags.has(npmTag)) {
    throw new Error(`Wrong npm tag: ${npmTag}`);
  }

  execSync(`npm run npm:publish -- --tag ${npmTag}`);
}

function saveNewVersionToDist(version) {
  const originalPackageJson = require(root('package.json'));
  const packageJson = { ...originalPackageJson, version };
  const packageJsonStr = JSON.stringify(packageJson, null, 2);
  fs.writeFileSync(root('dist', 'package.json'), packageJsonStr);
}

function getAllVersions() {
  const output = execSync('npm view . versions --json');
  const allVersions = JSON.parse(output.toString());

  return allVersions
    .map(v => v.match(verRegEx))
    .map(v => v && v.groups)
    .filter(Boolean)
    .map(({ base, tag, tagVersion }) => ({ base, tag, tagVersion }));
}

function getCurrentBaseVersion() {
  const packageJson = require(root('package.json'));
  const currentVersion = packageJson.version;
  const info = currentVersion && String(currentVersion).match(verRegEx);

  if (!info || !info.groups) {
    throw new Error(`Wrong current version: ${currentVersion}`);
  }

  const { base, tag, tagVersion } = info.groups;
  if (tag !== undefined || tagVersion !== undefined) {
    throw new Error(`Current version (${base}) should not have tag and tag version: ${tag}.${tagVersion}`);
  }

  return base;
}
