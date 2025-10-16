# Asteroids Game with Nightwatch Tests

A classic Asteroids game implementation with comprehensive Nightwatch E2E testing suite.

## Features

- Classic Asteroids gameplay
- Smooth controls (keyboard: W/A/D or Arrow keys for movement, Space to fire, P to pause)
- Score tracking and high score persistence
- Multiple lives and level progression
- Particle effects and visual feedback
- Responsive UI with retro styling

## Installation

```bash
npm install
```

## Running the Game

Start the local server:

```bash
npm start
```

Then open your browser and navigate to `http://localhost:8080`

## Running Tests

### Run all tests
```bash
npm test
```

### Run tests in specific browser
```bash
npm run test:chrome     # Chrome with GUI
npm run test:firefox    # Firefox with GUI
npm run test:headless   # Chrome headless mode
```

## Test Suites

The project includes comprehensive Nightwatch tests covering:

1. **Game Initialization Tests** (`game-initialization.test.js`)
   - Page load verification
   - Initial state validation
   - UI element presence
   - Canvas dimensions

2. **Game Controls Tests** (`game-controls.test.js`)
   - Start/pause/reset functionality
   - Keyboard input handling
   - Button interactions
   - Sound toggle

3. **Gameplay Mechanics Tests** (`gameplay-mechanics.test.js`)
   - Ship movement and physics
   - Asteroid generation
   - Bullet mechanics
   - Collision detection
   - Score tracking
   - Level progression

4. **UI Tests** (`game-ui.test.js`)
   - Visual styling
   - Overlay screens
   - Button hover effects
   - Responsive layout
   - LocalStorage persistence

5. **Performance Tests** (`game-performance.test.js`)
   - Frame rate monitoring
   - Memory management
   - Particle system efficiency
   - Collision detection performance
   - Input responsiveness

6. **Edge Cases Tests** (`game-edge-cases.test.js`)
   - Error handling
   - Boundary conditions
   - Simultaneous inputs
   - State management edge cases
   - Recovery from invalid states

## Project Structure

```
NightwatchTestApp/
├── index.html              # Main game HTML
├── styles.css              # Game styling
├── game.js                 # Game logic
├── package.json            # Dependencies and scripts
├── nightwatch.conf.js      # Nightwatch configuration
├── tests/                  # Test suites
│   ├── page-objects/       # Page object models
│   └── *.test.js          # Test files
└── README.md              # This file
```

## Technologies Used

- **Game**: Vanilla JavaScript, HTML5 Canvas, CSS3
- **Testing**: Nightwatch.js v3.3.0
- **Browsers**: ChromeDriver, GeckoDriver
- **Server**: http-server

## Game Controls

- **W / ↑** - Thrust forward
- **A / ←** - Rotate left
- **D / →** - Rotate right
- **Space** - Fire bullets
- **P** - Pause/Resume
- **Mouse** - Click buttons for start, pause, reset

## Notes

- High scores are saved in browser localStorage
- The game features wrap-around screen edges
- Ship has temporary invulnerability after respawning
- Asteroids split into smaller pieces when destroyed
- Particle effects enhance visual feedback

Enjoy the game and the comprehensive test coverage!