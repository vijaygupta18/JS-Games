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
        this.gameSpeed = 150;
        this.baseSpeed = 150;
        
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
            this.gameSpeed = Math.max(50, this.baseSpeed - (this.level - 1) * 10);
            
            // Update game loop with new speed
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
            if (index === 0) {
                // Head
                this.ctx.fillStyle = '#48bb78';
                this.ctx.fillRect(
                    segment.x * this.gridSize + 2,
                    segment.y * this.gridSize + 2,
                    this.gridSize - 4,
                    this.gridSize - 4
                );
                
                // Eyes
                this.ctx.fillStyle = '#1a202c';
                const eyeSize = 3;
                const eyeOffset = 6;
                
                if (this.dx === 1) { // Moving right
                    this.ctx.fillRect(segment.x * this.gridSize + eyeOffset + 6, segment.y * this.gridSize + 5, eyeSize, eyeSize);
                    this.ctx.fillRect(segment.x * this.gridSize + eyeOffset + 6, segment.y * this.gridSize + 12, eyeSize, eyeSize);
                } else if (this.dx === -1) { // Moving left
                    this.ctx.fillRect(segment.x * this.gridSize + 5, segment.y * this.gridSize + 5, eyeSize, eyeSize);
                    this.ctx.fillRect(segment.x * this.gridSize + 5, segment.y * this.gridSize + 12, eyeSize, eyeSize);
                } else if (this.dy === -1) { // Moving up
                    this.ctx.fillRect(segment.x * this.gridSize + 5, segment.y * this.gridSize + 5, eyeSize, eyeSize);
                    this.ctx.fillRect(segment.x * this.gridSize + 12, segment.y * this.gridSize + 5, eyeSize, eyeSize);
                } else if (this.dy === 1) { // Moving down
                    this.ctx.fillRect(segment.x * this.gridSize + 5, segment.y * this.gridSize + 12, eyeSize, eyeSize);
                    this.ctx.fillRect(segment.x * this.gridSize + 12, segment.y * this.gridSize + 12, eyeSize, eyeSize);
                }
            } else {
                // Body
                const alpha = Math.max(0.3, 1 - (index * 0.05));
                this.ctx.fillStyle = `rgba(72, 187, 120, ${alpha})`;
                this.ctx.fillRect(
                    segment.x * this.gridSize + 1,
                    segment.y * this.gridSize + 1,
                    this.gridSize - 2,
                    this.gridSize - 2
                );
            }
        });
    }
    
    drawFood() {
        // Food glow effect
        const gradient = this.ctx.createRadialGradient(
            this.food.x * this.gridSize + this.gridSize / 2,
            this.food.y * this.gridSize + this.gridSize / 2,
            0,
            this.food.x * this.gridSize + this.gridSize / 2,
            this.food.y * this.gridSize + this.gridSize / 2,
            this.gridSize / 2
        );
        gradient.addColorStop(0, '#f56565');
        gradient.addColorStop(1, '#e53e3e');
        
        this.ctx.fillStyle = gradient;
        this.ctx.beginPath();
        this.ctx.arc(
            this.food.x * this.gridSize + this.gridSize / 2,
            this.food.y * this.gridSize + this.gridSize / 2,
            this.gridSize / 2 - 2,
            0,
            2 * Math.PI
        );
        this.ctx.fill();
        
        // Food highlight
        this.ctx.fillStyle = '#fed7d7';
        this.ctx.beginPath();
        this.ctx.arc(
            this.food.x * this.gridSize + this.gridSize / 3,
            this.food.y * this.gridSize + this.gridSize / 3,
            3,
            0,
            2 * Math.PI
        );
        this.ctx.fill();
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
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            let frequency, duration, waveType = 'sine';
            
            switch (type) {
                case 'start':
                    frequency = 440;
                    duration = 0.2;
                    break;
                case 'eat':
                    frequency = 800;
                    duration = 0.1;
                    waveType = 'square';
                    break;
                case 'gameOver':
                    frequency = 200;
                    duration = 0.5;
                    waveType = 'sawtooth';
                    break;
                case 'levelUp':
                    frequency = 1000;
                    duration = 0.3;
                    break;
                case 'pause':
                    frequency = 300;
                    duration = 0.1;
                    break;
                case 'resume':
                    frequency = 500;
                    duration = 0.1;
                    break;
                case 'reset':
                    frequency = 400;
                    duration = 0.15;
                    break;
                default:
                    return;
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