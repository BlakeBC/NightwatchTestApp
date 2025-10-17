#!/usr/bin/env node

/**
 * Simple CI server starter for Azure DevOps
 * Starts http-server and waits for it to be ready
 */

const { spawn } = require('child_process');
const http = require('http');

const PORT = 8080;
const MAX_RETRIES = 120; // 120 * 500ms = 60 seconds
let retries = 0;

console.log('Starting server for CI environment...');

// Start http-server
const server = spawn('npx', ['http-server', '-p', PORT.toString(), '--cors', '-c-1'], {
  stdio: 'inherit',
  shell: true,
  detached: false
});

// Function to check if server is ready
function checkServer() {
  const options = {
    hostname: 'localhost',
    port: PORT,
    path: '/',
    method: 'GET',
    timeout: 1000
  };

  const req = http.request(options, (res) => {
    if (res.statusCode === 200 || res.statusCode === 304) {
      console.log(`✅ Server is ready at http://localhost:${PORT}`);
      console.log('Server PID:', server.pid);
      // Don't exit - keep the server running
    } else {
      retry();
    }
  });

  req.on('error', () => {
    retry();
  });

  req.on('timeout', () => {
    req.destroy();
    retry();
  });

  req.end();
}

function retry() {
  retries++;
  if (retries < MAX_RETRIES) {
    setTimeout(checkServer, 500);
  } else {
    console.error('❌ Server failed to start after 60 seconds');
    server.kill();
    process.exit(1);
  }
}

// Wait a bit then start checking
setTimeout(checkServer, 3000);

// Handle process termination
process.on('SIGINT', () => {
  console.log('\nStopping server...');
  server.kill();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\nTerminating server...');
  server.kill();
  process.exit(0);
});