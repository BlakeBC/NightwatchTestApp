/**
 * Nightwatch Global Hooks
 * Manages server lifecycle and test environment setup
 */

const { spawn } = require('child_process');
const http = require('http');

const SERVER_PORT = 8080;
const SERVER_HOST = 'localhost';
let serverProcess = null;

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

    req.on('error', () => resolve(false));
    req.on('timeout', () => {
      req.destroy();
      resolve(false);
    });

    req.end();
  });
}

// Wait for server
async function waitForServer(timeout = 30000) {
  const startTime = Date.now();

  while (Date.now() - startTime < timeout) {
    if (await isServerRunning()) {
      return true;
    }
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  return false;
}

module.exports = {
  // This will be run before the test suite starts
  before: function(done) {
    console.log('🔧 Setting up test environment...');

    // Check if we should manage the server
    if (process.env.NIGHTWATCH_SKIP_SERVER === 'true') {
      console.log('⏭️  Skipping server management (NIGHTWATCH_SKIP_SERVER=true)');
      done();
      return;
    }

    // Check if server is already running
    isServerRunning().then(running => {
      if (running) {
        console.log('✅ Server already running on port', SERVER_PORT);
        done();
      } else {
        console.log('🚀 Starting HTTP server...');

        serverProcess = spawn('npx', ['http-server', '-p', SERVER_PORT.toString(), '--silent'], {
          stdio: 'pipe',
          shell: true,
          detached: process.platform !== 'win32'
        });

        serverProcess.on('error', (error) => {
          console.error('❌ Failed to start server:', error);
          done(error);
        });

        // Wait for server to be ready
        setTimeout(() => {
          waitForServer().then(ready => {
            if (ready) {
              console.log('✅ Server started successfully');
              done();
            } else {
              console.error('❌ Server failed to start');
              done(new Error('Server failed to start'));
            }
          });
        }, 2000);
      }
    });
  },

  // This will be run after the test suite finishes
  after: function(done) {
    console.log('🧹 Cleaning up test environment...');

    if (serverProcess) {
      console.log('🛑 Stopping server...');

      if (process.platform === 'win32') {
        spawn('taskkill', ['/pid', serverProcess.pid, '/f', '/t'], { shell: true });
      } else {
        process.kill(-serverProcess.pid, 'SIGTERM');
      }

      serverProcess = null;
    }

    done();
  },

  // Custom reporter output
  reporter: function(results) {
    console.log('\n📊 Test Results Summary:');
    console.log('========================');

    if (results.failed === 0 && results.errors === 0) {
      console.log('✅ All tests passed!');
    } else {
      console.log(`❌ Tests failed: ${results.failed} failures, ${results.errors} errors`);
    }

    console.log(`Total: ${results.total} tests`);
    console.log(`Passed: ${results.passed}`);
    console.log(`Failed: ${results.failed}`);
    console.log(`Errors: ${results.errors}`);
    console.log(`Skipped: ${results.skipped}`);
    console.log(`Time: ${results.time}ms`);
  },

  // Test settings that will be available in all tests
  testTimeout: 10000,
  asyncHookTimeout: 30000,
  throwOnMultipleElementsReturned: false,

  // Custom assertions timeout
  waitForConditionTimeout: 5000,
  retryAssertionTimeout: 5000,

  // Screenshot settings
  screenshotOnFail: true,

  // Environment variables for tests
  testEnv: {
    SERVER_URL: `http://${SERVER_HOST}:${SERVER_PORT}`,
    SERVER_PORT: SERVER_PORT,
    SERVER_HOST: SERVER_HOST
  }
};