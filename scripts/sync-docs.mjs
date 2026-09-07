// Lumen Desktop — Automatic Documentation & Version Synchronizer
// Ensures version consistency across package.json, tauri.conf.json, Cargo.toml, README.md, and CHANGELOG.md

import fs from "fs";
import path from "path";

const rootDir = process.cwd();

const pkgPath = path.join(rootDir, "package.json");
const tauriConfPath = path.join(rootDir, "src-tauri", "tauri.conf.json");
const cargoTomlPath = path.join(rootDir, "src-tauri", "Cargo.toml");
const updaterPath = path.join(rootDir, "src", "lib", "updater.ts");
const changelogPath = path.join(rootDir, "CHANGELOG.md");
const readmePath = path.join(rootDir, "README.md");

const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));
const currentVer = pkg.version;

console.log(`\n🔍 Verifying Lumen Version Synchronization for [v${currentVer}]...\n`);

let errors = 0;

// 1. Verify tauri.conf.json
const tauriConf = JSON.parse(fs.readFileSync(tauriConfPath, "utf8"));
if (tauriConf.version === currentVer) {
  console.log(`  ✅ tauri.conf.json matches v${currentVer}`);
} else {
  console.error(`  ❌ tauri.conf.json version mismatch: expected ${currentVer}, found ${tauriConf.version}`);
  errors++;
}

// 2. Verify Cargo.toml
const cargoContent = fs.readFileSync(cargoTomlPath, "utf8");
if (cargoContent.includes(`version = "${currentVer}"`)) {
  console.log(`  ✅ Cargo.toml matches v${currentVer}`);
} else {
  console.error(`  ❌ Cargo.toml version mismatch: expected version = "${currentVer}"`);
  errors++;
}

// 3. Verify updater.ts
const updaterContent = fs.readFileSync(updaterPath, "utf8");
if (updaterContent.includes(`CURRENT_APP_VERSION = "${currentVer}"`)) {
  console.log(`  ✅ updater.ts matches v${currentVer}`);
} else {
  console.error(`  ❌ updater.ts CURRENT_APP_VERSION mismatch: expected "${currentVer}"`);
  errors++;
}

// 4. Verify CHANGELOG.md
const changelogContent = fs.readFileSync(changelogPath, "utf8");
if (changelogContent.includes(`[v${currentVer}]`)) {
  console.log(`  ✅ CHANGELOG.md contains release notes for v${currentVer}`);
} else {
  console.error(`  ❌ CHANGELOG.md missing release section for [v${currentVer}]`);
  errors++;
}

// 5. Verify README.md
const readmeContent = fs.readFileSync(readmePath, "utf8");
if (readmeContent.includes(`Version-v${currentVer}`)) {
  console.log(`  ✅ README.md version badge matches v${currentVer}`);
} else {
  console.error(`  ❌ README.md badge mismatch: expected Version-v${currentVer}`);
  errors++;
}

console.log(`\n========================================`);
if (errors === 0) {
  console.log(`🎉 ALL 5 VERSION TARGETS SYNCED PERFECTLY (v${currentVer})`);
  console.log(`========================================\n`);
  process.exit(0);
} else {
  console.error(`❌ FOUND ${errors} VERSION SYNC ERRORS!`);
  console.log(`========================================\n`);
  process.exit(1);
}

