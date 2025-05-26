// Snake Game Class
class SnakeGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.gridSize = 20;
        this.tileCount = this.canvas.width / this.gridSize;

        // Game state
        this.snake = [{ x: 10, y: 10 }];
        this.food = { x: 15, y: 15 };
        this.dx = 0;
        this.dy = 0;
        this.score = 0;
        this.level = 1;
        this.gameRunning = false;
        this.gamePaused = false;
        this.baseSpeed = parseInt(document.getElementById('speedSlider')?.value || 150, 10);
        this.gameSpeed = this.baseSpeed;

        // High score
        this.highScore = parseInt(localStorage.getItem('snakeHighScore')) || 0;

        // Game loop
        this.gameLoop = null;

        this.init();
    }
    
    init() {
        this.bindEvents();
        this.updateDisplay();
        this.drawGame();
        this.generateFood();
        // Set up speed slider
        const speedSlider = document.getElementById('speedSlider');
        const speedValue = document.getElementById('speedValue');
        if (speedSlider && speedValue) {
            speedSlider.value = this.baseSpeed;
            speedValue.textContent = this.baseSpeed;
            speedSlider.addEventListener('input', (e) => {
                const val = parseInt(e.target.value, 10);
                speedValue.textContent = val;
                this.baseSpeed = val;
                if (!this.gameRunning) {
                    this.gameSpeed = val;
                }
                if (this.gameRunning && !this.gamePaused) {
                    clearInterval(this.gameLoop);
                    this.gameSpeed = val;
                    this.gameLoop = setInterval(() => this.update(), this.gameSpeed);
                }
            });
        }
    }
    
    bindEvents() {
        // Control buttons
        document.getElementById('startBtn').addEventListener('click', () => this.startGame());
        document.getElementById('pauseBtn').addEventListener('click', () => this.togglePause());
        document.getElementById('resetBtn').addEventListener('click', () => this.resetGame());
        document.getElementById('playAgainBtn').addEventListener('click', () => this.resetGame());
        
        // Keyboard controls
        document.addEventListener('keydown', (e) => this.handleKeyPress(e));
        
        // Mobile controls
        document.querySelectorAll('.control-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const direction = e.target.closest('.control-btn').dataset.direction;
                this.changeDirection(direction);
            });
        });
        
        // Prevent scrolling on mobile when using controls
        document.addEventListener('touchstart', (e) => {
            if (e.target.closest('.control-btn')) {
                e.preventDefault();
            }
        });
    }
    
    handleKeyPress(e) {
        if (!this.gameRunning && !this.gamePaused) return;
        
        const key = e.key.toLowerCase();
        
        // Movement controls
        if (key === 'arrowup' || key === 'w') {
            this.changeDirection('up');
        } else if (key === 'arrowdown' || key === 's') {
            this.changeDirection('down');
        } else if (key === 'arrowleft' || key === 'a') {
            this.changeDirection('left');
        } else if (key === 'arrowright' || key === 'd') {
            this.changeDirection('right');
        }
        
        // Game controls
        if (key === ' ' || key === 'p') {
            e.preventDefault();
            this.togglePause();
        }
        
        if (key === 'r') {
            this.resetGame();
        }
    }
    
    changeDirection(direction) {
        if (!this.gameRunning || this.gamePaused) return;
        
        // Prevent reverse direction
        switch (direction) {
            case 'up':
                if (this.dy !== 1) {
                    this.dx = 0;
                    this.dy = -1;
                }
                break;
            case 'down':
                if (this.dy !== -1) {
                    this.dx = 0;
                    this.dy = 1;
                }
                break;
            case 'left':
                if (this.dx !== 1) {
                    this.dx = -1;
                    this.dy = 0;
                }
                break;
            case 'right':
                if (this.dx !== -1) {
                    this.dx = 1;
                    this.dy = 0;
                }
                break;
        }
    }
    
    startGame() {
        if (this.gameRunning) return;
        
        this.gameRunning = true;
        this.gamePaused = false;
        
        // Start moving right
        this.dx = 1;
        this.dy = 0;
        
        this.updateButtons();
        this.gameLoop = setInterval(() => this.update(), this.gameSpeed);
        
        this.playSound('start');
    }
    
    togglePause() {
        if (!this.gameRunning) return;
        
        this.gamePaused = !this.gamePaused;
        
        if (this.gamePaused) {
            clearInterval(this.gameLoop);
            this.playSound('pause');
        } else {
            this.gameLoop = setInterval(() => this.update(), this.gameSpeed);
            this.playSound('resume');
        }
        
        this.updateButtons();
    }
    
    resetGame() {
        clearInterval(this.gameLoop);
        
        // Reset game state
        this.snake = [{ x: 10, y: 10 }];
        this.dx = 0;
        this.dy = 0;
        this.score = 0;
        this.level = 1;
        this.gameRunning = false;
        this.gamePaused = false;
        this.gameSpeed = this.baseSpeed;
        
        this.generateFood();
        this.updateDisplay();
        this.updateButtons();
        this.hideGameOver();
        this.drawGame();
        
        this.playSound('reset');
    }
    
    update() {
        if (this.gamePaused) return;
        
        this.moveSnake();
        
        if (this.checkCollision()) {
            this.gameOver();
            return;
        }
        
        if (this.checkFoodCollision()) {
            this.eatFood();
        }
        
        this.drawGame();
    }
    
    moveSnake() {
        const head = { x: this.snake[0].x + this.dx, y: this.snake[0].y + this.dy };
        this.snake.unshift(head);
        
        // Remove tail if no food eaten
        if (!this.checkFoodCollision()) {
            this.snake.pop();
        }
    }
    
    checkCollision() {
        const head = this.snake[0];
        
        // Wall collision
        if (head.x < 0 || head.x >= this.tileCount || head.y < 0 || head.y >= this.tileCount) {
            return true;
        }
        
        // Self collision
        for (let i = 1; i < this.snake.length; i++) {
            if (head.x === this.snake[i].x && head.y === this.snake[i].y) {
                return true;
            }
        }
        
        return false;
    }
    
    checkFoodCollision() {
        const head = this.snake[0];
        return head.x === this.food.x && head.y === this.food.y;
    }
    
    eatFood() {
        this.score += 10;
        this.generateFood();
        this.updateLevel();
        this.updateDisplay();
        this.animateScore();
        this.playSound('eat');
    }
    
    generateFood() {
        let newFood;
        do {
            newFood = {
                x: Math.floor(Math.random() * this.tileCount),
                y: Math.floor(Math.random() * this.tileCount)
            };
        } while (this.snake.some(segment => segment.x === newFood.x && segment.y === newFood.y));
        
        this.food = newFood;
    }
    
    updateLevel() {
        const newLevel = Math.floor(this.score / 100) + 1;
        if (newLevel > this.level) {
            this.level = newLevel;
            // Speed up, but always respect the slider's minimum
            this.gameSpeed = Math.max(30, this.baseSpeed - (this.level - 1) * 10);
            clearInterval(this.gameLoop);
            this.gameLoop = setInterval(() => this.update(), this.gameSpeed);
            this.playSound('levelUp');
        }
    }
    
    gameOver() {
        clearInterval(this.gameLoop);
        this.gameRunning = false;
        this.gamePaused = false;
        
        // Update high score
        if (this.score > this.highScore) {
            this.highScore = this.score;
            localStorage.setItem('snakeHighScore', this.highScore);
            this.updateDisplay();
        }
        
        this.showGameOver();
        this.updateButtons();
        this.playSound('gameOver');
    }
    
    drawGame() {
        // Clear canvas
        this.ctx.fillStyle = '#1a202c';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw grid (optional)
        this.drawGrid();
        
        // Draw snake
        this.drawSnake();
        
        // Draw food
        this.drawFood();
        
        // Draw pause indicator
        if (this.gamePaused) {
            this.drawPauseIndicator();
        }
    }
    
    drawGrid() {
        this.ctx.strokeStyle = '#2d3748';
        this.ctx.lineWidth = 1;
        
        for (let i = 0; i <= this.tileCount; i++) {
            // Vertical lines
            this.ctx.beginPath();
            this.ctx.moveTo(i * this.gridSize, 0);
            this.ctx.lineTo(i * this.gridSize, this.canvas.height);
            this.ctx.stroke();
            
            // Horizontal lines
            this.ctx.beginPath();
            this.ctx.moveTo(0, i * this.gridSize);
            this.ctx.lineTo(this.canvas.width, i * this.gridSize);
            this.ctx.stroke();
        }
    }
    
    drawSnake() {
        this.snake.forEach((segment, index) => {
            const x = segment.x * this.gridSize;
            const y = segment.y * this.gridSize;
            // Shadow for 3D effect
            this.ctx.save();
            this.ctx.globalAlpha = 0.25;
            this.ctx.fillStyle = '#222';
            this.ctx.beginPath();
            this.ctx.ellipse(x + this.gridSize / 2, y + this.gridSize - 2, this.gridSize / 2.2, 3, 0, 0, 2 * Math.PI);
            this.ctx.fill();
            this.ctx.restore();

            if (index === 0) {
                // Head with 3D gradient
                const grad = this.ctx.createRadialGradient(
                    x + this.gridSize * 0.35, y + this.gridSize * 0.35, this.gridSize * 0.1,
                    x + this.gridSize / 2, y + this.gridSize / 2, this.gridSize / 2
                );
                grad.addColorStop(0, '#7fffd4');
                grad.addColorStop(0.5, '#48bb78');
                grad.addColorStop(1, '#276749');
                this.ctx.fillStyle = grad;
                this.ctx.beginPath();
                this.ctx.arc(x + this.gridSize / 2, y + this.gridSize / 2, this.gridSize / 2 - 2, 0, 2 * Math.PI);
                this.ctx.fill();

                // Eyes (slightly raised for 3D look)
                this.ctx.fillStyle = '#222';
                const eyeSize = 3;
                let eye1 = { ex: 0, ey: 0 }, eye2 = { ex: 0, ey: 0 };
                if (this.dx === 1) { // Right
                    eye1 = { ex: x + this.gridSize * 0.7, ey: y + this.gridSize * 0.35 };
                    eye2 = { ex: x + this.gridSize * 0.7, ey: y + this.gridSize * 0.65 };
                } else if (this.dx === -1) { // Left
                    eye1 = { ex: x + this.gridSize * 0.3, ey: y + this.gridSize * 0.35 };
                    eye2 = { ex: x + this.gridSize * 0.3, ey: y + this.gridSize * 0.65 };
                } else if (this.dy === -1) { // Up
                    eye1 = { ex: x + this.gridSize * 0.35, ey: y + this.gridSize * 0.3 };
                    eye2 = { ex: x + this.gridSize * 0.65, ey: y + this.gridSize * 0.3 };
                } else { // Down or default
                    eye1 = { ex: x + this.gridSize * 0.35, ey: y + this.gridSize * 0.7 };
                    eye2 = { ex: x + this.gridSize * 0.65, ey: y + this.gridSize * 0.7 };
                }
                this.ctx.beginPath();
                this.ctx.arc(eye1.ex, eye1.ey, eyeSize, 0, 2 * Math.PI);
                this.ctx.arc(eye2.ex, eye2.ey, eyeSize, 0, 2 * Math.PI);
                this.ctx.fill();

                // Head highlight
                this.ctx.save();
                this.ctx.globalAlpha = 0.18;
                this.ctx.beginPath();
                this.ctx.arc(x + this.gridSize * 0.6, y + this.gridSize * 0.4, this.gridSize * 0.18, 0, 2 * Math.PI);
                this.ctx.fillStyle = '#fff';
                this.ctx.fill();
                this.ctx.restore();
            } else {
                // Body with 3D gradient
                const grad = this.ctx.createLinearGradient(x, y, x + this.gridSize, y + this.gridSize);
                grad.addColorStop(0, '#276749');
                grad.addColorStop(0.5, '#48bb78');
                grad.addColorStop(1, '#7fffd4');
                this.ctx.fillStyle = grad;
                this.ctx.beginPath();
                this.ctx.arc(x + this.gridSize / 2, y + this.gridSize / 2, this.gridSize / 2.3, 0, 2 * Math.PI);
                this.ctx.fill();
            }
        });
    }
    
    drawFood() {
        const x = this.food.x * this.gridSize;
        const y = this.food.y * this.gridSize;
        // Shadow for 3D effect
        this.ctx.save();
        this.ctx.globalAlpha = 0.22;
        this.ctx.fillStyle = '#222';
        this.ctx.beginPath();
        this.ctx.ellipse(x + this.gridSize / 2, y + this.gridSize - 2, this.gridSize / 2.3, 3, 0, 0, 2 * Math.PI);
        this.ctx.fill();
        this.ctx.restore();

        // 3D apple body
        const grad = this.ctx.createRadialGradient(
            x + this.gridSize * 0.35, y + this.gridSize * 0.35, this.gridSize * 0.1,
            x + this.gridSize / 2, y + this.gridSize / 2, this.gridSize / 2
        );
        grad.addColorStop(0, '#fff5f5');
        grad.addColorStop(0.4, '#f56565');
        grad.addColorStop(1, '#a10000');
        this.ctx.fillStyle = grad;
        this.ctx.beginPath();
        this.ctx.arc(x + this.gridSize / 2, y + this.gridSize / 2, this.gridSize / 2 - 2, 0, 2 * Math.PI);
        this.ctx.fill();

        // Apple highlight
        this.ctx.save();
        this.ctx.globalAlpha = 0.18;
        this.ctx.beginPath();
        this.ctx.arc(x + this.gridSize * 0.6, y + this.gridSize * 0.4, this.gridSize * 0.18, 0, 2 * Math.PI);
        this.ctx.fillStyle = '#fff';
        this.ctx.fill();
        this.ctx.restore();

        // Apple stem
        this.ctx.save();
        this.ctx.strokeStyle = '#654321';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.moveTo(x + this.gridSize / 2, y + this.gridSize / 2 - this.gridSize * 0.3);
        this.ctx.lineTo(x + this.gridSize / 2, y + this.gridSize / 2 - this.gridSize * 0.45);
        this.ctx.stroke();
        this.ctx.restore();
    }
    
    drawPauseIndicator() {
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = 'bold 24px Poppins';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('PAUSED', this.canvas.width / 2, this.canvas.height / 2);
        
        this.ctx.font = '14px Poppins';
        this.ctx.fillText('Press SPACE or P to resume', this.canvas.width / 2, this.canvas.height / 2 + 30);
    }
    
    updateDisplay() {
        document.getElementById('currentScore').textContent = this.score;
        document.getElementById('highScore').textContent = this.highScore;
        document.getElementById('currentLevel').textContent = this.level;
    }
    
    animateScore() {
        const scoreElement = document.getElementById('currentScore');
        scoreElement.classList.add('animate');
        setTimeout(() => scoreElement.classList.remove('animate'), 300);
    }
    
    updateButtons() {
        const startBtn = document.getElementById('startBtn');
        const pauseBtn = document.getElementById('pauseBtn');
        
        if (this.gameRunning) {
            startBtn.disabled = true;
            pauseBtn.disabled = false;
            
            if (this.gamePaused) {
                pauseBtn.innerHTML = '<i class="fas fa-play"></i> Resume';
            } else {
                pauseBtn.innerHTML = '<i class="fas fa-pause"></i> Pause';
            }
        } else {
            startBtn.disabled = false;
            pauseBtn.disabled = true;
            pauseBtn.innerHTML = '<i class="fas fa-pause"></i> Pause';
        }
    }
    
    showGameOver() {
        const overlay = document.getElementById('gameOverlay');
        const finalScore = document.getElementById('finalScore');
        const resultMessage = document.getElementById('resultMessage');
        
        finalScore.textContent = this.score;
        
        if (this.score === this.highScore && this.score > 0) {
            resultMessage.textContent = 'New High Score! 🎉';
        } else if (this.score >= 200) {
            resultMessage.textContent = 'Excellent performance! 🌟';
        } else if (this.score >= 100) {
            resultMessage.textContent = 'Great job! 👏';
        } else {
            resultMessage.textContent = 'Keep practicing! 💪';
        }
        
        overlay.style.display = 'flex';
    }
    
    hideGameOver() {
        document.getElementById('gameOverlay').style.display = 'none';
    }
    
    playSound(type) {
        try {
            const ctx = new (window.AudioContext || window.webkitAudioContext)();
            let now = ctx.currentTime;
            let gain = ctx.createGain();
            gain.connect(ctx.destination);
            gain.gain.value = 0.12;

            // Helper for richer sound
            function beep(freq, dur, type = 'sine', vol = 1, detune = 0) {
                const osc = ctx.createOscillator();
                const g = ctx.createGain();
                osc.type = type;
                osc.frequency.value = freq;
                osc.detune.value = detune;
                g.gain.value = vol;
                osc.connect(g);
                g.connect(gain);
                osc.start(now);
                osc.stop(now + dur);
            }

            switch (type) {
                case 'start':
                    beep(440, 0.12, 'triangle', 1);
                    beep(660, 0.08, 'sine', 0.5, 10);
                    break;
                case 'eat':
                    beep(880, 0.09, 'square', 1);
                    beep(1760, 0.05, 'triangle', 0.5, 20);
                    break;
                case 'move':
                    beep(220, 0.04, 'triangle', 0.3);
                    break;
                case 'gameOver':
                    beep(120, 0.25, 'sawtooth', 1);
                    beep(80, 0.4, 'triangle', 0.5, -20);
                    break;
                case 'levelUp':
                    beep(600, 0.08, 'triangle', 1);
                    beep(900, 0.08, 'triangle', 0.7);
                    beep(1200, 0.12, 'triangle', 0.5);
                    break;
                case 'pause':
                    beep(300, 0.08, 'sine', 0.7);
                    break;
                case 'resume':
                    beep(500, 0.08, 'sine', 0.7);
                    break;
                case 'reset':
                    beep(400, 0.1, 'triangle', 0.7);
                    break;
                default:
                    return;
            }
        } catch (error) {
            // Audio not supported
        }
    }
}

// Game Statistics
class SnakeStatistics {
    constructor() {
        this.stats = JSON.parse(localStorage.getItem('snakeStats')) || {
            gamesPlayed: 0,
            totalScore: 0,
            highestLevel: 1,
            totalFoodEaten: 0,
            averageScore: 0,
            longestSnake: 1
        };
    }
    
    recordGame(score, level, snakeLength) {
        this.stats.gamesPlayed++;
        this.stats.totalScore += score;
        this.stats.totalFoodEaten += Math.floor(score / 10);
        this.stats.averageScore = Math.floor(this.stats.totalScore / this.stats.gamesPlayed);
        
        if (level > this.stats.highestLevel) {
            this.stats.highestLevel = level;
        }
        
        if (snakeLength > this.stats.longestSnake) {
            this.stats.longestSnake = snakeLength;
        }
        
        this.save();
    }
    
    save() {
        localStorage.setItem('snakeStats', JSON.stringify(this.stats));
    }
    
    getStats() {
        return this.stats;
    }
    
    reset() {
        this.stats = {
            gamesPlayed: 0,
            totalScore: 0,
            highestLevel: 1,
            totalFoodEaten: 0,
            averageScore: 0,
            longestSnake: 1
        };
        this.save();
    }
}

// Touch/Swipe controls for mobile
class TouchControls {
    constructor(game) {
        this.game = game;
        this.startX = 0;
        this.startY = 0;
        this.endX = 0;
        this.endY = 0;
        this.minSwipeDistance = 30;
        
        this.init();
    }
    
    init() {
        const canvas = this.game.canvas;
        
        canvas.addEventListener('touchstart', (e) => this.handleTouchStart(e), { passive: false });
        canvas.addEventListener('touchmove', (e) => this.handleTouchMove(e), { passive: false });
        canvas.addEventListener('touchend', (e) => this.handleTouchEnd(e), { passive: false });
    }
    
    handleTouchStart(e) {
        e.preventDefault();
        const touch = e.touches[0];
        this.startX = touch.clientX;
        this.startY = touch.clientY;
    }
    
    handleTouchMove(e) {
        e.preventDefault();
    }
    
    handleTouchEnd(e) {
        e.preventDefault();
        const touch = e.changedTouches[0];
        this.endX = touch.clientX;
        this.endY = touch.clientY;
        
        this.handleSwipe();
    }
    
    handleSwipe() {
        const deltaX = this.endX - this.startX;
        const deltaY = this.endY - this.startY;
        
        if (Math.abs(deltaX) < this.minSwipeDistance && Math.abs(deltaY) < this.minSwipeDistance) {
            return; // Not a swipe
        }
        
        if (Math.abs(deltaX) > Math.abs(deltaY)) {
            // Horizontal swipe
            if (deltaX > 0) {
                this.game.changeDirection('right');
            } else {
                this.game.changeDirection('left');
            }
        } else {
            // Vertical swipe
            if (deltaY > 0) {
                this.game.changeDirection('down');
            } else {
                this.game.changeDirection('up');
            }
        }
    }
}

// Initialize game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const game = new SnakeGame();
    const stats = new SnakeStatistics();
    const touchControls = new TouchControls(game);
    
    // Override game over to record statistics
    const originalGameOver = game.gameOver.bind(game);
    game.gameOver = function() {
        stats.recordGame(this.score, this.level, this.snake.length);
        originalGameOver();
    };
    
    // Add statistics display (bonus feature)
    const statsBtn = document.createElement('button');
    statsBtn.className = 'btn btn-secondary';
    statsBtn.innerHTML = '<i class="fas fa-chart-bar"></i> Stats';
    statsBtn.addEventListener('click', () => {
        const gameStats = stats.getStats();
        alert(`Game Statistics:
Games Played: ${gameStats.gamesPlayed}
Average Score: ${gameStats.averageScore}
Highest Level: ${gameStats.highestLevel}
Total Food Eaten: ${gameStats.totalFoodEaten}
Longest Snake: ${gameStats.longestSnake}`);
    });
    
    document.querySelector('.game-controls').appendChild(statsBtn);
    
    console.log('🐍 Snake game initialized!');
    console.log('💡 Use WASD or arrow keys to move, SPACE to pause');
}); 