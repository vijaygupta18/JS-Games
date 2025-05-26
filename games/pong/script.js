// Pong Game Class
class PongGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        // Game state
        this.gameActive = false;
        this.gamePaused = false;
        this.gameStarted = false;
        
        // Game objects
        this.ball = {
            x: this.canvas.width / 2,
            y: this.canvas.height / 2,
            dx: 0,
            dy: 0,
            speed: 5,
            radius: 8
        };
        
        this.playerPaddle = {
            x: 20,
            y: this.canvas.height / 2 - 50,
            width: 15,
            height: 100,
            speed: 8
        };
        
        this.aiPaddle = {
            x: this.canvas.width - 35,
            y: this.canvas.height / 2 - 50,
            width: 15,
            height: 100,
            speed: 6
        };
        
        // Scores
        this.playerScore = 0;
        this.aiScore = 0;
        this.maxScore = 11;
        
        // Controls
        this.keys = {};
        this.mouseY = this.canvas.height / 2;
        
        // AI difficulty
        this.aiDifficulty = 'medium';
        this.aiSpeeds = {
            easy: 3,
            medium: 5,
            hard: 7,
            expert: 9
        };
        
        // Game stats
        this.currentRally = 0;
        this.stats = JSON.parse(localStorage.getItem('pongStats')) || {
            gamesPlayed: 0,
            playerWins: 0,
            aiWins: 0,
            longestRally: 0,
            totalRallies: 0
        };
        
        // Animation frame
        this.animationId = null;
        
        this.init();
    }
    
    init() {
        this.bindEvents();
        this.updateDisplay();
        this.resetBall();
        this.render();
    }
    
    bindEvents() {
        // Button events
        document.getElementById('startBtn').addEventListener('click', () => this.startGame());
        document.getElementById('pauseBtn').addEventListener('click', () => this.togglePause());
        document.getElementById('resetBtn').addEventListener('click', () => this.resetGame());
        
        // Difficulty selector
        document.getElementById('difficultySelect').addEventListener('change', (e) => {
            this.aiDifficulty = e.target.value;
            this.aiPaddle.speed = this.aiSpeeds[this.aiDifficulty];
        });
        
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
        this.mouseY = e.clientY - rect.top;
    }
    
    handleTouchMove(e) {
        e.preventDefault();
        const rect = this.canvas.getBoundingClientRect();
        const touch = e.touches[0];
        this.mouseY = touch.clientY - rect.top;
    }
    
    startGame() {
        this.gameActive = true;
        this.gamePaused = false;
        this.gameStarted = true;
        
        if (this.playerScore === 0 && this.aiScore === 0) {
            this.resetBall();
            this.serveBall();
        }
        
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
            document.getElementById('startBtn').innerHTML = '<i class="fas fa-play"></i> Resume';
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
        this.gameStarted = false;
        this.playerScore = 0;
        this.aiScore = 0;
        this.currentRally = 0;
        
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        
        this.resetBall();
        this.resetPaddles();
        this.updateDisplay();
        this.updateButtons();
        this.showOverlay('Pong', 'Click Start to begin!');
        
        this.playSound('reset');
    }
    
    resetBall() {
        this.ball.x = this.canvas.width / 2;
        this.ball.y = this.canvas.height / 2;
        this.ball.dx = 0;
        this.ball.dy = 0;
        this.ball.speed = 5;
    }
    
    resetPaddles() {
        this.playerPaddle.y = this.canvas.height / 2 - this.playerPaddle.height / 2;
        this.aiPaddle.y = this.canvas.height / 2 - this.aiPaddle.height / 2;
    }
    
    serveBall() {
        const angle = (Math.random() - 0.5) * Math.PI / 3; // Random angle between -30 and 30 degrees
        const direction = Math.random() < 0.5 ? 1 : -1; // Random direction
        
        this.ball.dx = Math.cos(angle) * this.ball.speed * direction;
        this.ball.dy = Math.sin(angle) * this.ball.speed;
        
        this.currentRally = 0;
    }
    
    gameLoop() {
        if (!this.gameActive || this.gamePaused) return;
        
        this.update();
        this.render();
        
        this.animationId = requestAnimationFrame(() => this.gameLoop());
    }
    
    update() {
        this.updatePaddles();
        this.updateBall();
        this.checkCollisions();
        this.checkScore();
    }
    
    updatePaddles() {
        // Player paddle controls
        if (this.keys['w'] || this.keys['arrowup']) {
            this.playerPaddle.y = Math.max(0, this.playerPaddle.y - this.playerPaddle.speed);
        }
        if (this.keys['s'] || this.keys['arrowdown']) {
            this.playerPaddle.y = Math.min(
                this.canvas.height - this.playerPaddle.height,
                this.playerPaddle.y + this.playerPaddle.speed
            );
        }
        
        // Mouse control for player paddle
        const targetY = this.mouseY - this.playerPaddle.height / 2;
        const clampedY = Math.max(0, Math.min(this.canvas.height - this.playerPaddle.height, targetY));
        this.playerPaddle.y += (clampedY - this.playerPaddle.y) * 0.1;
        
        // AI paddle
        this.updateAI();
    }
    
    updateAI() {
        const paddleCenter = this.aiPaddle.y + this.aiPaddle.height / 2;
        const ballY = this.ball.y;
        
        // AI difficulty affects reaction time and accuracy
        let targetY = ballY;
        let reactionSpeed = this.aiSpeeds[this.aiDifficulty] / 10;
        
        switch (this.aiDifficulty) {
            case 'easy':
                // Easy AI is slow and sometimes misses
                if (Math.random() < 0.1) targetY += (Math.random() - 0.5) * 100;
                reactionSpeed = 0.3;
                break;
            case 'medium':
                // Medium AI is decent but not perfect
                if (Math.random() < 0.05) targetY += (Math.random() - 0.5) * 50;
                reactionSpeed = 0.5;
                break;
            case 'hard':
                // Hard AI is very good
                reactionSpeed = 0.7;
                break;
            case 'expert':
                // Expert AI is nearly perfect
                reactionSpeed = 0.9;
                break;
        }
        
        const diff = targetY - paddleCenter;
        this.aiPaddle.y += diff * reactionSpeed;
        
        // Keep AI paddle in bounds
        this.aiPaddle.y = Math.max(0, Math.min(
            this.canvas.height - this.aiPaddle.height,
            this.aiPaddle.y
        ));
    }
    
    updateBall() {
        this.ball.x += this.ball.dx;
        this.ball.y += this.ball.dy;
        
        // Ball collision with top and bottom walls
        if (this.ball.y <= this.ball.radius || this.ball.y >= this.canvas.height - this.ball.radius) {
            this.ball.dy = -this.ball.dy;
            this.playSound('wallHit');
        }
    }
    
    checkCollisions() {
        // Player paddle collision
        if (this.ball.x - this.ball.radius <= this.playerPaddle.x + this.playerPaddle.width &&
            this.ball.x + this.ball.radius >= this.playerPaddle.x &&
            this.ball.y >= this.playerPaddle.y &&
            this.ball.y <= this.playerPaddle.y + this.playerPaddle.height &&
            this.ball.dx < 0) {
            
            this.handlePaddleCollision(this.playerPaddle);
        }
        
        // AI paddle collision
        if (this.ball.x + this.ball.radius >= this.aiPaddle.x &&
            this.ball.x - this.ball.radius <= this.aiPaddle.x + this.aiPaddle.width &&
            this.ball.y >= this.aiPaddle.y &&
            this.ball.y <= this.aiPaddle.y + this.aiPaddle.height &&
            this.ball.dx > 0) {
            
            this.handlePaddleCollision(this.aiPaddle);
        }
    }
    
    handlePaddleCollision(paddle) {
        // Calculate hit position on paddle (0 to 1)
        const hitPos = (this.ball.y - paddle.y) / paddle.height;
        
        // Calculate new angle based on hit position
        const angle = (hitPos - 0.5) * Math.PI / 3; // Max 60 degree angle
        
        // Reverse and modify ball direction
        this.ball.dx = -this.ball.dx;
        this.ball.dy = Math.sin(angle) * this.ball.speed;
        
        // Increase ball speed slightly
        this.ball.speed = Math.min(12, this.ball.speed + 0.2);
        this.ball.dx = this.ball.dx > 0 ? this.ball.speed : -this.ball.speed;
        
        this.currentRally++;
        this.stats.totalRallies++;
        
        if (this.currentRally > this.stats.longestRally) {
            this.stats.longestRally = this.currentRally;
        }
        
        this.playSound('paddleHit');
    }
    
    checkScore() {
        // Player scores (ball goes off right side)
        if (this.ball.x > this.canvas.width) {
            this.playerScore++;
            this.animateScore('playerScore');
            this.resetBall();
            setTimeout(() => this.serveBall(), 1000);
            this.playSound('score');
        }
        
        // AI scores (ball goes off left side)
        if (this.ball.x < 0) {
            this.aiScore++;
            this.animateScore('aiScore');
            this.resetBall();
            setTimeout(() => this.serveBall(), 1000);
            this.playSound('score');
        }
        
        // Check for game end
        if (this.playerScore >= this.maxScore || this.aiScore >= this.maxScore) {
            this.endGame();
        }
        
        this.updateDisplay();
    }
    
    endGame() {
        this.gameActive = false;
        this.gameStarted = false;
        
        const playerWon = this.playerScore >= this.maxScore;
        
        // Update statistics
        this.stats.gamesPlayed++;
        if (playerWon) {
            this.stats.playerWins++;
        } else {
            this.stats.aiWins++;
        }
        
        localStorage.setItem('pongStats', JSON.stringify(this.stats));
        this.updateStatsDisplay();
        
        // Show game over message
        const title = playerWon ? 'You Win!' : 'AI Wins!';
        const message = `Final Score: ${this.playerScore} - ${this.aiScore}`;
        this.showOverlay(title, message);
        
        this.updateButtons();
        this.playSound(playerWon ? 'win' : 'lose');
    }
    
    render() {
        // Clear canvas
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw center line
        this.ctx.setLineDash([10, 10]);
        this.ctx.strokeStyle = '#fff';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.moveTo(this.canvas.width / 2, 0);
        this.ctx.lineTo(this.canvas.width / 2, this.canvas.height);
        this.ctx.stroke();
        this.ctx.setLineDash([]);
        
        // Draw paddles
        this.ctx.fillStyle = '#fff';
        this.ctx.fillRect(this.playerPaddle.x, this.playerPaddle.y, this.playerPaddle.width, this.playerPaddle.height);
        this.ctx.fillRect(this.aiPaddle.x, this.aiPaddle.y, this.aiPaddle.width, this.aiPaddle.height);
        
        // Draw ball
        this.ctx.beginPath();
        this.ctx.arc(this.ball.x, this.ball.y, this.ball.radius, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Draw rally counter if game is active
        if (this.gameActive && this.currentRally > 0) {
            this.ctx.font = '20px Poppins';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(`Rally: ${this.currentRally}`, this.canvas.width / 2, 30);
        }
    }
    
    updateDisplay() {
        document.getElementById('playerScore').textContent = this.playerScore;
        document.getElementById('aiScore').textContent = this.aiScore;
    }
    
    updateStatsDisplay() {
        const winRate = this.stats.gamesPlayed > 0 ? 
            Math.round((this.stats.playerWins / this.stats.gamesPlayed) * 100) : 0;
        
        document.getElementById('gamesPlayed').textContent = this.stats.gamesPlayed;
        document.getElementById('playerWins').textContent = this.stats.playerWins;
        document.getElementById('winRate').textContent = `${winRate}%`;
        document.getElementById('longestRally').textContent = this.stats.longestRally;
    }
    
    updateButtons() {
        const startBtn = document.getElementById('startBtn');
        const pauseBtn = document.getElementById('pauseBtn');
        
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
            
            if (this.gameStarted) {
                startBtn.innerHTML = '<i class="fas fa-play"></i> Continue';
            } else {
                startBtn.innerHTML = '<i class="fas fa-play"></i> Start Game';
            }
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
    
    animateScore(elementId) {
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
                case 'start':
                    frequency = 440;
                    duration = 0.2;
                    break;
                case 'paddleHit':
                    frequency = 800;
                    duration = 0.1;
                    waveType = 'square';
                    break;
                case 'wallHit':
                    frequency = 600;
                    duration = 0.1;
                    break;
                case 'score':
                    frequency = 1000;
                    duration = 0.3;
                    waveType = 'square';
                    break;
                case 'win':
                    frequency = 1200;
                    duration = 0.5;
                    waveType = 'square';
                    break;
                case 'lose':
                    frequency = 300;
                    duration = 0.5;
                    waveType = 'sawtooth';
                    break;
                case 'pause':
                    frequency = 400;
                    duration = 0.1;
                    break;
                case 'resume':
                    frequency = 500;
                    duration = 0.1;
                    break;
                case 'reset':
                    frequency = 350;
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

// Initialize game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const game = new PongGame();
    
    // Update stats display on load
    game.updateStatsDisplay();
    
    // Handle window resize
    window.addEventListener('resize', () => {
        // Adjust canvas size if needed for mobile
        const container = document.querySelector('.game-area');
        const containerWidth = container.clientWidth;
        
        if (containerWidth < 800) {
            game.canvas.style.width = '100%';
            game.canvas.style.height = 'auto';
        }
    });
    
    console.log('🏓 Pong game initialized!');
    console.log('💡 Use SPACE to start/pause, R to reset, W/S or mouse to control paddle');
}); 