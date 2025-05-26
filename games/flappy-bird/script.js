// Simple Flappy Bird Game
class FlappyBirdGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        // Game state
        this.gameActive = false;
        this.gamePaused = false;
        this.gameOver = false;
        this.score = 0;
        this.pipes = [];
        this.particles = [];
        
        // Bird properties
        this.bird = {
            x: 80,
            y: this.canvas.height / 2,
            width: 30,
            height: 25,
            velocity: 0,
            gravity: 0.6,
            jumpPower: -12,
            rotation: 0
        };
        
        // Pipe properties
        this.pipeWidth = 60;
        this.pipeGap = 150;
        this.pipeSpeed = 3;
        this.pipeSpawnRate = 90; // frames between pipes
        this.frameCount = 0;
        
        // Background
        this.backgroundOffset = 0;
        this.cloudOffset = 0;
        
        // Statistics
        this.stats = JSON.parse(localStorage.getItem('flappyBirdStats')) || {
            highScore: 0,
            gamesPlayed: 0,
            totalPipes: 0,
            bestStreak: 0,
            currentStreak: 0
        };
        
        // Animation frame
        this.animationId = null;
        
        this.init();
    }
    
    init() {
        this.bindEvents();
        this.updateDisplay();
        this.updateStatsDisplay();
        this.render();
    }
    
    bindEvents() {
        // Button events
        document.getElementById('startBtn').addEventListener('click', () => this.startGame());
        document.getElementById('pauseBtn').addEventListener('click', () => this.togglePause());
        document.getElementById('resetBtn').addEventListener('click', () => this.resetGame());
        
        // Game controls
        document.addEventListener('keydown', (e) => this.handleKeyPress(e));
        this.canvas.addEventListener('click', () => this.flap());
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.flap();
        });
        
        // Prevent scrolling on mobile
        document.addEventListener('touchstart', (e) => {
            if (e.target === this.canvas) {
                e.preventDefault();
            }
        });
        
        document.addEventListener('touchend', (e) => {
            if (e.target === this.canvas) {
                e.preventDefault();
            }
        });
    }
    
    handleKeyPress(e) {
        if (e.code === 'Space') {
            e.preventDefault();
            if (this.gameActive && !this.gamePaused) {
                this.flap();
            } else if (!this.gameActive) {
                this.startGame();
            } else if (this.gamePaused) {
                this.togglePause();
            }
        }
        
        if (e.key.toLowerCase() === 'p' && this.gameActive) {
            this.togglePause();
        }
        
        if (e.key.toLowerCase() === 'r') {
            this.resetGame();
        }
    }
    
    startGame() {
        this.gameActive = true;
        this.gamePaused = false;
        this.gameOver = false;
        this.score = 0;
        this.frameCount = 0;
        this.pipes = [];
        this.particles = [];
        
        // Reset bird
        this.bird.y = this.canvas.height / 2;
        this.bird.velocity = 0;
        this.bird.rotation = 0;
        
        this.hideOverlay();
        this.updateButtons();
        this.updateDisplay();
        this.gameLoop();
        
        this.playSound('start');
    }
    
    togglePause() {
        if (!this.gameActive) return;
        
        this.gamePaused = !this.gamePaused;
        
        if (this.gamePaused) {
            this.showOverlay('Game Paused', 'Click Resume or press P to continue');
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
        this.gameOver = false;
        this.score = 0;
        this.frameCount = 0;
        this.pipes = [];
        this.particles = [];
        
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        
        // Reset bird
        this.bird.y = this.canvas.height / 2;
        this.bird.velocity = 0;
        this.bird.rotation = 0;
        
        this.updateDisplay();
        this.updateButtons();
        this.showOverlay('Flappy Bird', 'Click or press SPACE to start flying!');
        this.render();
        
        this.playSound('reset');
    }
    
    flap() {
        if (!this.gameActive || this.gamePaused || this.gameOver) return;
        
        this.bird.velocity = this.bird.jumpPower;
        this.bird.rotation = -30; // Tilt up when flapping
        
        // Create flap particles
        this.createFlapParticles();
        
        this.playSound('flap');
    }
    
    gameLoop() {
        if (!this.gameActive || this.gamePaused) return;
        
        this.update();
        this.render();
        
        this.animationId = requestAnimationFrame(() => this.gameLoop());
    }
    
    update() {
        this.frameCount++;
        
        // Update bird physics
        this.updateBird();
        
        // Update pipes
        this.updatePipes();
        
        // Update particles
        this.updateParticles();
        
        // Check collisions
        this.checkCollisions();
        
        // Spawn new pipes
        if (this.frameCount % this.pipeSpawnRate === 0) {
            this.spawnPipe();
        }
        
        // Update background
        this.backgroundOffset -= this.pipeSpeed * 0.33;
        this.cloudOffset -= this.pipeSpeed * 0.16;
        
        if (this.backgroundOffset <= -this.canvas.width) {
            this.backgroundOffset = 0;
        }
        
        if (this.cloudOffset <= -this.canvas.width) {
            this.cloudOffset = 0;
        }
        
        // Update display
        this.updateDisplay();
    }
    
    updateBird() {
        // Apply gravity
        this.bird.velocity += this.bird.gravity;
        this.bird.y += this.bird.velocity;
        
        // Update rotation based on velocity
        if (this.bird.velocity > 0) {
            this.bird.rotation = Math.min(90, this.bird.rotation + 3);
        } else {
            this.bird.rotation = Math.max(-30, this.bird.rotation - 2);
        }
        
        // Check ground collision
        if (this.bird.y + this.bird.height >= this.canvas.height - 20) {
            this.bird.y = this.canvas.height - 20 - this.bird.height;
            this.endGame();
        }
        
        // Check ceiling collision
        if (this.bird.y <= 0) {
            this.bird.y = 0;
            this.bird.velocity = 0;
        }
    }
    
    updatePipes() {
        for (let i = this.pipes.length - 1; i >= 0; i--) {
            const pipe = this.pipes[i];
            pipe.x -= this.pipeSpeed;
            
            // Check if pipe passed bird (score)
            if (!pipe.scored && pipe.x + this.pipeWidth < this.bird.x) {
                pipe.scored = true;
                this.score++;
                this.stats.totalPipes++;
                this.stats.currentStreak++;
                
                if (this.stats.currentStreak > this.stats.bestStreak) {
                    this.stats.bestStreak = this.stats.currentStreak;
                }
                
                this.animateElement('scoreDisplay');
                this.playSound('score');
                
                // Increase difficulty slightly
                if (this.score % 5 === 0) {
                    this.pipeSpeed = Math.min(6, this.pipeSpeed + 0.2);
                    this.pipeSpawnRate = Math.max(60, this.pipeSpawnRate - 2);
                }
            }
            
            // Remove pipes that are off screen
            if (pipe.x + this.pipeWidth < 0) {
                this.pipes.splice(i, 1);
            }
        }
    }
    
    updateParticles() {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const particle = this.particles[i];
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.vy += 0.2; // gravity
            particle.life--;
            particle.alpha = particle.life / particle.maxLife;
            
            if (particle.life <= 0) {
                this.particles.splice(i, 1);
            }
        }
    }
    
    spawnPipe() {
        const minHeight = 50;
        const maxHeight = this.canvas.height - this.pipeGap - minHeight - 20;
        const topHeight = Math.random() * (maxHeight - minHeight) + minHeight;
        
        this.pipes.push({
            x: this.canvas.width,
            topHeight: topHeight,
            bottomY: topHeight + this.pipeGap,
            scored: false
        });
    }
    
    checkCollisions() {
        for (const pipe of this.pipes) {
            // Check collision with top pipe
            if (this.bird.x + this.bird.width > pipe.x &&
                this.bird.x < pipe.x + this.pipeWidth &&
                this.bird.y < pipe.topHeight) {
                this.endGame();
                return;
            }
            
            // Check collision with bottom pipe
            if (this.bird.x + this.bird.width > pipe.x &&
                this.bird.x < pipe.x + this.pipeWidth &&
                this.bird.y + this.bird.height > pipe.bottomY) {
                this.endGame();
                return;
            }
        }
    }
    
    endGame() {
        if (this.gameOver) return;
        
        this.gameOver = true;
        this.gameActive = false;
        
        // Create crash particles
        this.createCrashParticles();
        
        // Update statistics
        this.stats.gamesPlayed++;
        this.stats.currentStreak = 0;
        
        if (this.score > this.stats.highScore) {
            this.stats.highScore = this.score;
        }
        
        localStorage.setItem('flappyBirdStats', JSON.stringify(this.stats));
        this.updateStatsDisplay();
        
        setTimeout(() => {
            this.showOverlay('Game Over!', `Score: ${this.score} | Best: ${this.stats.highScore}`);
            this.updateButtons();
        }, 1000);
        
        this.playSound('crash');
    }
    
    createFlapParticles() {
        for (let i = 0; i < 5; i++) {
            this.particles.push({
                x: this.bird.x,
                y: this.bird.y + this.bird.height / 2,
                vx: Math.random() * 4 - 2,
                vy: Math.random() * 4 + 2,
                life: 20,
                maxLife: 20,
                alpha: 1,
                color: `hsl(${200 + Math.random() * 60}, 70%, 70%)`
            });
        }
    }
    
    createCrashParticles() {
        for (let i = 0; i < 15; i++) {
            this.particles.push({
                x: this.bird.x + this.bird.width / 2,
                y: this.bird.y + this.bird.height / 2,
                vx: (Math.random() - 0.5) * 10,
                vy: (Math.random() - 0.5) * 10,
                life: 40,
                maxLife: 40,
                alpha: 1,
                color: `hsl(${Math.random() * 60}, 70%, 60%)`
            });
        }
    }
    
    render() {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw background
        this.drawBackground();
        
        // Draw pipes
        this.drawPipes();
        
        // Draw bird
        this.drawBird();
        
        // Draw particles
        this.drawParticles();
        
        // Draw ground
        this.drawGround();
        
        // Draw score
        this.drawScore();
    }
    
    drawBackground() {
        // Sky gradient
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        gradient.addColorStop(0, '#87ceeb');
        gradient.addColorStop(1, '#98d8e8');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Clouds
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        for (let i = 0; i < 3; i++) {
            const x = (i * 150 + this.cloudOffset) % (this.canvas.width + 100);
            const y = 50 + i * 30;
            this.drawCloud(x, y);
        }
    }
    
    drawCloud(x, y) {
        this.ctx.beginPath();
        this.ctx.arc(x, y, 20, 0, Math.PI * 2);
        this.ctx.arc(x + 25, y, 25, 0, Math.PI * 2);
        this.ctx.arc(x + 50, y, 20, 0, Math.PI * 2);
        this.ctx.arc(x + 25, y - 15, 15, 0, Math.PI * 2);
        this.ctx.fill();
    }
    
    drawPipes() {
        this.ctx.fillStyle = '#22c55e';
        this.ctx.strokeStyle = '#16a34a';
        this.ctx.lineWidth = 3;
        
        for (const pipe of this.pipes) {
            // Top pipe
            this.ctx.fillRect(pipe.x, 0, this.pipeWidth, pipe.topHeight);
            this.ctx.strokeRect(pipe.x, 0, this.pipeWidth, pipe.topHeight);
            
            // Top pipe cap
            this.ctx.fillRect(pipe.x - 5, pipe.topHeight - 30, this.pipeWidth + 10, 30);
            this.ctx.strokeRect(pipe.x - 5, pipe.topHeight - 30, this.pipeWidth + 10, 30);
            
            // Bottom pipe
            this.ctx.fillRect(pipe.x, pipe.bottomY, this.pipeWidth, this.canvas.height - pipe.bottomY);
            this.ctx.strokeRect(pipe.x, pipe.bottomY, this.pipeWidth, this.canvas.height - pipe.bottomY);
            
            // Bottom pipe cap
            this.ctx.fillRect(pipe.x - 5, pipe.bottomY, this.pipeWidth + 10, 30);
            this.ctx.strokeRect(pipe.x - 5, pipe.bottomY, this.pipeWidth + 10, 30);
        }
    }
    
    drawBird() {
        this.ctx.save();
        
        // Move to bird center for rotation
        this.ctx.translate(this.bird.x + this.bird.width / 2, this.bird.y + this.bird.height / 2);
        this.ctx.rotate((this.bird.rotation * Math.PI) / 180);
        
        // Draw bird body
        this.ctx.fillStyle = '#ffd700';
        this.ctx.strokeStyle = '#ffb000';
        this.ctx.lineWidth = 2;
        
        this.ctx.beginPath();
        this.ctx.ellipse(0, 0, this.bird.width / 2, this.bird.height / 2, 0, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.stroke();
        
        // Draw wing
        this.ctx.fillStyle = '#ffed4e';
        this.ctx.beginPath();
        this.ctx.ellipse(-5, 0, 8, 12, 0, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.stroke();
        
        // Draw eye
        this.ctx.fillStyle = 'white';
        this.ctx.beginPath();
        this.ctx.arc(5, -5, 6, 0, Math.PI * 2);
        this.ctx.fill();
        
        this.ctx.fillStyle = 'black';
        this.ctx.beginPath();
        this.ctx.arc(7, -3, 3, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Draw beak
        this.ctx.fillStyle = '#ff8c00';
        this.ctx.beginPath();
        this.ctx.moveTo(12, 0);
        this.ctx.lineTo(20, -2);
        this.ctx.lineTo(20, 2);
        this.ctx.closePath();
        this.ctx.fill();
        this.ctx.stroke();
        
        this.ctx.restore();
    }
    
    drawParticles() {
        for (const particle of this.particles) {
            this.ctx.save();
            this.ctx.globalAlpha = particle.alpha;
            this.ctx.fillStyle = particle.color;
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, 3, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.restore();
        }
    }
    
    drawGround() {
        // Ground
        this.ctx.fillStyle = '#8b4513';
        this.ctx.fillRect(0, this.canvas.height - 20, this.canvas.width, 20);
        
        // Grass
        this.ctx.fillStyle = '#228b22';
        this.ctx.fillRect(0, this.canvas.height - 25, this.canvas.width, 5);
    }
    
    drawScore() {
        if (!this.gameActive) return;
        
        this.ctx.fillStyle = 'white';
        this.ctx.strokeStyle = 'black';
        this.ctx.lineWidth = 3;
        this.ctx.font = 'bold 48px Poppins';
        this.ctx.textAlign = 'center';
        
        const text = this.score.toString();
        const x = this.canvas.width / 2;
        const y = 80;
        
        this.ctx.strokeText(text, x, y);
        this.ctx.fillText(text, x, y);
    }
    
    updateDisplay() {
        document.getElementById('scoreDisplay').textContent = this.score;
        document.getElementById('bestScore').textContent = this.stats.highScore;
        document.getElementById('pipesDisplay').textContent = this.stats.totalPipes;
    }
    
    updateStatsDisplay() {
        document.getElementById('highScore').textContent = this.stats.highScore;
        document.getElementById('gamesPlayed').textContent = this.stats.gamesPlayed;
        document.getElementById('totalPipes').textContent = this.stats.totalPipes;
        document.getElementById('bestStreak').textContent = this.stats.bestStreak;
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
                case 'flap': frequency = 800; duration = 0.1; waveType = 'square'; break;
                case 'score': frequency = 1000; duration = 0.2; waveType = 'square'; break;
                case 'crash': frequency = 200; duration = 0.5; waveType = 'sawtooth'; break;
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
    const game = new FlappyBirdGame();
    
    // Handle window resize
    window.addEventListener('resize', () => {
        const container = document.querySelector('.game-area');
        const containerWidth = container.clientWidth;
        
        if (containerWidth < 400) {
            game.canvas.style.width = '100%';
            game.canvas.style.height = 'auto';
        }
    });
    
    console.log('🐦 Flappy Bird game initialized!');
    console.log('💡 Click or press SPACE to flap, P to pause, R to reset');
}); 