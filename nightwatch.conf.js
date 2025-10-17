module.exports = {
  // An array of folders (excluding subfolders) where your tests are located;
  // if this is not specified, the test source must be passed as the second argument to the test runner.
  src_folders: ['tests'],

  // See https://nightwatchjs.org/guide/concepts/page-object-model.html
  page_objects_path: ['tests/page-objects'],

  // See https://nightwatchjs.org/guide/extending-nightwatch/adding-custom-commands.html
  custom_commands_path: [],

  // See https://nightwatchjs.org/guide/extending-nightwatch/adding-custom-assertions.html
  custom_assertions_path: [],

  // See https://nightwatchjs.org/guide/extending-nightwatch/adding-plugins.html
  plugins: [],

  // See https://nightwatchjs.org/guide/concepts/test-globals.html
  globals_path: '',

  webdriver: {
    start_process: true,
    server_path: '',
    cli_args: {
      'webdriver.chrome.driver': '',
      'webdriver.gecko.driver': ''
    }
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
        server_path: ''
      }
    },

    chrome: {
      desiredCapabilities: {
        browserName: 'chrome',
        'goog:chromeOptions': {
          // More info on Chromedriver: https://sites.google.com/a/chromium.org/chromedriver/
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
        server_path: require('chromedriver').path,
        port: 9515,
        cli_args: [
          '--port=9515'
        ]
      }
    },

    'chrome.headless': {
      extends: 'chrome',
      desiredCapabilities: {
        browserName: 'chrome',
        'goog:chromeOptions': {
          args: [
            '--headless',
            '--no-sandbox',
            '--disable-dev-shm-usage',
            '--window-size=1280,800'
          ]
        }
      }
    },

    firefox: {
      desiredCapabilities: {
        browserName: 'firefox',
        alwaysMatch: {
          acceptInsecureCerts: true,
          'moz:firefoxOptions': {
            args: [
              '--width=1280',
              '--height=800'
            ]
          }
        }
      },
      webdriver: {
        start_process: true,
        server_path: require('geckodriver').path,
        port: 4444,
        cli_args: [
          '--port=4444'
        ]
      }
    },

    'firefox.headless': {
      extends: 'firefox',
      desiredCapabilities: {
        alwaysMatch: {
          'moz:firefoxOptions': {
            args: [
              '-headless'
            ]
          }
        }
      }
    }
  }
};