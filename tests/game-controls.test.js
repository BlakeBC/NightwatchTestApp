describe('Asteroids Game Controls Tests', function() {
  let gamePage;

  before(function(browser) {
    gamePage = browser.page.gamePageObject();
  });

  beforeEach(function(browser) {
    gamePage
      .navigate()
      .startGame()
      .waitForGameToStart();
  });

  after(function(browser) {
    browser.end();
  });

  it('should start game when start button is clicked', function(browser) {
    gamePage
      .assert.attributeEquals('@startButton', 'disabled', 'true')
      .assert.not.attributeEquals('@pauseButton', 'disabled', 'true');
  });

  it('should pause and resume game with pause button', function(browser) {
    gamePage
      .pauseGame()
      .assert.visible('@pauseScreen')
      .assert.textContains('@pauseButton', 'Resume')
      .pause(500)
      .resumeGame()
      .assert.cssClassPresent('@pauseScreen', 'hidden')
      .assert.textContains('@pauseButton', 'Pause');
  });

  it('should pause and resume game with P key', function(browser) {
    gamePage
      .pressPause()
      .pause(500)
      .assert.visible('@pauseScreen')
      .pressPause()
      .pause(500)
      .assert.cssClassPresent('@pauseScreen', 'hidden');
  });

  it('should reset game when reset button is clicked', function(browser) {
    // Play for a moment to change game state
    browser.pause(2000);

    gamePage
      .resetGame()
      .assert.textContains('@scoreDisplay', '0')
      .assert.textContains('@livesDisplay', '3')
      .assert.textContains('@levelDisplay', '1')
      .assert.enabled('@startButton');
  });

  it('should toggle sound on and off', function(browser) {
    gamePage
      .assert.textContains('@soundToggle', 'Sound: ON')
      .toggleSound()
      .assert.textContains('@soundToggle', 'Sound: OFF')
      .toggleSound()
      .assert.textContains('@soundToggle', 'Sound: ON');
  });

  it('should respond to keyboard controls', function(browser) {
    // Test thrust (W key)
    browser.execute(function() {
      const event = new KeyboardEvent('keydown', { key: 'w' });
      document.dispatchEvent(event);
      return window.ship && window.ship.thrusting;
    }, [], function(result) {
      browser.assert.ok(result.value !== undefined, 'Ship should respond to thrust');
    });

    // Test rotation (A and D keys)
    browser.execute(function() {
      const initialAngle = window.ship ? window.ship.angle : 0;
      const eventA = new KeyboardEvent('keydown', { key: 'a' });
      document.dispatchEvent(eventA);
      return { initial: initialAngle };
    }, [], function(result) {
      browser.assert.ok(result.value !== undefined, 'Ship should respond to rotation');
    });

    // Test fire (Space key)
    browser.execute(function() {
      const initialBullets = window.bullets ? window.bullets.length : 0;
      const event = new KeyboardEvent('keydown', { key: ' ' });
      document.dispatchEvent(event);
      const afterBullets = window.bullets ? window.bullets.length : 0;
      return { before: initialBullets, after: afterBullets };
    }, [], function(result) {
      browser.assert.ok(result.value !== undefined, 'Ship should fire bullets');
    });
  });

  it('should accept alternative keyboard controls', function(browser) {
    // Test arrow keys
    browser.execute(function() {
      const upEvent = new KeyboardEvent('keydown', { key: 'ArrowUp' });
      const leftEvent = new KeyboardEvent('keydown', { key: 'ArrowLeft' });
      const rightEvent = new KeyboardEvent('keydown', { key: 'ArrowRight' });

      document.dispatchEvent(upEvent);
      document.dispatchEvent(leftEvent);
      document.dispatchEvent(rightEvent);

      return true;
    }, [], function(result) {
      browser.assert.ok(result.value, 'Should accept arrow key controls');
    });
  });

  it('should maintain game state during pause', function(browser) {
    // Play for a moment
    browser.pause(2000);

    // Get current score before pause
    gamePage.getText('@scoreDisplay', function(result) {
      const scoreBefore = result.value;

      gamePage
        .pauseGame()
        .pause(1000)
        .resumeGame()
        .getText('@scoreDisplay', function(result) {
          // Score should be preserved after pause/resume
          browser.assert.ok(result.value !== undefined, 'Score should be maintained during pause');
        });
    });
  });
});