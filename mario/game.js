console.log("Script loading...");

class Game {
    constructor() {
        console.log("Game constructor called");
        this.canvas = document.getElementById('game-canvas');
        if (!this.canvas) {
            console.error('Canvas element not found');
            return;
        }
        console.log("Canvas found");
        this.ctx = this.canvas.getContext('2d');
        this.canvas.width = 800;
        this.canvas.height = 600;
        
        this.highScore = 0; // Add this line to track the high score
        this.resetGame();
        
        this.bindEvents();
        console.log("Game initialized");
    }
    
    resetGame() {
        this.player = new Player(50, 500, 40, 60);
        this.platforms = [
            new Platform(0, 560, 800, 40),
            new Platform(300, 450, 200, 20),
            new Platform(600, 350, 150, 20)
        ];
        
        this.keys = {};
        this.score = 0;
        this.isRunning = false;
        this.cameraX = 0;
    }
    
    bindEvents() {
        console.log("Binding events");
        window.addEventListener('keydown', (e) => this.handleKeyDown(e));
        window.addEventListener('keyup', (e) => this.handleKeyUp(e));
        const startButton = document.getElementById('start-button');
        if (startButton) {
            startButton.addEventListener('click', () => this.start());
            console.log("Start button event listener added");
        } else {
            console.error("Start button not found");
        }
    }
    
    handleKeyDown(e) {
        this.keys[e.code] = true;
    }
    
    handleKeyUp(e) {
        this.keys[e.code] = false;
    }
    
    start() {
        console.log("Game started");
        const startScreen = document.getElementById('start-screen');
        if (startScreen) {
            startScreen.style.display = 'none';
        } else {
            console.error("Start screen not found");
        }
        this.resetGame();
        this.isRunning = true;
        this.gameLoop();
    }
    
    gameLoop() {
        if (!this.isRunning) return;
        
        this.update();
        this.render();
        requestAnimationFrame(() => this.gameLoop());
    }
    
    update() {
        this.player.update(this.keys, this.platforms);
        this.updateCamera();
        this.generatePlatforms();
        this.removePlatforms();
        
        if (this.player.y + this.player.height >= this.canvas.height) {
            this.gameOver();
        }
    }
    
    updateCamera() {
        this.cameraX = this.player.x - this.canvas.width / 3;
    }
    
    generatePlatforms() {
        const lastPlatform = this.platforms[this.platforms.length - 1];
        if (lastPlatform.x < this.cameraX + this.canvas.width) {
            const x = lastPlatform.x + Math.random() * 200 + 100;
            const y = Math.random() * 200 + 300;
            const width = Math.random() * 100 + 50;
            this.platforms.push(new Platform(x, y, width, 20));
        }
    }
    
    removePlatforms() {
        this.platforms = this.platforms.filter(platform => platform.x + platform.width > this.cameraX);
    }
    
    render() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.save();
        this.ctx.translate(-this.cameraX, 0);
        
        this.platforms.forEach(platform => platform.draw(this.ctx));
        this.player.draw(this.ctx);
        
        this.ctx.restore();
        
        // Draw score (fixed position on screen)
        this.ctx.fillStyle = '#fff';
        this.ctx.font = '24px Arial';
        this.ctx.fillText(`Score: ${Math.floor(this.player.x / 100)}`, 20, 30);
    }
    
    gameOver() {
        console.log("Game Over");
        this.isRunning = false;
        const currentScore = Math.floor(this.player.x / 100);
        this.highScore = Math.max(this.highScore, currentScore);
        
        const startScreen = document.getElementById('start-screen');
        if (startScreen) {
            startScreen.style.display = 'flex';
            startScreen.innerHTML = ''; // Clear previous content
            
            const scoreDisplay = document.createElement('div');
            scoreDisplay.innerHTML = `
                <h2>Game Over!</h2>
                <p>Score: ${currentScore}</p>
                <p>Highest Score: ${this.highScore}</p>
            `;
            startScreen.appendChild(scoreDisplay);
            
            const startButton = document.createElement('button');
            startButton.id = 'start-button';
            startButton.textContent = 'Play Again';
            startButton.addEventListener('click', () => this.start());
            startScreen.appendChild(startButton);
        } else {
            console.error("Start screen not found");
        }
    }
}

class Player {
    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.speedX = 0;
        this.speedY = 0;
        this.gravity = 0.5;
        this.jumpStrength = -12;
        this.onGround = false;
    }
    
    update(keys, platforms) {
        // Horizontal movement
        if (keys['ArrowLeft']) this.speedX = -5;
        else if (keys['ArrowRight']) this.speedX = 5;
        else this.speedX = 0;
        
        // Apply gravity
        this.speedY += this.gravity;
        
        // Jump
        if (keys['Space'] && this.onGround) {
            this.speedY = this.jumpStrength;
            this.onGround = false;
        }
        
        // Update position
        this.x += this.speedX;
        this.y += this.speedY;
        
        // Platform collision
        this.onGround = false;
        platforms.forEach(platform => {
            if (this.x < platform.x + platform.width &&
                this.x + this.width > platform.x &&
                this.y + this.height > platform.y &&
                this.y < platform.y + platform.height) {
                
                if (this.speedY > 0) {
                    this.y = platform.y - this.height;
                    this.speedY = 0;
                    this.onGround = true;
                }
            }
        });
    }
    
    draw(ctx) {
        ctx.fillStyle = 'red';
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }
}

class Platform {
    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }
    
    draw(ctx) {
        ctx.fillStyle = 'green';
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }
}

console.log("Script loaded");

// Use DOMContentLoaded instead of load event
document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM fully loaded");
    window.game = new Game();
    // Don't automatically start the game, wait for user input
});
