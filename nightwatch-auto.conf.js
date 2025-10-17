// Nightwatch configuration with automatic driver management
// This configuration uses Nightwatch's built-in driver management
// which automatically downloads and manages ChromeDriver and GeckoDriver

module.exports = {
  src_folders: ['tests'],
  page_objects_path: ['tests/page-objects'],
  custom_commands_path: [],
  custom_assertions_path: [],
  plugins: [],
  globals_path: './nightwatch.globals.js',

  webdriver: {
    start_process: true,
    server_path: '', // Nightwatch will auto-detect
    cli_args: {}
  },

  test_workers: {
    enabled: true,
    workers: 'auto'
  },

  test_settings: {
    default: {
      disable_error_log: false,
      launch_url: 'http://localhost:8080',

      screenshots: {
        enabled: true,
        path: 'tests_output/screenshots',
        on_failure: true
      },

      desiredCapabilities: {
        browserName: 'chrome'
      },

      webdriver: {
        start_process: true,
        server_path: '' // Auto-managed by Nightwatch
      }
    },

    chrome: {
      desiredCapabilities: {
        browserName: 'chrome',
        'goog:chromeOptions': {
          args: [
            '--no-sandbox',
            '--disable-dev-shm-usage',
            '--disable-gpu',
            '--disable-web-security',
            '--disable-features=VizDisplayCompositor',
            '--window-size=1280,800'
          ],
          prefs: {
            'download.default_directory': './downloads'
          },
          w3c: true
        }
      },

      webdriver: {
        start_process: true,
        server_path: '', // Let Nightwatch manage this
        port: 9515
      }
    },

    'chrome.headless': {
      extends: 'chrome',
      desiredCapabilities: {
        browserName: 'chrome',
        'goog:chromeOptions': {
          args: [
            '--headless=new', // Use new headless mode
            '--no-sandbox',
            '--disable-dev-shm-usage',
            '--disable-gpu',
            '--window-size=1280,800'
          ],
          w3c: true
        }
      }
    },

    firefox: {
      desiredCapabilities: {
        browserName: 'firefox',
        acceptInsecureCerts: true,
        'moz:firefoxOptions': {
          args: [
            '--width=1280',
            '--height=800'
          ],
          prefs: {
            'devtools.console.stdout.content': true
          }
        }
      },

      webdriver: {
        start_process: true,
        server_path: '', // Let Nightwatch manage this
        port: 4444
      }
    },

    'firefox.headless': {
      extends: 'firefox',
      desiredCapabilities: {
        browserName: 'firefox',
        acceptInsecureCerts: true,
        'moz:firefoxOptions': {
          args: [
            '-headless',
            '--width=1280',
            '--height=800'
          ]
        }
      }
    },

    // Edge configuration
    edge: {
      desiredCapabilities: {
        browserName: 'MicrosoftEdge',
        'ms:edgeOptions': {
          args: [
            '--no-sandbox',
            '--disable-dev-shm-usage',
            '--disable-gpu',
            '--window-size=1280,800'
          ],
          w3c: true
        }
      },

      webdriver: {
        start_process: true,
        server_path: '', // Auto-managed
        port: 9516
      }
    },

    // Safari configuration (Mac only)
    safari: {
      desiredCapabilities: {
        browserName: 'safari'
      },

      webdriver: {
        start_process: true,
        server_path: '/usr/bin/safaridriver',
        port: 4445
      }
    }
  }
};