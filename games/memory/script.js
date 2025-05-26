// Memory Game Class
class MemoryGame {
    constructor() {
        this.cards = [];
        this.flippedCards = [];
        this.matchedPairs = 0;
        this.moves = 0;
        this.gameActive = false;
        this.gamePaused = false;
        this.startTime = null;
        this.gameTimer = null;
        this.elapsedTime = 0;
        this.hintsUsed = 0;
        
        // Difficulty settings
        this.difficulties = {
            easy: { rows: 3, cols: 4, pairs: 6 },
            medium: { rows: 4, cols: 4, pairs: 8 },
            hard: { rows: 4, cols: 6, pairs: 12 },
            expert: { rows: 6, cols: 6, pairs: 18 }
        };
        
        this.currentDifficulty = 'medium';
        
        // Statistics
        this.stats = JSON.parse(localStorage.getItem('memoryStats')) || {
            gamesPlayed: 0,
            bestTimes: { easy: null, medium: null, hard: null, expert: null },
            averageMoves: { easy: 0, medium: 0, hard: 0, expert: 0 },
            totalGames: { easy: 0, medium: 0, hard: 0, expert: 0 },
            hintsUsed: 0
        };
        
        // Card icons
        this.cardIcons = [
            'fas fa-star', 'fas fa-heart', 'fas fa-diamond', 'fas fa-club',
            'fas fa-spade', 'fas fa-crown', 'fas fa-gem', 'fas fa-fire',
            'fas fa-leaf', 'fas fa-snowflake', 'fas fa-sun', 'fas fa-moon',
            'fas fa-bolt', 'fas fa-cloud', 'fas fa-rainbow', 'fas fa-mountain',
            'fas fa-tree', 'fas fa-flower', 'fas fa-butterfly', 'fas fa-cat',
            'fas fa-dog', 'fas fa-fish', 'fas fa-bird', 'fas fa-dragon',
            'fas fa-unicorn', 'fas fa-rocket', 'fas fa-car', 'fas fa-plane',
            'fas fa-ship', 'fas fa-bicycle', 'fas fa-guitar', 'fas fa-music',
            'fas fa-camera', 'fas fa-book', 'fas fa-coffee', 'fas fa-pizza'
        ];
        
        this.init();
    }
    
    init() {
        this.bindEvents();
        this.updateDisplay();
        this.updateBestTime();
        this.generateCards();
    }
    
    bindEvents() {
        document.getElementById('startBtn').addEventListener('click', () => this.startGame());
        document.getElementById('pauseBtn').addEventListener('click', () => this.togglePause());
        document.getElementById('hintBtn').addEventListener('click', () => this.useHint());
        document.getElementById('playAgainBtn').addEventListener('click', () => this.startGame());
        document.getElementById('difficultySelect').addEventListener('change', (e) => {
            this.currentDifficulty = e.target.value;
            this.generateCards();
            this.updateBestTime();
        });
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => this.handleKeyPress(e));
    }
    
    handleKeyPress(e) {
        if (e.key === ' ' || e.key === 'p') {
            e.preventDefault();
            if (this.gameActive) {
                this.togglePause();
            }
        }
        
        if (e.key === 'h' && this.gameActive && !this.gamePaused) {
            this.useHint();
        }
        
        if (e.key === 'n') {
            this.startGame();
        }
    }
    
    generateCards() {
        const difficulty = this.difficulties[this.currentDifficulty];
        const totalCards = difficulty.rows * difficulty.cols;
        const pairs = totalCards / 2;
        
        // Select random icons for this game
        const selectedIcons = this.cardIcons.slice(0, pairs);
        
        // Create pairs
        this.cards = [];
        selectedIcons.forEach((icon, index) => {
            this.cards.push({ id: index * 2, icon, matched: false });
            this.cards.push({ id: index * 2 + 1, icon, matched: false });
        });
        
        // Shuffle cards
        this.shuffleArray(this.cards);
        
        this.renderCards();
        this.resetGame();
    }
    
    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }
    
    renderCards() {
        const grid = document.getElementById('memoryGrid');
        const difficulty = this.difficulties[this.currentDifficulty];
        
        grid.className = `memory-grid ${this.currentDifficulty}`;
        grid.innerHTML = '';
        
        this.cards.forEach((card, index) => {
            const cardElement = document.createElement('div');
            cardElement.className = 'memory-card';
            cardElement.dataset.cardId = card.id;
            cardElement.dataset.icon = card.icon;
            
            cardElement.innerHTML = `
                <div class="card-face card-back">
                    <i class="fas fa-question"></i>
                </div>
                <div class="card-face card-front">
                    <i class="${card.icon}"></i>
                </div>
            `;
            
            cardElement.addEventListener('click', () => this.flipCard(cardElement));
            grid.appendChild(cardElement);
        });
    }
    
    startGame() {
        this.gameActive = true;
        this.gamePaused = false;
        this.moves = 0;
        this.matchedPairs = 0;
        this.flippedCards = [];
        this.elapsedTime = 0;
        this.hintsUsed = 0;
        this.startTime = new Date();
        
        // Reset all cards
        document.querySelectorAll('.memory-card').forEach(card => {
            card.classList.remove('flipped', 'matched', 'disabled');
        });
        
        this.cards.forEach(card => card.matched = false);
        
        // Start timer
        this.gameTimer = setInterval(() => this.updateTimer(), 1000);
        
        this.updateDisplay();
        this.updateButtons();
        this.hideGameOver();
        
        this.playSound('start');
    }
    
    togglePause() {
        if (!this.gameActive) return;
        
        this.gamePaused = !this.gamePaused;
        
        if (this.gamePaused) {
            clearInterval(this.gameTimer);
            document.querySelectorAll('.memory-card').forEach(card => {
                card.classList.add('disabled');
            });
            this.playSound('pause');
        } else {
            this.gameTimer = setInterval(() => this.updateTimer(), 1000);
            document.querySelectorAll('.memory-card:not(.matched)').forEach(card => {
                card.classList.remove('disabled');
            });
            this.playSound('resume');
        }
        
        this.updateButtons();
    }
    
    flipCard(cardElement) {
        if (!this.gameActive || this.gamePaused || 
            cardElement.classList.contains('flipped') || 
            cardElement.classList.contains('matched') ||
            this.flippedCards.length >= 2) {
            return;
        }
        
        cardElement.classList.add('flipped');
        this.flippedCards.push(cardElement);
        
        this.playSound('flip');
        
        if (this.flippedCards.length === 2) {
            this.moves++;
            this.updateDisplay();
            this.animateElement('movesDisplay');
            
            setTimeout(() => this.checkMatch(), 1000);
        }
    }
    
    checkMatch() {
        const [card1, card2] = this.flippedCards;
        const icon1 = card1.dataset.icon;
        const icon2 = card2.dataset.icon;
        
        if (icon1 === icon2) {
            // Match found
            card1.classList.add('matched');
            card2.classList.add('matched');
            
            const cardId1 = parseInt(card1.dataset.cardId);
            const cardId2 = parseInt(card2.dataset.cardId);
            
            this.cards.find(c => c.id === cardId1).matched = true;
            this.cards.find(c => c.id === cardId2).matched = true;
            
            this.matchedPairs++;
            this.updateDisplay();
            this.animateElement('matchesDisplay');
            
            this.playSound('match');
            
            // Check if game is complete
            const totalPairs = this.difficulties[this.currentDifficulty].pairs;
            if (this.matchedPairs === totalPairs) {
                setTimeout(() => this.endGame(), 500);
            }
        } else {
            // No match
            setTimeout(() => {
                card1.classList.remove('flipped');
                card2.classList.remove('flipped');
                this.playSound('mismatch');
            }, 500);
        }
        
        this.flippedCards = [];
    }
    
    useHint() {
        if (!this.gameActive || this.gamePaused || this.hintsUsed >= 3) return;
        
        const unmatchedCards = Array.from(document.querySelectorAll('.memory-card:not(.matched):not(.flipped)'));
        
        if (unmatchedCards.length < 2) return;
        
        // Find a matching pair
        for (let i = 0; i < unmatchedCards.length; i++) {
            for (let j = i + 1; j < unmatchedCards.length; j++) {
                if (unmatchedCards[i].dataset.icon === unmatchedCards[j].dataset.icon) {
                    unmatchedCards[i].classList.add('hint');
                    unmatchedCards[j].classList.add('hint');
                    
                    setTimeout(() => {
                        unmatchedCards[i].classList.remove('hint');
                        unmatchedCards[j].classList.remove('hint');
                    }, 2000);
                    
                    this.hintsUsed++;
                    this.playSound('hint');
                    return;
                }
            }
        }
    }
    
    updateTimer() {
        if (this.gamePaused) return;
        
        this.elapsedTime++;
        this.updateDisplay();
    }
    
    endGame() {
        this.gameActive = false;
        clearInterval(this.gameTimer);
        
        // Update statistics
        this.updateGameStats();
        
        this.showGameOver();
        this.updateButtons();
        this.playSound('complete');
    }
    
    resetGame() {
        this.gameActive = false;
        this.gamePaused = false;
        this.moves = 0;
        this.matchedPairs = 0;
        this.flippedCards = [];
        this.elapsedTime = 0;
        this.hintsUsed = 0;
        
        clearInterval(this.gameTimer);
        
        this.updateDisplay();
        this.updateButtons();
        this.hideGameOver();
    }
    
    updateDisplay() {
        document.getElementById('movesDisplay').textContent = this.moves;
        document.getElementById('matchesDisplay').textContent = this.matchedPairs;
        
        const minutes = Math.floor(this.elapsedTime / 60);
        const seconds = this.elapsedTime % 60;
        document.getElementById('timeDisplay').textContent = 
            `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    
    updateBestTime() {
        const bestTime = this.stats.bestTimes[this.currentDifficulty];
        const bestTimeDisplay = document.getElementById('bestTimeDisplay');
        
        if (bestTime) {
            const minutes = Math.floor(bestTime / 60);
            const seconds = bestTime % 60;
            bestTimeDisplay.textContent = 
                `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        } else {
            bestTimeDisplay.textContent = '--:--';
        }
    }
    
    updateButtons() {
        const pauseBtn = document.getElementById('pauseBtn');
        
        if (this.gameActive) {
            pauseBtn.disabled = false;
            if (this.gamePaused) {
                pauseBtn.innerHTML = '<i class="fas fa-play"></i> Resume';
            } else {
                pauseBtn.innerHTML = '<i class="fas fa-pause"></i> Pause';
            }
        } else {
            pauseBtn.disabled = true;
            pauseBtn.innerHTML = '<i class="fas fa-pause"></i> Pause';
        }
        
        // Update hint button
        const hintBtn = document.getElementById('hintBtn');
        if (this.hintsUsed >= 3) {
            hintBtn.disabled = true;
            hintBtn.innerHTML = '<i class="fas fa-lightbulb"></i> No Hints Left';
        } else {
            hintBtn.disabled = !this.gameActive || this.gamePaused;
            hintBtn.innerHTML = `<i class="fas fa-lightbulb"></i> Hint (${3 - this.hintsUsed})`;
        }
    }
    
    showGameOver() {
        const overlay = document.getElementById('gameOverlay');
        const totalPairs = this.difficulties[this.currentDifficulty].pairs;
        const accuracy = Math.round((totalPairs / this.moves) * 100);
        const score = Math.max(0, 1000 - (this.moves * 10) - (this.elapsedTime * 2) - (this.hintsUsed * 50));
        
        const minutes = Math.floor(this.elapsedTime / 60);
        const seconds = this.elapsedTime % 60;
        const timeString = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        
        document.getElementById('finalTime').textContent = timeString;
        document.getElementById('finalMoves').textContent = this.moves;
        document.getElementById('finalAccuracy').textContent = `${accuracy}%`;
        document.getElementById('finalScore').textContent = score;
        
        // Performance message
        const performanceMessage = document.getElementById('performanceMessage');
        if (accuracy >= 90 && this.elapsedTime <= 60) {
            performanceMessage.textContent = '🏆 Perfect! You have an amazing memory!';
        } else if (accuracy >= 80) {
            performanceMessage.textContent = '⭐ Excellent! Great memory skills!';
        } else if (accuracy >= 70) {
            performanceMessage.textContent = '👍 Good job! Keep practicing!';
        } else {
            performanceMessage.textContent = '💪 Nice try! Practice makes perfect!';
        }
        
        overlay.style.display = 'flex';
    }
    
    hideGameOver() {
        document.getElementById('gameOverlay').style.display = 'none';
    }
    
    updateGameStats() {
        this.stats.gamesPlayed++;
        this.stats.totalGames[this.currentDifficulty]++;
        this.stats.hintsUsed += this.hintsUsed;
        
        // Update best time
        if (!this.stats.bestTimes[this.currentDifficulty] || 
            this.elapsedTime < this.stats.bestTimes[this.currentDifficulty]) {
            this.stats.bestTimes[this.currentDifficulty] = this.elapsedTime;
            this.updateBestTime();
        }
        
        // Update average moves
        const totalGames = this.stats.totalGames[this.currentDifficulty];
        const currentAvg = this.stats.averageMoves[this.currentDifficulty];
        this.stats.averageMoves[this.currentDifficulty] = 
            Math.round(((currentAvg * (totalGames - 1)) + this.moves) / totalGames);
        
        localStorage.setItem('memoryStats', JSON.stringify(this.stats));
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
                case 'start':
                    frequency = 440;
                    duration = 0.2;
                    break;
                case 'flip':
                    frequency = 600;
                    duration = 0.1;
                    break;
                case 'match':
                    frequency = 800;
                    duration = 0.3;
                    waveType = 'square';
                    break;
                case 'mismatch':
                    frequency = 300;
                    duration = 0.2;
                    waveType = 'sawtooth';
                    break;
                case 'complete':
                    frequency = 1000;
                    duration = 0.5;
                    waveType = 'square';
                    break;
                case 'hint':
                    frequency = 700;
                    duration = 0.2;
                    break;
                case 'pause':
                    frequency = 400;
                    duration = 0.1;
                    break;
                case 'resume':
                    frequency = 500;
                    duration = 0.1;
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

// Memory Statistics Manager
class MemoryStatistics {
    constructor(game) {
        this.game = game;
    }
    
    getDetailedStats() {
        const stats = this.game.stats;
        return {
            ...stats,
            totalGamesPlayed: Object.values(stats.totalGames).reduce((a, b) => a + b, 0),
            averageHintsPerGame: stats.gamesPlayed > 0 ? Math.round(stats.hintsUsed / stats.gamesPlayed * 10) / 10 : 0
        };
    }
    
    resetStats() {
        this.game.stats = {
            gamesPlayed: 0,
            bestTimes: { easy: null, medium: null, hard: null, expert: null },
            averageMoves: { easy: 0, medium: 0, hard: 0, expert: 0 },
            totalGames: { easy: 0, medium: 0, hard: 0, expert: 0 },
            hintsUsed: 0
        };
        localStorage.setItem('memoryStats', JSON.stringify(this.game.stats));
        this.game.updateBestTime();
    }
}

// Initialize game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const game = new MemoryGame();
    const statistics = new MemoryStatistics(game);
    
    // Add statistics button
    const statsBtn = document.createElement('button');
    statsBtn.className = 'btn btn-secondary';
    statsBtn.innerHTML = '<i class="fas fa-chart-bar"></i> Stats';
    statsBtn.addEventListener('click', () => {
        const stats = statistics.getDetailedStats();
        const bestTimes = Object.entries(stats.bestTimes)
            .map(([diff, time]) => {
                if (time) {
                    const minutes = Math.floor(time / 60);
                    const seconds = time % 60;
                    return `${diff}: ${minutes}:${seconds.toString().padStart(2, '0')}`;
                }
                return `${diff}: --:--`;
            }).join('\n');
        
        alert(`Memory Game Statistics:
Games Played: ${stats.totalGamesPlayed}
Hints Used: ${stats.hintsUsed}
Average Hints/Game: ${stats.averageHintsPerGame}

Best Times:
${bestTimes}

Average Moves:
Easy: ${stats.averageMoves.easy}
Medium: ${stats.averageMoves.medium}
Hard: ${stats.averageMoves.hard}
Expert: ${stats.averageMoves.expert}`);
    });
    
    document.querySelector('.game-controls').appendChild(statsBtn);
    
    console.log('🧠 Memory Game initialized!');
    console.log('💡 Use SPACE to pause, H for hint, N for new game');
}); 