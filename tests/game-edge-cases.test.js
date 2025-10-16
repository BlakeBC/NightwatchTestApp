describe('Asteroids Game Edge Cases and Error Handling Tests', function() {
  let gamePage;

  before(function(browser) {
    gamePage = browser.page.gamePageObject();
  });

  beforeEach(function(browser) {
    gamePage.navigate();
  });

  afterEach(function(browser) {
    // Clear localStorage to ensure clean state
    browser.execute(function() {
      localStorage.clear();
    });
  });

  after(function(browser) {
    browser.end();
  });

  it('should handle double-clicking start button', function(browser) {
    gamePage
      .startGame()
      .pause(100)
      .click('@startButton') // Try to click again
      .pause(100);

    browser.execute(function() {
      return window.gameState ? window.gameState.running : false;
    }, [], function(result) {
      browser.assert.ok(result.value, 'Game should still be running properly');
    });
  });

  it('should handle pause when game is not running', function(browser) {
    gamePage
      .click('@pauseButton')
      .pause(100);

    browser.execute(function() {
      return window.gameState ? window.gameState.paused : false;
    }, [], function(result) {
      browser.assert.ok(!result.value, 'Should not pause when game is not running');
    });
  });

  it('should handle reset during gameplay', function(browser) {
    gamePage
      .startGame()
      .waitForGameToStart()
      .pause(1000) // Let game run
      .resetGame();

    gamePage
      .assert.enabled('@startButton')
      .assert.attributeEquals('@pauseButton', 'disabled', 'true')
      .assert.textContains('@scoreDisplay', '0')
      .assert.textContains('@livesDisplay', '3');
  });

  it('should handle corrupted localStorage data', function(browser) {
    browser.execute(function() {
      // Set invalid high score
      localStorage.setItem('highScore', 'not-a-number');

      // Reload game state
      window.gameState.highScore = localStorage.getItem('highScore') || 0;
      window.updateDisplay();

      return document.getElementById('high-score').textContent;
    }, [], function(result) {
      // Should handle gracefully and default to 0 or previous valid value
      browser.assert.ok(result.value !== 'not-a-number', 'Should handle invalid high score data');
    });
  });

  it('should handle simultaneous movement keys', function(browser) {
    gamePage
      .startGame()
      .waitForGameToStart();

    browser.execute(function() {
      // Press multiple keys at once
      const keys = ['w', 'a', 'd', ' '];
      keys.forEach(key => {
        const event = new KeyboardEvent('keydown', { key: key });
        document.dispatchEvent(event);
      });

      return window.ship !== null;
    }, [], function(result) {
      browser.assert.ok(result.value, 'Ship should handle multiple simultaneous inputs');
    });
  });

  it('should handle game over during pause', function(browser) {
    gamePage
      .startGame()
      .waitForGameToStart()
      .pauseGame();

    browser.execute(function() {
      // Force game over while paused
      window.gameState.lives = 0;
      window.endGame();
    });

    gamePage
      .assert.visible('@gameOverScreen')
      .assert.cssClassPresent('@pauseScreen', 'hidden');
  });

  it('should handle window resize during gameplay', function(browser) {
    gamePage
      .startGame()
      .waitForGameToStart();

    browser
      .resizeWindow(1024, 768)
      .pause(500)
      .resizeWindow(1280, 1024)
      .pause(500);

    browser.execute(function() {
      return {
        canvasWidth: document.getElementById('gameCanvas').width,
        canvasHeight: document.getElementById('gameCanvas').height,
        gameRunning: window.gameState.running
      };
    }, [], function(result) {
      browser.assert.equal(result.value.canvasWidth, 800, 'Canvas width should remain constant');
      browser.assert.equal(result.value.canvasHeight, 600, 'Canvas height should remain constant');
      browser.assert.ok(result.value.gameRunning, 'Game should continue running after resize');
    });
  });

  it('should handle rapid pause/unpause toggling', function(browser) {
    gamePage
      .startGame()
      .waitForGameToStart();

    // Rapidly toggle pause
    for (let i = 0; i < 10; i++) {
      gamePage.pressPause().pause(50);
    }

    browser.execute(function() {
      return window.gameState ? window.gameState.running : false;
    }, [], function(result) {
      browser.assert.ok(result.value, 'Game should handle rapid pause toggling');
    });
  });

  it('should handle negative scores gracefully', function(browser) {
    gamePage
      .startGame()
      .waitForGameToStart();

    browser.execute(function() {
      // Try to set negative score
      window.gameState.score = -100;
      window.updateDisplay();
      return window.gameState.score;
    }, [], function(result) {
      // Game should either prevent negative scores or handle them gracefully
      browser.assert.ok(result.value <= 0, 'Should handle negative score');
      gamePage.assert.textContains('@scoreDisplay', '-100');
    });
  });

  it('should handle excessive lives', function(browser) {
    gamePage
      .startGame()
      .waitForGameToStart();

    browser.execute(function() {
      window.gameState.lives = 999;
      window.updateDisplay();
      return window.gameState.lives;
    }, [], function(result) {
      browser.assert.equal(result.value, 999, 'Should handle large number of lives');
      gamePage.assert.textContains('@livesDisplay', '999');
    });
  });

  it('should handle ship at exact screen boundaries', function(browser) {
    gamePage
      .startGame()
      .waitForGameToStart();

    browser.execute(function() {
      // Place ship at exact boundaries
      const positions = [
        { x: 0, y: 300 },
        { x: 800, y: 300 },
        { x: 400, y: 0 },
        { x: 400, y: 600 }
      ];

      const results = [];
      positions.forEach(pos => {
        window.ship.x = pos.x;
        window.ship.y = pos.y;
        window.ship.update(16);
        results.push({ x: window.ship.x, y: window.ship.y });
      });

      return results;
    }, [], function(result) {
      browser.assert.ok(Array.isArray(result.value), 'Should handle boundary positions');
      // Ship should wrap or stay within bounds
      result.value.forEach(pos => {
        browser.assert.ok(pos.x >= 0 && pos.x <= 800, 'X should be within bounds');
        browser.assert.ok(pos.y >= 0 && pos.y <= 600, 'Y should be within bounds');
      });
    });
  });

  it('should handle asteroid collision at spawn point', function(browser) {
    gamePage
      .startGame()
      .waitForGameToStart();

    browser.execute(function() {
      // Create asteroid at ship spawn point
      const asteroid = new window.Asteroid(400, 300, 40, 1);
      window.asteroids.push(asteroid);

      // Respawn ship
      window.ship.respawn();

      return {
        shipInvulnerable: window.ship.invulnerable,
        shipX: window.ship.x,
        shipY: window.ship.y
      };
    }, [], function(result) {
      browser.assert.ok(result.value.shipInvulnerable, 'Ship should be invulnerable at spawn');
      browser.assert.equal(result.value.shipX, 400, 'Ship should spawn at center despite asteroid');
    });
  });

  it('should handle sound toggle when sound system fails', function(browser) {
    browser.execute(function() {
      // Simulate sound system failure
      window.gameState.soundEnabled = undefined;
    });

    gamePage
      .toggleSound()
      .pause(100);

    browser.execute(function() {
      return window.gameState.soundEnabled !== undefined;
    }, [], function(result) {
      browser.assert.ok(result.value, 'Sound toggle should recover from undefined state');
    });
  });

  it('should handle play again after multiple game overs', function(browser) {
    for (let i = 0; i < 3; i++) {
      gamePage
        .startGame()
        .waitForGameToStart();

      browser.execute(function() {
        window.endGame();
      });

      gamePage
        .waitForElementVisible('@gameOverScreen', 5000)
        .playAgain()
        .pause(500);
    }

    browser.execute(function() {
      return window.gameState.running;
    }, [], function(result) {
      browser.assert.ok(result.value, 'Game should run properly after multiple restarts');
    });
  });
});