// Game canvas and context
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Set canvas size
canvas.width = 800;
canvas.height = 600;

// Game state
let gameState = {
    running: false,
    paused: false,
    score: 0,
    lives: 3,
    level: 1,
    highScore: localStorage.getItem('highScore') || 0,
    soundEnabled: true
};

// Display elements
const scoreElement = document.getElementById('score');
const livesElement = document.getElementById('lives');
const levelElement = document.getElementById('level');
const highScoreElement = document.getElementById('high-score');
const finalScoreElement = document.getElementById('final-score');

// Buttons
const startButton = document.getElementById('start-button');
const pauseButton = document.getElementById('pause-button');
const resetButton = document.getElementById('reset-button');
const soundToggle = document.getElementById('sound-toggle');
const playAgainButton = document.getElementById('play-again');
const resumeButton = document.getElementById('resume-button');

// Screens
const gameOverScreen = document.getElementById('game-over-screen');
const pauseScreen = document.getElementById('pause-screen');

// Game objects
let ship = null;
let asteroids = [];
let bullets = [];
let particles = [];

// Ship class
class Ship {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.angle = -Math.PI / 2;
        this.velocity = { x: 0, y: 0 };
        this.radius = 10;
        this.thrusting = false;
        this.invulnerable = false;
        this.invulnerabilityTime = 0;
    }

    update(deltaTime) {
        // Normalize deltaTime to 60 FPS (16.67ms per frame)
        const normalizedDelta = Math.min(deltaTime / 16.67, 2); // Cap at 2x speed to prevent huge jumps

        // Update position
        this.x += this.velocity.x * normalizedDelta;
        this.y += this.velocity.y * normalizedDelta;

        // Apply friction
        this.velocity.x *= 0.99;
        this.velocity.y *= 0.99;

        // Wrap around screen
        if (this.x < 0) this.x = canvas.width;
        if (this.x > canvas.width) this.x = 0;
        if (this.y < 0) this.y = canvas.height;
        if (this.y > canvas.height) this.y = 0;

        // Update invulnerability
        if (this.invulnerable) {
            this.invulnerabilityTime -= deltaTime;
            if (this.invulnerabilityTime <= 0) {
                this.invulnerable = false;
            }
        }
    }

    thrust() {
        const force = 0.5;
        this.velocity.x += Math.cos(this.angle) * force;
        this.velocity.y += Math.sin(this.angle) * force;
        this.thrusting = true;

        // Create thrust particles
        if (Math.random() < 0.7) {
            particles.push(new Particle(
                this.x - Math.cos(this.angle) * 15,
                this.y - Math.sin(this.angle) * 15,
                -this.velocity.x * 0.5 + (Math.random() - 0.5) * 2,
                -this.velocity.y * 0.5 + (Math.random() - 0.5) * 2,
                'orange'
            ));
        }
    }

    rotate(direction) {
        this.angle += direction * 0.1;
    }

    shoot() {
        bullets.push(new Bullet(this.x, this.y, this.angle));
    }

    draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);

        // Draw ship with invulnerability blink
        if (!this.invulnerable || Math.floor(Date.now() / 100) % 2) {
            ctx.strokeStyle = '#00ff00';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(15, 0);
            ctx.lineTo(-10, -10);
            ctx.lineTo(-5, 0);
            ctx.lineTo(-10, 10);
            ctx.closePath();
            ctx.stroke();

            // Draw thrust flame
            if (this.thrusting) {
                ctx.strokeStyle = 'orange';
                ctx.beginPath();
                ctx.moveTo(-5, -5);
                ctx.lineTo(-15 - Math.random() * 5, 0);
                ctx.lineTo(-5, 5);
                ctx.stroke();
                this.thrusting = false;
            }
        }

        ctx.restore();
    }

    respawn() {
        this.x = canvas.width / 2;
        this.y = canvas.height / 2;
        this.velocity = { x: 0, y: 0 };
        this.angle = -Math.PI / 2;
        this.invulnerable = true;
        this.invulnerabilityTime = 3000;
    }
}

// Asteroid class
class Asteroid {
    constructor(x, y, radius, level = 1) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.level = level;
        this.velocity = {
            x: (Math.random() - 0.5) * 2 * (4 - level),
            y: (Math.random() - 0.5) * 2 * (4 - level)
        };
        this.rotation = 0;
        this.rotationSpeed = (Math.random() - 0.5) * 0.05;
        this.vertices = this.generateVertices();
    }

    generateVertices() {
        const vertices = [];
        const numVertices = 8 + Math.floor(Math.random() * 5);
        for (let i = 0; i < numVertices; i++) {
            const angle = (i / numVertices) * Math.PI * 2;
            const variance = 0.8 + Math.random() * 0.4;
            vertices.push({
                x: Math.cos(angle) * this.radius * variance,
                y: Math.sin(angle) * this.radius * variance
            });
        }
        return vertices;
    }

    update(deltaTime) {
        // Normalize deltaTime for consistent speed
        const normalizedDelta = Math.min(deltaTime / 16.67, 2);

        this.x += this.velocity.x * normalizedDelta;
        this.y += this.velocity.y * normalizedDelta;
        this.rotation += this.rotationSpeed * normalizedDelta;

        // Wrap around screen
        if (this.x < -this.radius) this.x = canvas.width + this.radius;
        if (this.x > canvas.width + this.radius) this.x = -this.radius;
        if (this.y < -this.radius) this.y = canvas.height + this.radius;
        if (this.y > canvas.height + this.radius) this.y = -this.radius;
    }

    draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);

        ctx.strokeStyle = '#00ff00';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(this.vertices[0].x, this.vertices[0].y);
        for (let i = 1; i < this.vertices.length; i++) {
            ctx.lineTo(this.vertices[i].x, this.vertices[i].y);
        }
        ctx.closePath();
        ctx.stroke();

        ctx.restore();
    }

    split() {
        const newAsteroids = [];
        if (this.level < 3) {
            for (let i = 0; i < 2; i++) {
                newAsteroids.push(new Asteroid(
                    this.x + Math.random() * 20 - 10,
                    this.y + Math.random() * 20 - 10,
                    this.radius / 1.5,
                    this.level + 1
                ));
            }
        }
        return newAsteroids;
    }
}

// Bullet class
class Bullet {
    constructor(x, y, angle) {
        this.x = x;
        this.y = y;
        this.velocity = {
            x: Math.cos(angle) * 10,
            y: Math.sin(angle) * 10
        };
        this.radius = 2;
        this.lifetime = 1000;
    }

    update(deltaTime) {
        // Normalize deltaTime for consistent speed
        const normalizedDelta = Math.min(deltaTime / 16.67, 2);

        this.x += this.velocity.x * normalizedDelta;
        this.y += this.velocity.y * normalizedDelta;
        this.lifetime -= deltaTime; // Keep lifetime in real time

        // Wrap around screen
        if (this.x < 0) this.x = canvas.width;
        if (this.x > canvas.width) this.x = 0;
        if (this.y < 0) this.y = canvas.height;
        if (this.y > canvas.height) this.y = 0;
    }

    draw() {
        ctx.fillStyle = '#ffff00';
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#ffff00';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
    }
}

// Particle class for effects
class Particle {
    constructor(x, y, vx, vy, color = '#00ff00') {
        this.x = x;
        this.y = y;
        this.velocity = { x: vx, y: vy };
        this.color = color;
        this.lifetime = 500;
        this.maxLifetime = 500;
    }

    update(deltaTime) {
        // Normalize deltaTime for consistent speed
        const normalizedDelta = Math.min(deltaTime / 16.67, 2);

        this.x += this.velocity.x * normalizedDelta;
        this.y += this.velocity.y * normalizedDelta;
        this.lifetime -= deltaTime;
    }

    draw() {
        const opacity = this.lifetime / this.maxLifetime;
        ctx.fillStyle = this.color;
        ctx.globalAlpha = opacity;
        ctx.fillRect(this.x - 1, this.y - 1, 2, 2);
        ctx.globalAlpha = 1;
    }
}

// Input handling
const keys = {};

document.addEventListener('keydown', (e) => {
    keys[e.key] = true;

    if (e.key === 'p' || e.key === 'P') {
        togglePause();
    }
});

document.addEventListener('keyup', (e) => {
    keys[e.key] = false;
});

// Collision detection
function checkCollision(obj1, obj2) {
    const dx = obj1.x - obj2.x;
    const dy = obj1.y - obj2.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance < obj1.radius + obj2.radius;
}

// Create explosion effect
function createExplosion(x, y, color = '#00ff00') {
    for (let i = 0; i < 20; i++) {
        const angle = (i / 20) * Math.PI * 2;
        const speed = 2 + Math.random() * 3;
        particles.push(new Particle(
            x, y,
            Math.cos(angle) * speed,
            Math.sin(angle) * speed,
            color
        ));
    }
}

// Initialize game
function initGame() {
    ship = new Ship(canvas.width / 2, canvas.height / 2);
    asteroids = [];
    bullets = [];
    particles = [];

    // Update window references for testing
    if (typeof window !== 'undefined') {
        window.ship = ship;
        window.asteroids = asteroids;
        window.bullets = bullets;
        window.particles = particles;
    }

    // Create initial asteroids
    createAsteroids(gameState.level + 3);

    updateDisplay();
}

// Create asteroids for level
function createAsteroids(count) {
    for (let i = 0; i < count; i++) {
        let x, y;
        do {
            x = Math.random() * canvas.width;
            y = Math.random() * canvas.height;
        } while (Math.sqrt((x - ship.x) ** 2 + (y - ship.y) ** 2) < 150);

        asteroids.push(new Asteroid(x, y, 40, 1));
    }
}

// Update display
function updateDisplay() {
    scoreElement.textContent = gameState.score;
    livesElement.textContent = gameState.lives;
    levelElement.textContent = gameState.level;
    highScoreElement.textContent = gameState.highScore;
}

// Game loop
let lastTime = 0;
function gameLoop(timestamp) {
    // Initialize lastTime on first frame
    if (lastTime === 0) {
        lastTime = timestamp;
        requestAnimationFrame(gameLoop);
        return;
    }

    const deltaTime = Math.min(timestamp - lastTime, 100); // Cap deltaTime to 100ms to prevent huge jumps
    lastTime = timestamp;

    if (!gameState.running || gameState.paused) {
        requestAnimationFrame(gameLoop);
        return;
    }

    // Clear canvas
    ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Handle input
    if (keys['ArrowUp'] || keys['w'] || keys['W']) {
        ship.thrust();
    }
    if (keys['ArrowLeft'] || keys['a'] || keys['A']) {
        ship.rotate(-1);
    }
    if (keys['ArrowRight'] || keys['d'] || keys['D']) {
        ship.rotate(1);
    }
    if (keys[' ']) {
        if (!keys.spacePressed) {
            ship.shoot();
            keys.spacePressed = true;
        }
    } else {
        keys.spacePressed = false;
    }

    // Update and draw ship
    ship.update(deltaTime);
    ship.draw();

    // Update and draw asteroids
    for (let i = asteroids.length - 1; i >= 0; i--) {
        const asteroid = asteroids[i];
        asteroid.update(deltaTime);
        asteroid.draw();

        // Check collision with ship
        if (!ship.invulnerable && checkCollision(ship, asteroid)) {
            createExplosion(ship.x, ship.y, '#ff0000');
            gameState.lives--;
            updateDisplay();

            if (gameState.lives <= 0) {
                endGame();
            } else {
                ship.respawn();
            }
        }
    }

    // Update and draw bullets
    for (let i = bullets.length - 1; i >= 0; i--) {
        const bullet = bullets[i];
        bullet.update(deltaTime);
        bullet.draw();

        if (bullet.lifetime <= 0) {
            bullets.splice(i, 1);
            continue;
        }

        // Check collision with asteroids
        for (let j = asteroids.length - 1; j >= 0; j--) {
            const asteroid = asteroids[j];
            if (checkCollision(bullet, asteroid)) {
                createExplosion(asteroid.x, asteroid.y);

                // Add score
                gameState.score += asteroid.level * 100;
                updateDisplay();

                // Split asteroid
                const newAsteroids = asteroid.split();
                asteroids.push(...newAsteroids);

                // Remove bullet and asteroid
                bullets.splice(i, 1);
                asteroids.splice(j, 1);
                break;
            }
        }
    }

    // Update and draw particles
    for (let i = particles.length - 1; i >= 0; i--) {
        const particle = particles[i];
        particle.update(deltaTime);
        particle.draw();

        if (particle.lifetime <= 0) {
            particles.splice(i, 1);
        }
    }

    // Check for level completion
    if (asteroids.length === 0) {
        gameState.level++;
        gameState.score += 1000;
        updateDisplay();
        createAsteroids(gameState.level + 3);
    }

    // Update high score
    if (gameState.score > gameState.highScore) {
        gameState.highScore = gameState.score;
        localStorage.setItem('highScore', gameState.highScore);
        updateDisplay();
    }

    requestAnimationFrame(gameLoop);
}

// Start game
function startGame() {
    gameState.running = true;
    gameState.paused = false;
    gameState.score = 0;
    gameState.lives = 3;
    gameState.level = 1;

    initGame();

    startButton.disabled = true;
    pauseButton.disabled = false;
    gameOverScreen.classList.add('hidden');

    lastTime = 0; // Reset frame timing
    requestAnimationFrame(gameLoop);
}

// Pause/Resume game
function togglePause() {
    if (!gameState.running) return;

    gameState.paused = !gameState.paused;

    if (gameState.paused) {
        pauseScreen.classList.remove('hidden');
        pauseButton.textContent = 'Resume';
    } else {
        pauseScreen.classList.add('hidden');
        pauseButton.textContent = 'Pause';
    }
}

// End game
function endGame() {
    gameState.running = false;
    finalScoreElement.textContent = gameState.score;
    gameOverScreen.classList.remove('hidden');
    startButton.disabled = false;
    pauseButton.disabled = true;
}

// Reset game
function resetGame() {
    gameState.running = false;
    gameState.paused = false;
    gameState.score = 0;
    gameState.lives = 3;
    gameState.level = 1;

    ship = null;
    asteroids = [];
    bullets = [];
    particles = [];

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    updateDisplay();

    gameOverScreen.classList.add('hidden');
    pauseScreen.classList.add('hidden');
    startButton.disabled = false;
    pauseButton.disabled = true;
    pauseButton.textContent = 'Pause';
}

// Toggle sound
function toggleSound() {
    gameState.soundEnabled = !gameState.soundEnabled;
    soundToggle.textContent = `Sound: ${gameState.soundEnabled ? 'ON' : 'OFF'}`;
}

// Event listeners
startButton.addEventListener('click', startGame);
pauseButton.addEventListener('click', togglePause);
resetButton.addEventListener('click', resetGame);
soundToggle.addEventListener('click', toggleSound);
playAgainButton.addEventListener('click', () => {
    resetGame();
    startGame();
});
resumeButton.addEventListener('click', togglePause);

// Initialize display
updateDisplay();

// Expose game objects for testing
if (typeof window !== 'undefined') {
    window.gameState = gameState;
    window.ship = ship;
    window.asteroids = asteroids;
    window.bullets = bullets;
    window.particles = particles;
    window.updateDisplay = updateDisplay;
    window.endGame = endGame;
    window.createExplosion = createExplosion;
    window.checkCollision = checkCollision;
    window.Ship = Ship;
    window.Asteroid = Asteroid;
    window.Bullet = Bullet;
    window.Particle = Particle;
}