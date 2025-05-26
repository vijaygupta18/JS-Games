// Breakout Game Class
class BreakoutGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        // Game state
        this.gameActive = false;
        this.gamePaused = false;
        this.level = 1;
        this.score = 0;
        this.lives = 3;
        
        // Game objects
        this.ball = {
            x: this.canvas.width / 2,
            y: this.canvas.height - 50,
            dx: 5,
            dy: -5,
            radius: 8,
            speed: 5
        };
        
        this.paddle = {
            x: this.canvas.width / 2 - 60,
            y: this.canvas.height - 20,
            width: 120,
            height: 15,
            speed: 8
        };
        
        this.bricks = [];
        this.powerUps = [];
        this.particles = [];
        
        // Controls
        this.keys = {};
        this.mouseX = this.canvas.width / 2;
        
        // Power-up system
        this.activePowerUps = {
            multiball: false,
            largePaddle: false,
            slowBall: false,
            penetrating: false
        };
        this.powerUpTimers = {};
        
        // Statistics
        this.stats = JSON.parse(localStorage.getItem('breakoutStats')) || {
            highScore: 0,
            gamesPlayed: 0,
            levelsCompleted: 0,
            totalBricks: 0
        };
        
        // Animation frame
        this.animationId = null;
        
        this.init();
    }
    
    init() {
        this.bindEvents();
        this.updateDisplay();
        this.updateStatsDisplay();
        this.createLevel();
        this.render();
    }
    
    bindEvents() {
        // Button events
        document.getElementById('startBtn').addEventListener('click', () => this.startGame());
        document.getElementById('pauseBtn').addEventListener('click', () => this.togglePause());
        document.getElementById('resetBtn').addEventListener('click', () => this.resetGame());
        document.getElementById('powerUpBtn').addEventListener('click', () => this.activateRandomPowerUp());
        
        // Keyboard controls
        document.addEventListener('keydown', (e) => this.handleKeyDown(e));
        document.addEventListener('keyup', (e) => this.handleKeyUp(e));
        
        // Mouse controls
        this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        
        // Touch controls for mobile
        this.canvas.addEventListener('touchmove', (e) => this.handleTouchMove(e));
        this.canvas.addEventListener('touchstart', (e) => e.preventDefault());
    }
    
    handleKeyDown(e) {
        this.keys[e.key.toLowerCase()] = true;
        
        if (e.key === ' ') {
            e.preventDefault();
            if (this.gameActive) {
                this.togglePause();
            } else {
                this.startGame();
            }
        }
        
        if (e.key.toLowerCase() === 'r') {
            this.resetGame();
        }
    }
    
    handleKeyUp(e) {
        this.keys[e.key.toLowerCase()] = false;
    }
    
    handleMouseMove(e) {
        const rect = this.canvas.getBoundingClientRect();
        this.mouseX = e.clientX - rect.left;
    }
    
    handleTouchMove(e) {
        e.preventDefault();
        const rect = this.canvas.getBoundingClientRect();
        const touch = e.touches[0];
        this.mouseX = touch.clientX - rect.left;
    }
    
    startGame() {
        this.gameActive = true;
        this.gamePaused = false;
        
        this.hideOverlay();
        this.updateButtons();
        this.gameLoop();
        
        this.playSound('start');
    }
    
    togglePause() {
        if (!this.gameActive) return;
        
        this.gamePaused = !this.gamePaused;
        
        if (this.gamePaused) {
            this.showOverlay('Game Paused', 'Click Resume to continue');
            this.playSound('pause');
        } else {
            this.hideOverlay();
            this.gameLoop();
            this.playSound('resume');
        }
        
        this.updateButtons();
    }
    
    resetGame() {
        this.gameActive = false;
        this.gamePaused = false;
        this.level = 1;
        this.score = 0;
        this.lives = 3;
        
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        
        this.resetBall();
        this.resetPaddle();
        this.clearPowerUps();
        this.createLevel();
        this.updateDisplay();
        this.updateButtons();
        this.showOverlay('Breakout', 'Click Start to begin breaking bricks!');
        
        this.playSound('reset');
    }
    
    resetBall() {
        this.ball.x = this.canvas.width / 2;
        this.ball.y = this.canvas.height - 50;
        this.ball.dx = (Math.random() - 0.5) * 8;
        this.ball.dy = -Math.abs(this.ball.dy);
        this.ball.speed = 5 + (this.level - 1) * 0.5;
    }
    
    resetPaddle() {
        this.paddle.x = this.canvas.width / 2 - this.paddle.width / 2;
        this.paddle.width = 120;
    }
    
    createLevel() {
        this.bricks = [];
        const rows = 5 + Math.floor(this.level / 3);
        const cols = 10;
        const brickWidth = (this.canvas.width - 40) / cols;
        const brickHeight = 25;
        
        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                // Skip some bricks for variety in higher levels
                if (this.level > 3 && Math.random() < 0.1) continue;
                
                const brick = {
                    x: col * brickWidth + 20,
                    y: row * brickHeight + 50,
                    width: brickWidth - 2,
                    height: brickHeight - 2,
                    hits: Math.min(3, Math.floor(this.level / 2) + 1),
                    maxHits: Math.min(3, Math.floor(this.level / 2) + 1),
                    powerUp: Math.random() < 0.1 ? this.getRandomPowerUpType() : null
                };
                this.bricks.push(brick);
            }
        }
        
        this.updateDisplay();
    }
    
    getRandomPowerUpType() {
        const types = ['multiball', 'largePaddle', 'slowBall', 'penetrating', 'extraLife'];
        return types[Math.floor(Math.random() * types.length)];
    }
    
    gameLoop() {
        if (!this.gameActive || this.gamePaused) return;
        
        this.update();
        this.render();
        
        this.animationId = requestAnimationFrame(() => this.gameLoop());
    }
    
    update() {
        this.updatePaddle();
        this.updateBall();
        this.updatePowerUps();
        this.updateParticles();
        this.checkCollisions();
        this.checkGameState();
    }
    
    updatePaddle() {
        // Keyboard controls
        if (this.keys['a'] || this.keys['arrowleft']) {
            this.paddle.x = Math.max(0, this.paddle.x - this.paddle.speed);
        }
        if (this.keys['d'] || this.keys['arrowright']) {
            this.paddle.x = Math.min(this.canvas.width - this.paddle.width, this.paddle.x + this.paddle.speed);
        }
        
        // Mouse control
        const targetX = this.mouseX - this.paddle.width / 2;
        const clampedX = Math.max(0, Math.min(this.canvas.width - this.paddle.width, targetX));
        this.paddle.x += (clampedX - this.paddle.x) * 0.1;
    }
    
    updateBall() {
        this.ball.x += this.ball.dx;
        this.ball.y += this.ball.dy;
        
        // Wall collisions
        if (this.ball.x <= this.ball.radius || this.ball.x >= this.canvas.width - this.ball.radius) {
            this.ball.dx = -this.ball.dx;
            this.playSound('wallHit');
        }
        
        if (this.ball.y <= this.ball.radius) {
            this.ball.dy = -this.ball.dy;
            this.playSound('wallHit');
        }
        
        // Ball falls below paddle
        if (this.ball.y > this.canvas.height) {
            this.lives--;
            this.animateElement('livesDisplay');
            
            if (this.lives <= 0) {
                this.gameOver();
            } else {
                this.resetBall();
                this.playSound('loseLife');
            }
        }
    }
    
    updatePowerUps() {
        // Update falling power-ups
        for (let i = this.powerUps.length - 1; i >= 0; i--) {
            const powerUp = this.powerUps[i];
            powerUp.y += 3;
            
            // Check collision with paddle
            if (powerUp.y + powerUp.size >= this.paddle.y &&
                powerUp.x + powerUp.size >= this.paddle.x &&
                powerUp.x <= this.paddle.x + this.paddle.width) {
                
                this.activatePowerUp(powerUp.type);
                this.powerUps.splice(i, 1);
                continue;
            }
            
            // Remove if off screen
            if (powerUp.y > this.canvas.height) {
                this.powerUps.splice(i, 1);
            }
        }
        
        // Update power-up timers
        Object.keys(this.powerUpTimers).forEach(type => {
            this.powerUpTimers[type]--;
            if (this.powerUpTimers[type] <= 0) {
                this.deactivatePowerUp(type);
            }
        });
    }
    
    updateParticles() {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const particle = this.particles[i];
            particle.x += particle.dx;
            particle.y += particle.dy;
            particle.life--;
            
            if (particle.life <= 0) {
                this.particles.splice(i, 1);
            }
        }
    }
    
    checkCollisions() {
        // Ball-paddle collision
        if (this.ball.y + this.ball.radius >= this.paddle.y &&
            this.ball.x >= this.paddle.x &&
            this.ball.x <= this.paddle.x + this.paddle.width &&
            this.ball.dy > 0) {
            
            // Calculate hit position on paddle (0 to 1)
            const hitPos = (this.ball.x - this.paddle.x) / this.paddle.width;
            
            // Adjust ball angle based on hit position
            const angle = (hitPos - 0.5) * Math.PI / 3; // Max 60 degree angle
            const speed = Math.sqrt(this.ball.dx * this.ball.dx + this.ball.dy * this.ball.dy);
            
            this.ball.dx = Math.sin(angle) * speed;
            this.ball.dy = -Math.abs(Math.cos(angle) * speed);
            
            this.playSound('paddleHit');
        }
        
        // Ball-brick collisions
        for (let i = this.bricks.length - 1; i >= 0; i--) {
            const brick = this.bricks[i];
            
            if (this.ball.x + this.ball.radius >= brick.x &&
                this.ball.x - this.ball.radius <= brick.x + brick.width &&
                this.ball.y + this.ball.radius >= brick.y &&
                this.ball.y - this.ball.radius <= brick.y + brick.height) {
                
                // Determine collision side
                const ballCenterX = this.ball.x;
                const ballCenterY = this.ball.y;
                const brickCenterX = brick.x + brick.width / 2;
                const brickCenterY = brick.y + brick.height / 2;
                
                const dx = ballCenterX - brickCenterX;
                const dy = ballCenterY - brickCenterY;
                
                if (Math.abs(dx / brick.width) > Math.abs(dy / brick.height)) {
                    this.ball.dx = -this.ball.dx;
                } else {
                    this.ball.dy = -this.ball.dy;
                }
                
                // Damage brick
                brick.hits--;
                
                if (brick.hits <= 0) {
                    // Create particles
                    this.createParticles(brick.x + brick.width / 2, brick.y + brick.height / 2);
                    
                    // Drop power-up
                    if (brick.powerUp) {
                        this.powerUps.push({
                            x: brick.x + brick.width / 2,
                            y: brick.y + brick.height / 2,
                            type: brick.powerUp,
                            size: 20
                        });
                    }
                    
                    // Remove brick and update score
                    this.bricks.splice(i, 1);
                    this.score += 10 * this.level;
                    this.stats.totalBricks++;
                    this.animateElement('scoreDisplay');
                    this.playSound('brickBreak');
                } else {
                    this.playSound('brickHit');
                }
                
                // Don't penetrate unless power-up is active
                if (!this.activePowerUps.penetrating) {
                    break;
                }
            }
        }
    }
    
    createParticles(x, y) {
        for (let i = 0; i < 8; i++) {
            this.particles.push({
                x: x,
                y: y,
                dx: (Math.random() - 0.5) * 6,
                dy: (Math.random() - 0.5) * 6,
                life: 30,
                color: `hsl(${Math.random() * 360}, 70%, 60%)`
            });
        }
    }
    
    activatePowerUp(type) {
        switch (type) {
            case 'multiball':
                // Create additional balls
                for (let i = 0; i < 2; i++) {
                    // This would require multiple ball support
                }
                break;
            case 'largePaddle':
                this.paddle.width = 180;
                this.activePowerUps.largePaddle = true;
                this.powerUpTimers.largePaddle = 600; // 10 seconds at 60fps
                break;
            case 'slowBall':
                this.ball.dx *= 0.5;
                this.ball.dy *= 0.5;
                this.activePowerUps.slowBall = true;
                this.powerUpTimers.slowBall = 600;
                break;
            case 'penetrating':
                this.activePowerUps.penetrating = true;
                this.powerUpTimers.penetrating = 300; // 5 seconds
                break;
            case 'extraLife':
                this.lives++;
                this.animateElement('livesDisplay');
                break;
        }
        
        this.updateButtons();
        this.playSound('powerUp');
    }
    
    deactivatePowerUp(type) {
        switch (type) {
            case 'largePaddle':
                this.paddle.width = 120;
                this.activePowerUps.largePaddle = false;
                break;
            case 'slowBall':
                this.ball.dx *= 2;
                this.ball.dy *= 2;
                this.activePowerUps.slowBall = false;
                break;
            case 'penetrating':
                this.activePowerUps.penetrating = false;
                break;
        }
        
        delete this.powerUpTimers[type];
        this.updateButtons();
    }
    
    clearPowerUps() {
        this.activePowerUps = {
            multiball: false,
            largePaddle: false,
            slowBall: false,
            penetrating: false
        };
        this.powerUpTimers = {};
        this.powerUps = [];
    }
    
    activateRandomPowerUp() {
        const types = ['largePaddle', 'slowBall', 'penetrating'];
        const randomType = types[Math.floor(Math.random() * types.length)];
        this.activatePowerUp(randomType);
    }
    
    checkGameState() {
        // Level complete
        if (this.bricks.length === 0) {
            this.level++;
            this.stats.levelsCompleted++;
            this.createLevel();
            this.resetBall();
            this.showOverlay('Level Complete!', `Starting Level ${this.level}`);
            setTimeout(() => this.hideOverlay(), 2000);
            this.playSound('levelComplete');
        }
    }
    
    gameOver() {
        this.gameActive = false;
        
        // Update statistics
        this.stats.gamesPlayed++;
        if (this.score > this.stats.highScore) {
            this.stats.highScore = this.score;
        }
        
        localStorage.setItem('breakoutStats', JSON.stringify(this.stats));
        this.updateStatsDisplay();
        
        this.showOverlay('Game Over!', `Final Score: ${this.score}`);
        this.updateButtons();
        this.playSound('gameOver');
    }
    
    render() {
        // Clear canvas
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw bricks
        this.bricks.forEach(brick => {
            const intensity = brick.hits / brick.maxHits;
            this.ctx.fillStyle = `hsl(${200 + intensity * 60}, 70%, ${30 + intensity * 40}%)`;
            this.ctx.fillRect(brick.x, brick.y, brick.width, brick.height);
            
            // Draw brick border
            this.ctx.strokeStyle = '#fff';
            this.ctx.lineWidth = 1;
            this.ctx.strokeRect(brick.x, brick.y, brick.width, brick.height);
        });
        
        // Draw paddle
        this.ctx.fillStyle = this.activePowerUps.largePaddle ? '#f093fb' : '#667eea';
        this.ctx.fillRect(this.paddle.x, this.paddle.y, this.paddle.width, this.paddle.height);
        
        // Draw ball
        this.ctx.fillStyle = this.activePowerUps.penetrating ? '#ff6b6b' : '#fff';
        this.ctx.beginPath();
        this.ctx.arc(this.ball.x, this.ball.y, this.ball.radius, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Draw power-ups
        this.powerUps.forEach(powerUp => {
            this.ctx.fillStyle = this.getPowerUpColor(powerUp.type);
            this.ctx.fillRect(powerUp.x, powerUp.y, powerUp.size, powerUp.size);
            
            // Draw power-up icon
            this.ctx.fillStyle = '#fff';
            this.ctx.font = '12px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(
                this.getPowerUpIcon(powerUp.type),
                powerUp.x + powerUp.size / 2,
                powerUp.y + powerUp.size / 2 + 4
            );
        });
        
        // Draw particles
        this.particles.forEach(particle => {
            this.ctx.fillStyle = particle.color;
            this.ctx.fillRect(particle.x - 2, particle.y - 2, 4, 4);
        });
        
        // Draw level indicator
        this.ctx.fillStyle = '#fff';
        this.ctx.font = '20px Poppins';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(`Level ${this.level}`, this.canvas.width / 2, 30);
    }
    
    getPowerUpColor(type) {
        const colors = {
            multiball: '#ff6b6b',
            largePaddle: '#4ecdc4',
            slowBall: '#45b7d1',
            penetrating: '#f9ca24',
            extraLife: '#6c5ce7'
        };
        return colors[type] || '#fff';
    }
    
    getPowerUpIcon(type) {
        const icons = {
            multiball: '●●',
            largePaddle: '━━',
            slowBall: '⏱',
            penetrating: '⚡',
            extraLife: '♥'
        };
        return icons[type] || '?';
    }
    
    updateDisplay() {
        document.getElementById('scoreDisplay').textContent = this.score;
        document.getElementById('livesDisplay').textContent = this.lives;
        document.getElementById('levelDisplay').textContent = this.level;
        document.getElementById('bricksDisplay').textContent = this.bricks.length;
    }
    
    updateStatsDisplay() {
        document.getElementById('highScore').textContent = this.stats.highScore;
        document.getElementById('gamesPlayed').textContent = this.stats.gamesPlayed;
        document.getElementById('levelsCompleted').textContent = this.stats.levelsCompleted;
        document.getElementById('totalBricks').textContent = this.stats.totalBricks;
    }
    
    updateButtons() {
        const startBtn = document.getElementById('startBtn');
        const pauseBtn = document.getElementById('pauseBtn');
        const powerUpBtn = document.getElementById('powerUpBtn');
        
        if (this.gameActive) {
            startBtn.style.display = 'none';
            pauseBtn.disabled = false;
            
            if (this.gamePaused) {
                pauseBtn.innerHTML = '<i class="fas fa-play"></i> Resume';
            } else {
                pauseBtn.innerHTML = '<i class="fas fa-pause"></i> Pause';
            }
        } else {
            startBtn.style.display = 'flex';
            pauseBtn.disabled = true;
            pauseBtn.innerHTML = '<i class="fas fa-pause"></i> Pause';
        }
        
        // Power-up button
        const hasActivePowerUps = Object.values(this.activePowerUps).some(active => active);
        powerUpBtn.disabled = !this.gameActive || this.gamePaused;
        
        if (hasActivePowerUps) {
            powerUpBtn.classList.add('power-up-active');
        } else {
            powerUpBtn.classList.remove('power-up-active');
        }
    }
    
    showOverlay(title, message) {
        const overlay = document.getElementById('gameOverlay');
        document.getElementById('overlayTitle').textContent = title;
        document.getElementById('overlayMessage').textContent = message;
        overlay.style.display = 'flex';
    }
    
    hideOverlay() {
        document.getElementById('gameOverlay').style.display = 'none';
    }
    
    animateElement(elementId) {
        const element = document.getElementById(elementId);
        element.classList.add('animate');
        setTimeout(() => element.classList.remove('animate'), 300);
    }
    
    playSound(type) {
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            let frequency, duration, waveType = 'sine';
            
            switch (type) {
                case 'start': frequency = 440; duration = 0.2; break;
                case 'paddleHit': frequency = 600; duration = 0.1; waveType = 'square'; break;
                case 'wallHit': frequency = 800; duration = 0.1; break;
                case 'brickHit': frequency = 700; duration = 0.1; break;
                case 'brickBreak': frequency = 900; duration = 0.2; waveType = 'square'; break;
                case 'powerUp': frequency = 1200; duration = 0.3; waveType = 'square'; break;
                case 'loseLife': frequency = 300; duration = 0.3; waveType = 'sawtooth'; break;
                case 'levelComplete': frequency = 1000; duration = 0.5; waveType = 'square'; break;
                case 'gameOver': frequency = 250; duration = 0.5; waveType = 'sawtooth'; break;
                case 'pause': frequency = 400; duration = 0.1; break;
                case 'resume': frequency = 500; duration = 0.1; break;
                case 'reset': frequency = 350; duration = 0.15; break;
                default: return;
            }
            
            oscillator.frequency.value = frequency;
            oscillator.type = waveType;
            
            gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + duration);
        } catch (error) {
            console.log('Audio not supported');
        }
    }
}

// Initialize game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const game = new BreakoutGame();
    
    // Handle window resize
    window.addEventListener('resize', () => {
        const container = document.querySelector('.game-area');
        const containerWidth = container.clientWidth;
        
        if (containerWidth < 800) {
            game.canvas.style.width = '100%';
            game.canvas.style.height = 'auto';
        }
    });
    
    console.log('🧱 Breakout game initialized!');
    console.log('💡 Use SPACE to start/pause, A/D or mouse to control paddle, R to reset');
}); 