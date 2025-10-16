module.exports = {
  url: function() {
    return this.api.launch_url;
  },

  elements: {
    // Canvas
    gameCanvas: '#gameCanvas',

    // Score displays
    scoreDisplay: '#score',
    livesDisplay: '#lives',
    levelDisplay: '#level',
    highScoreDisplay: '#high-score',
    finalScoreDisplay: '#final-score',

    // Buttons
    startButton: '#start-button',
    pauseButton: '#pause-button',
    resetButton: '#reset-button',
    soundToggle: '#sound-toggle',
    playAgainButton: '#play-again',
    resumeButton: '#resume-button',

    // Screens
    gameOverScreen: '#game-over-screen',
    pauseScreen: '#pause-screen',

    // Instructions
    instructions: '#instructions',

    // Game container
    gameContainer: '#game-container',
    gameHeader: '#game-header'
  },

  commands: [{
    startGame() {
      return this
        .waitForElementVisible('@startButton', 5000)
        .click('@startButton');
    },

    pauseGame() {
      return this
        .waitForElementVisible('@pauseButton', 5000)
        .click('@pauseButton');
    },

    resumeGame() {
      return this
        .waitForElementVisible('@resumeButton', 5000)
        .click('@resumeButton');
    },

    resetGame() {
      return this
        .waitForElementVisible('@resetButton', 5000)
        .click('@resetButton');
    },

    toggleSound() {
      return this
        .waitForElementVisible('@soundToggle', 5000)
        .click('@soundToggle');
    },

    playAgain() {
      return this
        .waitForElementVisible('@playAgainButton', 5000)
        .click('@playAgainButton');
    },

    getScore() {
      return this.getText('@scoreDisplay');
    },

    getLives() {
      return this.getText('@livesDisplay');
    },

    getLevel() {
      return this.getText('@levelDisplay');
    },

    getHighScore() {
      return this.getText('@highScoreDisplay');
    },

    waitForGameToStart() {
      return this
        .waitForElementVisible('@gameCanvas', 5000)
        .assert.attributeEquals('@pauseButton', 'disabled', null);
    },

    waitForGameOver() {
      return this.waitForElementVisible('@gameOverScreen', 30000);
    },

    isGamePaused() {
      return this.isVisible('@pauseScreen');
    },

    pressKey(key) {
      return this.api.keys(key);
    },

    // Simulate game controls
    thrust() {
      return this.api.keys('w');
    },

    rotateLeft() {
      return this.api.keys('a');
    },

    rotateRight() {
      return this.api.keys('d');
    },

    fire() {
      return this.api.keys(' ');
    },

    pressPause() {
      return this.api.keys('p');
    }
  }]
};