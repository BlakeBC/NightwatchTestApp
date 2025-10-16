describe('Asteroids Game Initialization Tests', function() {
  let gamePage;

  before(function(browser) {
    gamePage = browser.page.gamePageObject();
  });

  beforeEach(function(browser) {
    gamePage.navigate();
  });

  after(function(browser) {
    browser.end();
  });

  it('should load the game page with all elements visible', function(browser) {
    gamePage
      .waitForElementVisible('@gameContainer', 5000)
      .assert.visible('@gameCanvas')
      .assert.visible('@gameHeader')
      .assert.visible('@startButton')
      .assert.visible('@resetButton')
      .assert.visible('@soundToggle')
      .assert.visible('@instructions');
  });

  it('should display initial game state correctly', function(browser) {
    gamePage
      .assert.textContains('@scoreDisplay', '0')
      .assert.textContains('@livesDisplay', '3')
      .assert.textContains('@levelDisplay', '1');
  });

  it('should have correct initial button states', function(browser) {
    gamePage
      .assert.enabled('@startButton')
      .assert.attributeEquals('@pauseButton', 'disabled', 'true')
      .assert.enabled('@resetButton')
      .assert.enabled('@soundToggle');
  });

  it('should display game instructions', function(browser) {
    gamePage
      .assert.visible('@instructions')
      .assert.textContains('@instructions', 'Controls')
      .assert.textContains('@instructions', 'Thrust')
      .assert.textContains('@instructions', 'Rotate')
      .assert.textContains('@instructions', 'Fire')
      .assert.textContains('@instructions', 'Pause');
  });

  it('should have correct canvas dimensions', function(browser) {
    browser.execute(function() {
      const canvas = document.getElementById('gameCanvas');
      return {
        width: canvas.width,
        height: canvas.height
      };
    }, [], function(result) {
      browser.assert.equal(result.value.width, 800, 'Canvas width should be 800');
      browser.assert.equal(result.value.height, 600, 'Canvas height should be 600');
    });
  });

  it('should hide overlay screens initially', function(browser) {
    gamePage
      .assert.cssClassPresent('@gameOverScreen', 'hidden')
      .assert.cssClassPresent('@pauseScreen', 'hidden');
  });

  it('should display sound toggle with correct initial state', function(browser) {
    gamePage.assert.textContains('@soundToggle', 'Sound: ON');
  });

  it('should have correct page title', function(browser) {
    browser.assert.title('Asteroids Game');
  });
});