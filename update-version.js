const fs = require('fs');
const path = require('path');

const packageJson = require('./package.json');
const version = packageJson.version;

const tauriConfigPath = path.join(__dirname, 'src-tauri', 'tauri.conf.json');
const tauriConfig = require(tauriConfigPath);

tauriConfig.version = version;

fs.writeFileSync(
    tauriConfigPath,
    JSON.stringify(tauriConfig, null, 2) + '\n'
);

console.log(`Updated tauri.conf.json version to ${version}`);