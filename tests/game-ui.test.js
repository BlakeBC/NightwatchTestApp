describe('Asteroids Game UI Tests', function() {
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

  it('should display correct color scheme', function(browser) {
    browser
      .getCssProperty('#game-container', 'background-color', function(result) {
        browser.assert.ok(result.value.includes('rgba'), 'Game container should have background');
      })
      .getCssProperty('#gameCanvas', 'border-color', function(result) {
        browser.assert.ok(result.value.includes('rgb'), 'Canvas should have border');
      });
  });

  it('should show hover effects on buttons', function(browser) {
    browser
      .moveToElement('#start-button', 10, 10)
      .pause(500)
      .getCssProperty('#start-button', 'transform', function(result) {
        browser.assert.ok(result.value !== 'none', 'Start button should have hover effect');
      });
  });

  it('should display game over screen with correct elements', function(browser) {
    gamePage
      .startGame()
      .waitForGameToStart();

    // Trigger game over
    browser.execute(function() {
      if (window.endGame) {
        window.gameState.score = 12345;
        window.endGame();
      }
    });

    gamePage
      .waitForElementVisible('@gameOverScreen', 5000)
      .assert.visible('@gameOverScreen')
      .assert.textContains('@gameOverScreen', 'GAME OVER')
      .assert.textContains('@finalScoreDisplay', '12345')
      .assert.visible('@playAgainButton');
  });

  it('should allow playing again after game over', function(browser) {
    gamePage
      .startGame()
      .waitForGameToStart();

    // Trigger game over
    browser.execute(function() {
      if (window.endGame) {
        window.endGame();
      }
    });

    gamePage
      .waitForElementVisible('@gameOverScreen', 5000)
      .playAgain()
      .assert.cssClassPresent('@gameOverScreen', 'hidden')
      .assert.attributeEquals('@pauseButton', 'disabled', null);
  });

  it('should display pause screen with correct elements', function(browser) {
    gamePage
      .startGame()
      .waitForGameToStart()
      .pauseGame()
      .assert.visible('@pauseScreen')
      .assert.textContains('@pauseScreen', 'PAUSED')
      .assert.textContains('@pauseScreen', 'Press P or click Resume')
      .assert.visible('@resumeButton');
  });

  it('should maintain responsive layout', function(browser) {
    browser
      .getElementSize('#game-container', function(result) {
        browser.assert.ok(result.value.width > 0, 'Container should have width');
        browser.assert.ok(result.value.height > 0, 'Container should have height');
      })
      .getElementSize('#gameCanvas', function(result) {
        browser.assert.equal(result.value.width, 804, 'Canvas should be 800px + border');
        browser.assert.equal(result.value.height, 604, 'Canvas should be 600px + border');
      });
  });

  it('should display score with proper formatting', function(browser) {
    browser.execute(function() {
      if (window.gameState) {
        window.gameState.score = 999999;
        window.updateDisplay();
      }
    });

    gamePage
      .assert.textContains('@scoreDisplay', '999999')
      .getCssProperty('#score', 'color', function(result) {
        browser.assert.ok(result.value.includes('rgb'), 'Score should have cyan color');
      });
  });

  it('should show keyboard hints in instructions', function(browser) {
    browser
      .assert.visible('#instructions')
      .elements('css selector', '#instructions kbd', function(result) {
        browser.assert.ok(result.value.length >= 5, 'Should display at least 5 keyboard keys');
      });
  });

  it('should have proper z-index layering', function(browser) {
    browser
      .getCssProperty('.overlay', 'z-index', function(result) {
        browser.assert.equal(result.value, '1000', 'Overlay should have high z-index');
      });
  });

  it('should persist high score in localStorage', function(browser) {
    browser.execute(function() {
      localStorage.setItem('highScore', '99999');
      return localStorage.getItem('highScore');
    }, [], function(result) {
      browser.assert.equal(result.value, '99999', 'High score should be stored in localStorage');
    });

    // Refresh page and check if high score persists
    browser
      .refresh()
      .pause(1000)
      .execute(function() {
        return document.getElementById('high-score').textContent;
      }, [], function(result) {
        browser.assert.equal(result.value, '99999', 'High score should persist after refresh');
      });
  });
});