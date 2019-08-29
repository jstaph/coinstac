'use strict';

const convict = require('convict');
const pify = require('util').promisify;
const access = pify(require('fs').access);
const path = require('path');

const localConfig = path.resolve(__dirname, '..', 'config', 'local.json');

const fileExists = (fPath) => {
  return access(fPath).then(() => true, () => false);
};

const conf = convict({
  env: {
    doc: 'The applicaton environment.',
    format: ['production', 'development'],
    default: 'production',
    env: 'NODE_ENV',
  },
  apiServer: {
    hostname: 'coinstac.rs.gsu.edu',
    pathname: '/api',
    protocol: 'https:',
  },
  subApiServer: {
    hostname: 'coinstac.rs.gsu.edu',
    pathname: '/ws',
    port: '443',
    protocol: 'wss:',
  },
  fileServer: {
    hostname: 'coinstac.rs.gsu.edu',
    pathname: '/transfer',
    port: '443',
    protocol: 'https:',
  },
  mqttServer: {
    hostname: 'coinstac.rs.gsu.edu',
    pathname: '',
    port: '80',
    protocol: 'mqtts:',
  },

  logFile: 'coinstac-log.json',
  logFileBoot: 'coinstac-boot-error-log.txt',
  // these are appended to the home dir for you OS
  // *nix: ~/.config/coinstac
  // win: C:\Users\username\AppData\Local\Temp\coinstac
  logLocations: {
    darwin: 'Library/Logs/coinstac/',
    freebsd: '.config/coinstac/',
    linux: '.config/coinstac/',
    sunos: '.config/coinstac/',
    win32: 'coinstac/',
  },
});

module.exports = function loadConfig() {
  if (conf.get('env') === 'production') {
    return Promise.resolve(conf);
  }

  return fileExists(localConfig)
    .then((exists) => {
      if (exists) {
        conf.loadFile(localConfig);
      }
      return conf;
    });
};
