#!/usr/bin/env node

/**
 * Test Runner - Starts server and runs Nightwatch tests
 * Handles server lifecycle automatically
 */

const { spawn } = require('child_process');
const http = require('http');
const path = require('path');

const SERVER_PORT = 8080;
const SERVER_HOST = 'localhost';
const MAX_WAIT_TIME = 30000; // 30 seconds
const CHECK_INTERVAL = 500; // Check every 500ms

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m'
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

// Check if server is running
function isServerRunning() {
  return new Promise((resolve) => {
    const options = {
      hostname: SERVER_HOST,
      port: SERVER_PORT,
      path: '/',
      method: 'GET',
      timeout: 1000
    };

    const req = http.request(options, (res) => {
      resolve(res.statusCode === 200 || res.statusCode === 304);
    });

    req.on('error', () => {
      resolve(false);
    });

    req.on('timeout', () => {
      req.destroy();
      resolve(false);
    });

    req.end();
  });
}

// Wait for server to be ready
async function waitForServer(timeout = MAX_WAIT_TIME) {
  const startTime = Date.now();

  while (Date.now() - startTime < timeout) {
    if (await isServerRunning()) {
      return true;
    }
    await new Promise(resolve => setTimeout(resolve, CHECK_INTERVAL));
  }

  return false;
}

// Start the HTTP server
function startServer() {
  return new Promise((resolve, reject) => {
    log('🚀 Starting HTTP server...', colors.cyan);

    const server = spawn('npx', ['http-server', '-p', SERVER_PORT.toString(), '--silent'], {
      stdio: 'pipe',
      shell: true,
      detached: process.platform !== 'win32'
    });

    let serverOutput = '';

    server.stdout.on('data', (data) => {
      serverOutput += data.toString();
    });

    server.stderr.on('data', (data) => {
      const message = data.toString();
      if (!message.includes('DeprecationWarning')) {
        log(`Server stderr: ${message}`, colors.yellow);
      }
    });

    server.on('error', (error) => {
      reject(new Error(`Failed to start server: ${error.message}`));
    });

    // Give server time to start, then check if it's running
    setTimeout(async () => {
      const isRunning = await waitForServer();
      if (isRunning) {
        log(`✅ Server running at http://${SERVER_HOST}:${SERVER_PORT}`, colors.green);
        resolve(server);
      } else {
        server.kill();
        reject(new Error('Server failed to start within timeout period'));
      }
    }, 2000);
  });
}

// Run Nightwatch tests
function runTests(testArgs) {
  return new Promise((resolve, reject) => {
    log('🧪 Running Nightwatch tests...', colors.cyan);

    const nightwatchArgs = testArgs.length > 0 ? testArgs : [];
    const nightwatch = spawn('npx', ['nightwatch', ...nightwatchArgs], {
      stdio: 'inherit',
      shell: true
    });

    nightwatch.on('close', (code) => {
      if (code === 0) {
        log('✅ Tests completed successfully!', colors.green);
        resolve(code);
      } else {
        log(`❌ Tests failed with exit code: ${code}`, colors.red);
        resolve(code); // Still resolve, don't reject
      }
    });

    nightwatch.on('error', (error) => {
      reject(new Error(`Failed to run tests: ${error.message}`));
    });
  });
}

// Cleanup function
function cleanup(server) {
  if (server) {
    log('🛑 Stopping server...', colors.yellow);

    if (process.platform === 'win32') {
      // Windows: Use taskkill to ensure all child processes are terminated
      spawn('taskkill', ['/pid', server.pid, '/f', '/t'], { shell: true });
    } else {
      // Unix: Kill the process group
      process.kill(-server.pid, 'SIGTERM');
    }
  }
}

// Main execution
async function main() {
  let server = null;
  let exitCode = 0;

  // Get test arguments (everything after node script.js)
  const testArgs = process.argv.slice(2);

  try {
    // Check if server is already running
    const alreadyRunning = await isServerRunning();

    if (alreadyRunning) {
      log(`ℹ️  Server already running on port ${SERVER_PORT}`, colors.yellow);
      log('   Using existing server for tests', colors.yellow);
    } else {
      // Start the server
      server = await startServer();
    }

    // Run the tests
    exitCode = await runTests(testArgs);

  } catch (error) {
    log(`❌ Error: ${error.message}`, colors.red);
    exitCode = 1;
  } finally {
    // Cleanup
    if (server) {
      cleanup(server);
    }

    // Exit with appropriate code
    process.exit(exitCode);
  }
}

// Handle interrupts
process.on('SIGINT', () => {
  log('\n⚠️  Interrupted by user', colors.yellow);
  process.exit(130);
});

process.on('SIGTERM', () => {
  log('\n⚠️  Terminated', colors.yellow);
  process.exit(143);
});

// Run the main function
main();