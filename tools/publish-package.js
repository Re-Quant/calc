const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

checkMajorNodeVersion();

const availableNpmTags = new Set(['latest', 'rc', 'dev']);
const verRegEx = /^(?<base>\d+\.\d+\.\d+)(?:$|-(?<tag>\w+)\.(?<tagVersion>\d+)$)/;

const root = path.join.bind(path, __dirname, '..');
const { env, isProd, isDev } = getEnv();

const allVersions = getAllVersions();
const { currentBaseVersion, nextBaseVersion } = getBaseVersions();
const variations = allVersions.filter(({ base }) => base === currentBaseVersion);
const isBaseVersionPublished = variations.some(v => !v.tag && !v.tagVersion);

const findNextByTag = (tag, useNextBaseVersion = true) => allVersions
  .filter(({ base }) => base === (useNextBaseVersion ? nextBaseVersion : currentBaseVersion))
  .filter(v => v.tag === tag)
  .map(v => +v.tagVersion)
  .concat(-1)
  .reduce((a, b) => Math.max(a, b)) + 1;

if (isProd) {
  if (isBaseVersionPublished) {
    const nextRcTag = findNextByTag('rc');
    const version = makeVersion(nextBaseVersion, 'rc', nextRcTag);
    saveNewVersionToDist(version);
    publish('rc');
  } else {
    const distPackageJsonPath = root('dist', 'package.json');
    if (fs.existsSync(distPackageJsonPath) && require(distPackageJsonPath).version !== currentBaseVersion) {
      // in the most cases the version is the same, however after deployment in 'dev' mode the version
      // changed until creating new build and should be overwrote for the 'prod' build mode
      saveNewVersionToDist(currentBaseVersion);
    }
    publish();
  }
} else if (isDev) {
  const nextDevTag = findNextByTag('dev', isBaseVersionPublished);
  const version = makeVersion(
    isBaseVersionPublished ? nextBaseVersion : currentBaseVersion,
    'dev',
    nextDevTag,
  );
  saveNewVersionToDist(version);
  publish('dev');
} else {
  throw new Error(`Unsupported environment: '${env}'`);
}

//
// functions
//

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

  execSync(`npm publish dist --access public --tag ${npmTag}`);
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

function getBaseVersions() {
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

  const next = base.replace(/^(\d+)\.(\d+)\.(\d+)$/, (all, major, minor, patch) => `${major}.${minor}.${+patch + 1}`);

  return { currentBaseVersion: base, nextBaseVersion: next };
}

function checkMajorNodeVersion(expected) {
  const actual = +process.version.replace(/^v(\d+)\..*$/, '$1');

  if (expected < actual) {
    throw new Error(`Minimal node version is ${expected}, actual version is ${actual}`);
  }
}
