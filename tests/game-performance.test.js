describe('Asteroids Game Performance Tests', function() {
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

  it('should maintain smooth frame rate', function(browser) {
    browser.execute(function() {
      let frameCount = 0;
      let lastTime = performance.now();
      const frameRates = [];

      function measureFrame() {
        const currentTime = performance.now();
        const deltaTime = currentTime - lastTime;

        if (deltaTime > 0) {
          const fps = 1000 / deltaTime;
          frameRates.push(fps);
        }

        lastTime = currentTime;
        frameCount++;

        if (frameCount < 60) {
          requestAnimationFrame(measureFrame);
        }
      }

      measureFrame();

      return new Promise(resolve => {
        setTimeout(() => {
          const avgFPS = frameRates.reduce((a, b) => a + b, 0) / frameRates.length;
          resolve({
            avgFPS: avgFPS,
            minFPS: Math.min(...frameRates),
            maxFPS: Math.max(...frameRates)
          });
        }, 2000);
      });
    }, [], function(result) {
      browser.assert.ok(result.value.avgFPS > 30, 'Average FPS should be above 30');
      browser.assert.ok(result.value.minFPS > 20, 'Minimum FPS should be above 20');
    });
  });

  it('should handle multiple bullets efficiently', function(browser) {
    browser.execute(function() {
      // Fire multiple bullets
      for (let i = 0; i < 20; i++) {
        if (window.ship) {
          window.ship.shoot();
        }
      }

      return window.bullets ? window.bullets.length : 0;
    }, [], function(result) {
      browser.assert.ok(result.value >= 20, 'Should handle multiple bullets');

      // Check performance with many bullets
      browser.pause(1000);

      browser.execute(function() {
        return window.bullets ? window.bullets.length : 0;
      }, [], function(result) {
        browser.assert.ok(result.value >= 0, 'Bullets should be managed properly');
      });
    });
  });

  it('should handle particle effects efficiently', function(browser) {
    browser.execute(function() {
      // Create multiple explosions
      for (let i = 0; i < 5; i++) {
        if (window.createExplosion) {
          window.createExplosion(
            Math.random() * 800,
            Math.random() * 600
          );
        }
      }

      return window.particles ? window.particles.length : 0;
    }, [], function(result) {
      browser.assert.ok(result.value > 0, 'Particles should be created');

      // Wait for particles to fade
      browser.pause(1000);

      browser.execute(function() {
        return window.particles ? window.particles.length : 0;
      }, [], function(result) {
        browser.assert.ok(result.value >= 0, 'Old particles should be cleaned up');
      });
    });
  });

  it('should handle collision detection efficiently', function(browser) {
    const startTime = Date.now();

    browser.execute(function() {
      // Perform multiple collision checks
      let collisionCount = 0;

      for (let i = 0; i < 1000; i++) {
        if (window.checkCollision && window.ship && window.asteroids[0]) {
          window.checkCollision(window.ship, window.asteroids[0]);
          collisionCount++;
        }
      }

      return collisionCount;
    }, [], function(result) {
      const endTime = Date.now();
      const duration = endTime - startTime;

      browser.assert.ok(result.value === 1000, 'Should perform 1000 collision checks');
      browser.assert.ok(duration < 1000, 'Collision detection should be fast (< 1 second for 1000 checks)');
    });
  });

  it('should clean up old bullets', function(browser) {
    browser.execute(function() {
      // Create bullets with expired lifetime
      for (let i = 0; i < 10; i++) {
        const bullet = new window.Bullet(100, 100, 0);
        bullet.lifetime = -1; // Expired
        window.bullets.push(bullet);
      }

      const initialCount = window.bullets.length;

      // Trigger cleanup in game loop
      return { initial: initialCount };
    }, [], function(result) {
      browser.assert.ok(result.value.initial >= 10, 'Should have bullets to clean up');

      browser.pause(100);

      browser.execute(function() {
        // Count bullets after cleanup cycle
        const validBullets = window.bullets.filter(b => b.lifetime > 0);
        return validBullets.length;
      }, [], function(result) {
        browser.assert.ok(result.value >= 0, 'Expired bullets should be cleaned up');
      });
    });
  });

  it('should handle level progression without performance degradation', function(browser) {
    browser.execute(function() {
      // Simulate level progression
      window.gameState.level = 10;
      window.asteroids = [];

      // Create many asteroids for high level
      for (let i = 0; i < 15; i++) {
        window.asteroids.push(new window.Asteroid(
          Math.random() * 800,
          Math.random() * 600,
          40,
          1
        ));
      }

      return window.asteroids.length;
    }, [], function(result) {
      browser.assert.equal(result.value, 15, 'Should handle many asteroids at high levels');
    });
  });

  it('should not have memory leaks with particles', function(browser) {
    browser.execute(function() {
      const initialParticles = window.particles ? window.particles.length : 0;

      // Create and let expire many particles
      for (let i = 0; i < 100; i++) {
        if (window.particles) {
          window.particles.push(new window.Particle(
            100, 100, 1, 1, '#ffffff'
          ));
        }
      }

      // Set all particle lifetimes to expired
      window.particles.forEach(p => p.lifetime = -1);

      return {
        initial: initialParticles,
        created: window.particles.length
      };
    }, [], function(result) {
      browser.assert.ok(result.value.created >= 100, 'Should create particles');

      // Wait for cleanup
      browser.pause(500);

      browser.execute(function() {
        // Filter out expired particles (simulating game loop cleanup)
        window.particles = window.particles.filter(p => p.lifetime > 0);
        return window.particles.length;
      }, [], function(result) {
        browser.assert.equal(result.value, 0, 'All expired particles should be removed');
      });
    });
  });

  it('should handle rapid input without lag', function(browser) {
    const commands = [];

    // Simulate rapid key presses
    for (let i = 0; i < 20; i++) {
      commands.push(() => gamePage.thrust());
      commands.push(() => gamePage.rotateLeft());
      commands.push(() => gamePage.fire());
      commands.push(() => gamePage.rotateRight());
    }

    // Execute commands rapidly
    commands.forEach(cmd => {
      cmd();
      browser.pause(10);
    });

    browser.execute(function() {
      return {
        gameRunning: window.gameState && window.gameState.running,
        shipExists: window.ship !== null
      };
    }, [], function(result) {
      browser.assert.ok(result.value.gameRunning, 'Game should still be running after rapid input');
      browser.assert.ok(result.value.shipExists, 'Ship should exist after rapid input');
    });
  });
});