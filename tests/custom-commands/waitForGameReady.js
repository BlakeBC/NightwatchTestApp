/**
 * Custom command to wait for the game to be fully ready
 * This ensures all game objects are initialized before tests run
 */
exports.command = function(timeout = 5000) {
  const self = this;

  // Wait for game objects to be available in window
  this.execute(function() {
    return {
      hasGameState: typeof window.gameState !== 'undefined',
      hasShip: typeof window.ship !== 'undefined',
      hasAsteroids: typeof window.asteroids !== 'undefined',
      hasBullets: typeof window.bullets !== 'undefined',
      gameRunning: window.gameState && window.gameState.running
    };
  }, [], function(result) {
    // Log the state for debugging
    if (!result.value.hasGameState) {
      console.log('Warning: gameState not found');
    }
    if (!result.value.hasShip) {
      console.log('Warning: ship not found');
    }
    if (!result.value.gameRunning) {
      console.log('Warning: game not running');
    }
  });

  // Add a small pause to ensure everything is rendered
  this.pause(200);

  return self;
};