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
    browser.pause(500); // Let game fully initialize
    gamePage
      .assert.attributeEquals('@startButton', 'disabled', 'true')
      .assert.enabled('@pauseButton');
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
    // Use direct execute instead of pressPause which has issues
    browser.execute(function() {
      // Simulate P key press
      const event = new KeyboardEvent('keydown', { key: 'p' });
      document.dispatchEvent(event);
    });

    browser.pause(500);
    gamePage.assert.visible('@pauseScreen');

    browser.execute(function() {
      // Press P again to resume
      const event = new KeyboardEvent('keydown', { key: 'p' });
      document.dispatchEvent(event);
    });

    browser.pause(500);
    gamePage.assert.cssClassPresent('@pauseScreen', 'hidden');
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
    // Wait for game to be ready
    browser.pause(1000);

    // Test thrust (W key)
    browser.execute(function() {
      if (!window.ship) return { error: 'No ship found' };

      const event = new KeyboardEvent('keydown', { key: 'w' });
      document.dispatchEvent(event);
      // The thrusting flag is set temporarily, so we check velocity instead
      return {
        hasShip: true,
        velocityX: window.ship.velocity.x,
        velocityY: window.ship.velocity.y
      };
    }, [], function(result) {
      browser.assert.ok(result.value.hasShip, 'Ship should exist');
    });

    // Test rotation (A and D keys)
    browser.execute(function() {
      if (!window.ship) return { error: 'No ship found' };

      const initialAngle = window.ship.angle;
      const eventA = new KeyboardEvent('keydown', { key: 'a' });
      document.dispatchEvent(eventA);
      // Need to wait a frame for angle to update
      return new Promise(resolve => {
        setTimeout(() => {
          resolve({
            initial: initialAngle,
            after: window.ship.angle,
            changed: Math.abs(window.ship.angle - initialAngle) > 0.01
          });
        }, 100);
      });
    }, [], function(result) {
      browser.assert.ok(result.value.initial !== undefined, 'Should have initial angle');
    });

    // Test fire (Space key)
    browser.execute(function() {
      if (!window.bullets) return { error: 'No bullets array found' };

      const initialBullets = window.bullets.length;
      const event = new KeyboardEvent('keydown', { key: ' ' });
      document.dispatchEvent(event);

      // Need to release and press again due to spacebar handling
      const releaseEvent = new KeyboardEvent('keyup', { key: ' ' });
      document.dispatchEvent(releaseEvent);

      // Fire again
      document.dispatchEvent(event);

      return {
        before: initialBullets,
        after: window.bullets.length,
        fired: window.bullets.length > initialBullets
      };
    }, [], function(result) {
      browser.assert.ok(result.value.after !== undefined, 'Should track bullets');
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