// Whack-a-Mole Game Class
class WhackAMoleGame {
    constructor() {
        this.score = 0;
        this.timeLeft = 60;
        this.gameActive = false;
        this.gamePaused = false;
        this.moleSpeed = 1500; // Initial mole appearance interval
        this.moleUpTime = 1000; // How long mole stays up
        this.activeMoles = new Set();
        
        // High score
        this.highScore = parseInt(localStorage.getItem('whackMoleHighScore')) || 0;
        
        // Game timers
        this.gameTimer = null;
        this.moleTimer = null;
        
        // Statistics
        this.stats = JSON.parse(localStorage.getItem('whackMoleStats')) || {
            gamesPlayed: 0,
            totalScore: 0,
            totalHits: 0,
            totalMisses: 0,
            averageScore: 0,
            accuracy: 0,
            bestTime: 0
        };
        
        this.init();
    }
    
    init() {
        this.bindEvents();
        this.updateDisplay();
        this.setupMoleEvents();
    }
    
    bindEvents() {
        // Control buttons
        document.getElementById('startBtn').addEventListener('click', () => this.startGame());
        document.getElementById('pauseBtn').addEventListener('click', () => this.togglePause());
        document.getElementById('resetBtn').addEventListener('click', () => this.resetGame());
        document.getElementById('playAgainBtn').addEventListener('click', () => this.resetGame());
        
        // Keyboard controls
        document.addEventListener('keydown', (e) => this.handleKeyPress(e));
    }
    
    setupMoleEvents() {
        document.querySelectorAll('.mole').forEach(mole => {
            mole.addEventListener('click', (e) => this.hitMole(e));
        });
        
        // Add click events to holes for miss detection
        document.querySelectorAll('.hole').forEach(hole => {
            hole.addEventListener('click', (e) => this.checkMiss(e));
        });
    }
    
    handleKeyPress(e) {
        const key = e.key.toLowerCase();
        
        if (key === ' ' || key === 'p') {
            e.preventDefault();
            if (this.gameActive) {
                this.togglePause();
            }
        }
        
        if (key === 'r') {
            this.resetGame();
        }
        
        if (key === 's' && !this.gameActive) {
            this.startGame();
        }
    }
    
    startGame() {
        if (this.gameActive) return;
        
        this.gameActive = true;
        this.gamePaused = false;
        this.score = 0;
        this.timeLeft = 60;
        this.moleSpeed = 1500;
        this.activeMoles.clear();
        
        this.updateDisplay();
        this.updateButtons();
        this.hideGameOver();
        
        // Start game timer
        this.gameTimer = setInterval(() => this.updateTimer(), 1000);
        
        // Start mole spawning
        this.startMoleSpawning();
        
        this.playSound('start');
    }
    
    togglePause() {
        if (!this.gameActive) return;
        
        this.gamePaused = !this.gamePaused;
        
        if (this.gamePaused) {
            clearInterval(this.gameTimer);
            clearTimeout(this.moleTimer);
            this.playSound('pause');
        } else {
            this.gameTimer = setInterval(() => this.updateTimer(), 1000);
            this.startMoleSpawning();
            this.playSound('resume');
        }
        
        this.updateButtons();
    }
    
    resetGame() {
        this.gameActive = false;
        this.gamePaused = false;
        this.score = 0;
        this.timeLeft = 60;
        this.activeMoles.clear();
        
        // Clear timers
        clearInterval(this.gameTimer);
        clearTimeout(this.moleTimer);
        
        // Hide all moles
        document.querySelectorAll('.mole').forEach(mole => {
            mole.classList.remove('up', 'hit', 'missed');
        });
        
        this.updateDisplay();
        this.updateButtons();
        this.hideGameOver();
        
        this.playSound('reset');
    }
    
    updateTimer() {
        if (this.gamePaused) return;
        
        this.timeLeft--;
        this.updateDisplay();
        
        if (this.timeLeft <= 0) {
            this.endGame();
        } else if (this.timeLeft <= 10) {
            this.playSound('warning');
        }
    }
    
    startMoleSpawning() {
        if (!this.gameActive || this.gamePaused) return;
        
        this.spawnMole();
        
        // Increase difficulty over time
        const difficultyMultiplier = Math.max(0.3, 1 - (60 - this.timeLeft) / 120);
        const nextSpawnTime = this.moleSpeed * difficultyMultiplier;
        
        this.moleTimer = setTimeout(() => this.startMoleSpawning(), nextSpawnTime);
    }
    
    spawnMole() {
        const availableHoles = [];
        
        // Find holes without active moles
        for (let i = 0; i < 9; i++) {
            if (!this.activeMoles.has(i)) {
                availableHoles.push(i);
            }
        }
        
        if (availableHoles.length === 0) return;
        
        // Randomly select a hole
        const holeIndex = availableHoles[Math.floor(Math.random() * availableHoles.length)];
        const mole = document.getElementById(`mole-${holeIndex}`);
        
        // Show mole
        mole.classList.add('up');
        this.activeMoles.add(holeIndex);
        
        // Hide mole after timeout
        setTimeout(() => {
            if (mole.classList.contains('up') && !mole.classList.contains('hit')) {
                mole.classList.remove('up');
                mole.classList.add('missed');
                this.activeMoles.delete(holeIndex);
                this.stats.totalMisses++;
                
                setTimeout(() => {
                    mole.classList.remove('missed');
                }, 500);
            }
        }, this.moleUpTime);
    }
    
    hitMole(e) {
        e.stopPropagation();
        
        if (!this.gameActive || this.gamePaused) return;
        
        const mole = e.target.closest('.mole');
        const holeIndex = parseInt(mole.id.split('-')[1]);
        
        if (!mole.classList.contains('up') || mole.classList.contains('hit')) return;
        
        // Hit successful
        mole.classList.remove('up');
        mole.classList.add('hit');
        this.activeMoles.delete(holeIndex);
        
        // Update score
        this.score += 10;
        this.stats.totalHits++;
        this.updateDisplay();
        this.animateScore();
        
        // Add hit effect to hole
        const hole = mole.closest('.hole');
        hole.classList.add('hit-effect');
        setTimeout(() => hole.classList.remove('hit-effect'), 300);
        
        // Remove hit animation
        setTimeout(() => {
            mole.classList.remove('hit');
        }, 300);
        
        this.playSound('hit');
    }
    
    checkMiss(e) {
        if (!this.gameActive || this.gamePaused) return;
        
        // Only count as miss if clicking on hole without active mole
        const hole = e.target.closest('.hole');
        const mole = hole.querySelector('.mole');
        
        if (!mole.classList.contains('up')) {
            this.stats.totalMisses++;
            this.playSound('miss');
        }
    }
    
    endGame() {
        this.gameActive = false;
        this.gamePaused = false;
        
        // Clear timers
        clearInterval(this.gameTimer);
        clearTimeout(this.moleTimer);
        
        // Hide all moles
        document.querySelectorAll('.mole').forEach(mole => {
            mole.classList.remove('up', 'hit', 'missed');
        });
        
        // Update high score
        if (this.score > this.highScore) {
            this.highScore = this.score;
            localStorage.setItem('whackMoleHighScore', this.highScore);
            this.updateDisplay();
        }
        
        // Update statistics
        this.updateGameStats();
        
        this.showGameOver();
        this.updateButtons();
        this.playSound('gameOver');
    }
    
    updateGameStats() {
        this.stats.gamesPlayed++;
        this.stats.totalScore += this.score;
        this.stats.averageScore = Math.round(this.stats.totalScore / this.stats.gamesPlayed);
        
        const totalAttempts = this.stats.totalHits + this.stats.totalMisses;
        this.stats.accuracy = totalAttempts > 0 ? Math.round((this.stats.totalHits / totalAttempts) * 100) : 0;
        
        if (this.score > this.stats.bestTime) {
            this.stats.bestTime = this.score;
        }
        
        localStorage.setItem('whackMoleStats', JSON.stringify(this.stats));
    }
    
    updateDisplay() {
        document.getElementById('currentScore').textContent = this.score;
        document.getElementById('highScore').textContent = this.highScore;
        document.getElementById('timeLeft').textContent = this.timeLeft;
    }
    
    animateScore() {
        const scoreElement = document.getElementById('currentScore');
        scoreElement.classList.add('animate');
        setTimeout(() => scoreElement.classList.remove('animate'), 300);
    }
    
    updateButtons() {
        const startBtn = document.getElementById('startBtn');
        const pauseBtn = document.getElementById('pauseBtn');
        
        if (this.gameActive) {
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
        const resultIcon = document.getElementById('resultIcon');
        
        finalScore.textContent = this.score;
        
        if (this.score === this.highScore && this.score > 0) {
            resultMessage.textContent = 'New High Score! 🎉';
            resultIcon.innerHTML = '<i class="fas fa-crown"></i>';
        } else if (this.score >= 300) {
            resultMessage.textContent = 'Incredible performance! 🌟';
            resultIcon.innerHTML = '<i class="fas fa-star"></i>';
        } else if (this.score >= 200) {
            resultMessage.textContent = 'Excellent job! 👏';
            resultIcon.innerHTML = '<i class="fas fa-trophy"></i>';
        } else if (this.score >= 100) {
            resultMessage.textContent = 'Great work! 💪';
            resultIcon.innerHTML = '<i class="fas fa-thumbs-up"></i>';
        } else {
            resultMessage.textContent = 'Keep practicing! 🎯';
            resultIcon.innerHTML = '<i class="fas fa-target"></i>';
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
                case 'hit':
                    frequency = 800;
                    duration = 0.1;
                    waveType = 'square';
                    break;
                case 'miss':
                    frequency = 200;
                    duration = 0.2;
                    waveType = 'sawtooth';
                    break;
                case 'gameOver':
                    frequency = 300;
                    duration = 0.8;
                    waveType = 'triangle';
                    break;
                case 'warning':
                    frequency = 600;
                    duration = 0.1;
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

// Game Statistics Manager
class WhackMoleStatistics {
    constructor(game) {
        this.game = game;
    }
    
    getDetailedStats() {
        const stats = this.game.stats;
        const totalAttempts = stats.totalHits + stats.totalMisses;
        
        return {
            ...stats,
            totalAttempts,
            missRate: totalAttempts > 0 ? Math.round((stats.totalMisses / totalAttempts) * 100) : 0,
            averageHitsPerGame: stats.gamesPlayed > 0 ? Math.round(stats.totalHits / stats.gamesPlayed) : 0
        };
    }
    
    resetStats() {
        this.game.stats = {
            gamesPlayed: 0,
            totalScore: 0,
            totalHits: 0,
            totalMisses: 0,
            averageScore: 0,
            accuracy: 0,
            bestTime: 0
        };
        localStorage.setItem('whackMoleStats', JSON.stringify(this.game.stats));
    }
    
    exportStats() {
        const stats = this.getDetailedStats();
        const dataStr = JSON.stringify(stats, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = 'whack-mole-statistics.json';
        link.click();
    }
}

// Power-ups system (bonus feature)
class PowerUpSystem {
    constructor(game) {
        this.game = game;
        this.powerUps = {
            slowTime: { active: false, duration: 5000 },
            doublePoints: { active: false, duration: 10000 },
            extraTime: { active: false, duration: 0 }
        };
    }
    
    activateSlowTime() {
        if (this.powerUps.slowTime.active) return;
        
        this.powerUps.slowTime.active = true;
        this.game.moleSpeed *= 2; // Slow down mole spawning
        
        setTimeout(() => {
            this.powerUps.slowTime.active = false;
            this.game.moleSpeed /= 2;
        }, this.powerUps.slowTime.duration);
        
        this.showPowerUpNotification('Slow Time Activated!', '⏰');
    }
    
    activateDoublePoints() {
        if (this.powerUps.doublePoints.active) return;
        
        this.powerUps.doublePoints.active = true;
        
        setTimeout(() => {
            this.powerUps.doublePoints.active = false;
        }, this.powerUps.doublePoints.duration);
        
        this.showPowerUpNotification('Double Points Activated!', '💎');
    }
    
    activateExtraTime() {
        this.game.timeLeft += 10;
        this.game.updateDisplay();
        this.showPowerUpNotification('+10 Seconds!', '⏱️');
    }
    
    showPowerUpNotification(text, icon) {
        const notification = document.createElement('div');
        notification.className = 'power-up-notification';
        notification.innerHTML = `
            <span class="power-up-icon">${icon}</span>
            <span class="power-up-text">${text}</span>
        `;
        
        notification.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: linear-gradient(135deg, #667eea, #764ba2);
            color: white;
            padding: 20px 30px;
            border-radius: 12px;
            font-size: 1.2rem;
            font-weight: 600;
            z-index: 10000;
            animation: powerUpPulse 2s ease-out;
            box-shadow: 0 10px 25px rgba(0,0,0,0.3);
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 2000);
    }
    
    getModifiedScore(baseScore) {
        return this.powerUps.doublePoints.active ? baseScore * 2 : baseScore;
    }
}

// Initialize game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const game = new WhackAMoleGame();
    const statistics = new WhackMoleStatistics(game);
    const powerUps = new PowerUpSystem(game);
    
    // Override hitMole to use power-ups
    const originalHitMole = game.hitMole.bind(game);
    game.hitMole = function(e) {
        e.stopPropagation();
        
        if (!this.gameActive || this.gamePaused) return;
        
        const mole = e.target.closest('.mole');
        const holeIndex = parseInt(mole.id.split('-')[1]);
        
        if (!mole.classList.contains('up') || mole.classList.contains('hit')) return;
        
        // Hit successful
        mole.classList.remove('up');
        mole.classList.add('hit');
        this.activeMoles.delete(holeIndex);
        
        // Update score with power-ups
        const baseScore = 10;
        const finalScore = powerUps.getModifiedScore(baseScore);
        this.score += finalScore;
        this.stats.totalHits++;
        this.updateDisplay();
        this.animateScore();
        
        // Add hit effect to hole
        const hole = mole.closest('.hole');
        hole.classList.add('hit-effect');
        setTimeout(() => hole.classList.remove('hit-effect'), 300);
        
        // Remove hit animation
        setTimeout(() => {
            mole.classList.remove('hit');
        }, 300);
        
        // Random power-up chance (5%)
        if (Math.random() < 0.05) {
            const powerUpTypes = ['slowTime', 'doublePoints', 'extraTime'];
            const randomPowerUp = powerUpTypes[Math.floor(Math.random() * powerUpTypes.length)];
            
            switch (randomPowerUp) {
                case 'slowTime':
                    powerUps.activateSlowTime();
                    break;
                case 'doublePoints':
                    powerUps.activateDoublePoints();
                    break;
                case 'extraTime':
                    powerUps.activateExtraTime();
                    break;
            }
        }
        
        this.playSound('hit');
    };
    
    // Add statistics button
    const statsBtn = document.createElement('button');
    statsBtn.className = 'btn btn-secondary';
    statsBtn.innerHTML = '<i class="fas fa-chart-bar"></i> Stats';
    statsBtn.addEventListener('click', () => {
        const stats = statistics.getDetailedStats();
        alert(`Game Statistics:
Games Played: ${stats.gamesPlayed}
Average Score: ${stats.averageScore}
Total Hits: ${stats.totalHits}
Total Misses: ${stats.totalMisses}
Accuracy: ${stats.accuracy}%
Best Score: ${stats.bestTime}
Average Hits/Game: ${stats.averageHitsPerGame}`);
    });
    
    document.querySelector('.game-controls').appendChild(statsBtn);
    
    // Add CSS for power-up animations
    const style = document.createElement('style');
    style.textContent = `
        @keyframes powerUpPulse {
            0% { transform: translate(-50%, -50%) scale(0.5); opacity: 0; }
            50% { transform: translate(-50%, -50%) scale(1.1); opacity: 1; }
            100% { transform: translate(-50%, -50%) scale(1); opacity: 0; }
        }
    `;
    document.head.appendChild(style);
    
    console.log('🔨 Whack-a-Mole game initialized!');
    console.log('💡 Use SPACE to pause, R to reset, S to start');
}); 