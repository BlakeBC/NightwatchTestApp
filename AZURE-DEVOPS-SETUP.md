# Azure DevOps Setup Guide for Nightwatch Tests

## Overview

This project includes Azure DevOps pipelines that automatically run Nightwatch E2E tests across multiple browsers and operating systems.

## How It Works

### Local Testing
```bash
# Tests automatically start the server - no need to run npm start!
npm test              # Run all tests
npm run test:chrome   # Chrome only
npm run test:headless # Headless Chrome
```

### Server Management
- **Automatic**: The `test-runner.js` script automatically starts/stops the HTTP server
- **Smart Detection**: Checks if server is already running to avoid conflicts
- **Cross-platform**: Works on Windows, Mac, and Linux

## Azure DevOps Configuration

### 1. Choose Your Pipeline

We provide two pipeline configurations:

#### Option A: `azure-pipelines-fixed.yml` (Recommended)
- Automatic server management
- Multi-OS testing (Linux, Windows, macOS)
- Proper ChromeDriver handling
- Built-in retry logic

#### Option B: `azure-pipelines.yml` (Basic)
- Single OS (Ubuntu)
- Manual server management
- Simpler configuration

### 2. Import to Azure DevOps

1. Create a new pipeline in Azure DevOps
2. Select your GitHub repository
3. Choose "Existing Azure Pipelines YAML file"
4. Select `/azure-pipelines-fixed.yml`
5. Run the pipeline

### 3. How ChromeDriver Works in Azure

#### The Problem
- ChromeDriver version must match Chrome browser version
- Azure agents have pre-installed Chrome
- Path resolution differs between OS

#### Our Solution
1. **Automatic Download**: npm installs correct ChromeDriver version
2. **Path Resolution**: Uses `require('chromedriver').path` for cross-platform support
3. **Fallback Options**: Multiple configurations (nightwatch.conf.js, nightwatch-auto.conf.js)
4. **Verification**: Setup script validates driver installation

### 4. Pipeline Stages

```yaml
Test Stage (Linux):
  ├── Chrome Browser Tests
  ├── Chrome Headless Tests
  └── Firefox Tests

Windows Test Stage:
  └── Chrome Headless Tests

macOS Test Stage:
  └── Chrome Headless Tests

Report Stage:
  └── Summary Generation
```

## Troubleshooting

### Tests Fail - No Server Running

**Solution**: Use the npm test commands (not nightwatch directly)
```bash
# Good - auto-starts server
npm test

# Bad - no server management
npx nightwatch
```

### ChromeDriver Version Mismatch

**Solution**: The pipeline automatically handles this, but locally:
```bash
npm run setup  # Verifies and fixes driver issues
```

### Tests Pass Locally but Fail in Pipeline

**Common Causes**:
1. **Timing Issues**: Azure agents may be slower
   - Increase timeouts in tests
2. **Display Issues**: Headless mode behaves differently
   - Use `--headless` tests locally to debug
3. **Path Issues**: Windows vs Linux paths
   - Our configs handle this automatically

## Pipeline Variables

Set these in Azure DevOps for customization:

| Variable | Default | Description |
|----------|---------|-------------|
| NODE_VERSION | 18.x | Node.js version |
| NPM_CONFIG_CACHE | $(Pipeline.Workspace)/.npm | NPM cache location |

## Artifacts

The pipeline publishes:
- **Test Results**: JUnit XML format (visible in Tests tab)
- **Screenshots**: Captured on test failures
- **Logs**: Console output from test execution

## Best Practices

1. **Always use test-runner.js**: It manages the server lifecycle
2. **Test locally first**: Run `npm run test:headless` before pushing
3. **Check driver versions**: Run `npm run setup` after Chrome updates
4. **Use the fixed pipeline**: `azure-pipelines-fixed.yml` is more robust

## Quick Commands Reference

```bash
# Local development
npm install           # Install dependencies
npm run setup        # Verify driver setup
npm test             # Run all tests (auto-starts server)
npm run test:chrome  # Chrome with GUI
npm run test:headless # Chrome headless
npm start            # Manual server (port 8080)

# Debugging
npm run test:debug   # Verbose output
npm run test:noserver # Run without auto-server

# Quick test
.\test-quick.bat     # Windows quick test script
```

## Server Ports

- **Game Server**: http://localhost:8080
- **ChromeDriver**: Port 9515
- **GeckoDriver**: Port 4444

## Support

For issues:
1. Check `tests_output/` folder for logs
2. Review screenshots in `tests_output/screenshots/`
3. Run `npm run setup` to verify environment
4. Use `npm run test:debug` for verbose output

## Example Azure DevOps Success

When everything works, you'll see:
```
✅ Server started successfully
✅ Tests completed: 48 passed
✅ Screenshots: None (all tests passed)
✅ Artifacts published
```

The Tests tab in Azure DevOps will show detailed results for each browser and OS.