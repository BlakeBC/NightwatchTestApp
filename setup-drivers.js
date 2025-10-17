#!/usr/bin/env node

/**
 * Driver Setup Script for Nightwatch Tests
 * This script ensures ChromeDriver and GeckoDriver are properly installed
 */

const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');
const os = require('os');

const isWindows = os.platform() === 'win32';
const driverExt = isWindows ? '.exe' : '';

console.log('🚀 Setting up WebDriver binaries for Nightwatch...\n');

// Check Chrome version
function getChromeVersion() {
  return new Promise((resolve) => {
    let command;

    if (isWindows) {
      command = 'reg query "HKEY_CURRENT_USER\\Software\\Google\\Chrome\\BLBeacon" /v version';
    } else if (os.platform() === 'darwin') {
      command = '/Applications/Google\\ Chrome.app/Contents/MacOS/Google\\ Chrome --version';
    } else {
      command = 'google-chrome --version || chromium-browser --version';
    }

    exec(command, (error, stdout) => {
      if (error) {
        console.warn('⚠️  Could not detect Chrome version');
        resolve(null);
        return;
      }

      const versionMatch = stdout.match(/(\d+)\.\d+\.\d+/);
      if (versionMatch) {
        const majorVersion = versionMatch[1];
        console.log(`✓ Chrome version ${versionMatch[0]} detected (major: ${majorVersion})`);
        resolve(majorVersion);
      } else {
        console.warn('⚠️  Could not parse Chrome version');
        resolve(null);
      }
    });
  });
}

// Check Firefox version
function getFirefoxVersion() {
  return new Promise((resolve) => {
    const command = isWindows ? 'firefox -v' : 'firefox --version';

    exec(command, (error, stdout) => {
      if (error) {
        console.warn('⚠️  Could not detect Firefox version');
        resolve(null);
        return;
      }

      const versionMatch = stdout.match(/(\d+)\.\d+/);
      if (versionMatch) {
        console.log(`✓ Firefox version ${versionMatch[0]} detected`);
        resolve(versionMatch[0]);
      } else {
        console.warn('⚠️  Could not parse Firefox version');
        resolve(null);
      }
    });
  });
}

// Verify driver installation
function verifyDriver(driverName) {
  const driverPath = path.join('node_modules', '.bin', driverName + driverExt);

  if (fs.existsSync(driverPath)) {
    console.log(`✓ ${driverName} found at: ${driverPath}`);

    // Check if executable
    try {
      fs.accessSync(driverPath, fs.constants.X_OK);
      console.log(`✓ ${driverName} is executable`);
      return true;
    } catch (err) {
      if (isWindows) {
        // Windows doesn't use X_OK the same way
        return true;
      }
      console.warn(`⚠️  ${driverName} is not executable. Fixing...`);
      fs.chmodSync(driverPath, '755');
      console.log(`✓ Made ${driverName} executable`);
      return true;
    }
  } else {
    console.error(`✗ ${driverName} not found at expected location`);
    return false;
  }
}

// Create driver wrapper scripts for Windows
function createWindowsWrappers() {
  if (!isWindows) return;

  const wrappers = [
    {
      name: 'chromedriver.cmd',
      content: '@echo off\nnode_modules\\.bin\\chromedriver.exe %*'
    },
    {
      name: 'geckodriver.cmd',
      content: '@echo off\nnode_modules\\.bin\\geckodriver.exe %*'
    }
  ];

  wrappers.forEach(wrapper => {
    const wrapperPath = path.join('node_modules', '.bin', wrapper.name);
    fs.writeFileSync(wrapperPath, wrapper.content);
    console.log(`✓ Created Windows wrapper: ${wrapper.name}`);
  });
}

// Main setup function
async function setup() {
  console.log('System Information:');
  console.log(`- Platform: ${os.platform()}`);
  console.log(`- Architecture: ${os.arch()}`);
  console.log(`- Node.js: ${process.version}`);
  console.log();

  // Check browser versions
  const chromeVersion = await getChromeVersion();
  const firefoxVersion = await getFirefoxVersion();

  console.log('\nVerifying WebDriver installations:');

  // Verify drivers
  const chromedriverOk = verifyDriver('chromedriver');
  const geckodriverOk = verifyDriver('geckodriver');

  // Create Windows wrappers if needed
  if (isWindows) {
    console.log('\nCreating Windows wrapper scripts...');
    createWindowsWrappers();
  }

  // Generate configuration recommendations
  console.log('\n📋 Configuration Recommendations:');
  console.log('================================');

  if (!chromedriverOk) {
    console.log('\n⚠️  ChromeDriver not found. Run: npm install chromedriver');
  }

  if (!geckodriverOk) {
    console.log('\n⚠️  GeckoDriver not found. Run: npm install geckodriver');
  }

  if (chromeVersion) {
    console.log(`\n✓ Chrome ${chromeVersion} is installed`);
    console.log('  Use: npm test -- --env chrome');
  } else {
    console.log('\n⚠️  Chrome not detected. Install from: https://www.google.com/chrome/');
  }

  if (firefoxVersion) {
    console.log(`\n✓ Firefox ${firefoxVersion} is installed`);
    console.log('  Use: npm test -- --env firefox');
  } else {
    console.log('\n⚠️  Firefox not detected. Install from: https://www.mozilla.org/firefox/');
  }

  console.log('\n📝 Available Nightwatch configurations:');
  console.log('  - nightwatch.conf.js (default with manual paths)');
  console.log('  - nightwatch-auto.conf.js (automatic driver management)');

  console.log('\nTo use automatic driver management:');
  console.log('  npm test -- --config nightwatch-auto.conf.js');

  console.log('\n✅ Setup verification complete!');

  // Test driver startup
  console.log('\n🧪 Testing driver startup...');

  if (chromedriverOk) {
    exec(`${path.join('node_modules', '.bin', 'chromedriver')} --version`, (error, stdout) => {
      if (!error) {
        console.log(`✓ ChromeDriver: ${stdout.trim()}`);
      } else {
        console.error('✗ ChromeDriver startup failed:', error.message);
      }
    });
  }

  if (geckodriverOk) {
    exec(`${path.join('node_modules', '.bin', 'geckodriver')} --version`, (error, stdout) => {
      if (!error) {
        const version = stdout.split('\n')[0];
        console.log(`✓ GeckoDriver: ${version}`);
      } else {
        console.error('✗ GeckoDriver startup failed:', error.message);
      }
    });
  }
}

// Run setup
setup().catch(console.error);