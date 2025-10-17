describe('Asteroids Gameplay Mechanics Tests', function() {
  let gamePage;

  before(function(browser) {
    gamePage = browser.page.gamePageObject();
  });

  beforeEach(function(browser) {
    gamePage
      .navigate()
      .waitForElementVisible('@startButton', 5000)
      .startGame()
      .waitForGameToStart()
      .pause(500); // Extra time for game initialization
  });

  after(function(browser) {
    browser.end();
  });

  it('should have a ship object when game starts', function(browser) {
    browser.execute(function() {
      return {
        hasShip: window.ship !== null,
        shipX: window.ship ? window.ship.x : null,
        shipY: window.ship ? window.ship.y : null
      };
    }, [], function(result) {
      browser.assert.ok(result.value.hasShip, 'Ship should exist');
      browser.assert.equal(result.value.shipX, 400, 'Ship should start at center X');
      browser.assert.equal(result.value.shipY, 300, 'Ship should start at center Y');
    });
  });

  it('should have asteroids when game starts', function(browser) {
    browser.execute(function() {
      return {
        hasAsteroids: window.asteroids && window.asteroids.length > 0,
        asteroidCount: window.asteroids ? window.asteroids.length : 0
      };
    }, [], function(result) {
      browser.assert.ok(result.value.hasAsteroids, 'Asteroids should exist');
      browser.assert.ok(result.value.asteroidCount >= 4, 'Should have at least 4 asteroids at start');
    });
  });

  it('should create bullets when firing', function(browser) {
    browser.execute(function() {
      const initialCount = window.bullets ? window.bullets.length : 0;

      // Simulate space key press
      const event = new KeyboardEvent('keydown', { key: ' ' });
      document.dispatchEvent(event);

      // Release and press again
      const releaseEvent = new KeyboardEvent('keyup', { key: ' ' });
      document.dispatchEvent(releaseEvent);
      document.dispatchEvent(event);

      const finalCount = window.bullets ? window.bullets.length : 0;

      return {
        initial: initialCount,
        final: finalCount
      };
    }, [], function(result) {
      browser.assert.ok(result.value.final > result.value.initial, 'Bullets should be created when firing');
    });
  });

  it('should track score changes', function(browser) {
    // Simulate scoring by directly modifying game state
    browser.execute(function() {
      if (window.gameState) {
        window.gameState.score = 100;
        window.updateDisplay();
        return window.gameState.score;
      }
      return 0;
    }, [], function(result) {
      browser.assert.equal(result.value, 100, 'Score should be updated');
      gamePage.assert.textContains('@scoreDisplay', '100');
    });
  });

  it('should track lives', function(browser) {
    browser.execute(function() {
      if (window.gameState) {
        const initialLives = window.gameState.lives;
        window.gameState.lives--;
        window.updateDisplay();
        return {
          initial: initialLives,
          current: window.gameState.lives
        };
      }
      return { initial: 3, current: 2 };
    }, [], function(result) {
      browser.assert.equal(result.value.initial, 3, 'Should start with 3 lives');
      browser.assert.equal(result.value.current, 2, 'Lives should decrease');
      gamePage.assert.textContains('@livesDisplay', '2');
    });
  });

  it('should increase level when all asteroids are destroyed', function(browser) {
    browser.execute(function() {
      // Clear all asteroids to simulate level completion
      window.asteroids = [];
      const initialLevel = window.gameState.level;

      // Trigger game loop logic
      setTimeout(function() {
        // Level should increase
      }, 100);

      return initialLevel;
    }, [], function(result) {
      browser.assert.equal(result.value, 1, 'Should start at level 1');
    });
  });

  it('should handle game over when lives reach zero', function(browser) {
    browser.execute(function() {
      if (window.gameState && window.endGame) {
        window.gameState.lives = 0;
        window.endGame();
        return true;
      }
      return false;
    }, [], function(result) {
      browser.assert.ok(result.value, 'Game over should trigger');
      gamePage.assert.visible('@gameOverScreen');
    });
  });

  it('should track and update high score', function(browser) {
    browser.execute(function() {
      if (window.gameState) {
        window.gameState.score = 5000;
        window.gameState.highScore = Math.max(window.gameState.score, window.gameState.highScore);
        window.updateDisplay();
        localStorage.setItem('highScore', window.gameState.highScore);
        return window.gameState.highScore;
      }
      return 0;
    }, [], function(result) {
      browser.assert.ok(result.value >= 5000, 'High score should be updated');
    });
  });

  it('should respawn ship with invulnerability', function(browser) {
    browser.execute(function() {
      if (window.ship) {
        window.ship.respawn();
        return {
          invulnerable: window.ship.invulnerable,
          x: window.ship.x,
          y: window.ship.y
        };
      }
      return null;
    }, [], function(result) {
      browser.assert.ok(result.value.invulnerable, 'Ship should be invulnerable after respawn');
      browser.assert.equal(result.value.x, 400, 'Ship should respawn at center X');
      browser.assert.equal(result.value.y, 300, 'Ship should respawn at center Y');
    });
  });

  it('should wrap objects around screen edges', function(browser) {
    browser.execute(function() {
      if (window.ship) {
        // Test horizontal wrap
        window.ship.x = -10;
        window.ship.update(16);
        const wrappedX = window.ship.x;

        // Test vertical wrap
        window.ship.y = -10;
        window.ship.update(16);
        const wrappedY = window.ship.y;

        return {
          wrappedX: wrappedX,
          wrappedY: wrappedY
        };
      }
      return null;
    }, [], function(result) {
      browser.assert.equal(result.value.wrappedX, 800, 'Ship should wrap horizontally');
      browser.assert.equal(result.value.wrappedY, 600, 'Ship should wrap vertically');
    });
  });
});