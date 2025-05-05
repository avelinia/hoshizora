import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createRequire } from "module";

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create require function
const require = createRequire(import.meta.url);

// Read package.json
const packageJson = require("./package.json");
const version = packageJson.version;

// Update tauri.conf.json
const tauriConfigPath = path.join(__dirname, "src-tauri", "tauri.conf.json");
const tauriConfig = require(tauriConfigPath);
tauriConfig.version = version;
fs.writeFileSync(tauriConfigPath, JSON.stringify(tauriConfig, null, 2) + "\n");
console.log(`Updated tauri.conf.json version to ${version}`);

// Update Cargo.toml
const cargoPath = path.join(__dirname, "src-tauri", "Cargo.toml");
let cargoContent = fs.readFileSync(cargoPath, "utf8");
// Use regex to replace the version line in Cargo.toml
cargoContent = cargoContent.replace(
  /^version = ".*?"$/m,
  `version = "${version}"`
);
fs.writeFileSync(cargoPath, cargoContent);
console.log(`Updated Cargo.toml version to ${version}`);
