// Rock Paper Scissors Game Class
class RockPaperScissorsGame {
    constructor() {
        this.playerScore = 0;
        this.computerScore = 0;
        this.gameActive = true;
        this.winningScore = 5;
        
        // Game statistics
        this.stats = JSON.parse(localStorage.getItem('rpsStats')) || {
            gamesPlayed: 0,
            wins: 0,
            losses: 0,
            draws: 0,
            currentStreak: 0,
            bestStreak: 0,
            winRate: 0
        };
        
        // Game choices
        this.choices = ['rock', 'paper', 'scissors'];
        this.choiceIcons = {
            rock: 'fas fa-hand-rock',
            paper: 'fas fa-hand-paper',
            scissors: 'fas fa-hand-scissors'
        };
        
        this.init();
    }
    
    init() {
        this.bindEvents();
        this.updateDisplay();
        this.updateStats();
    }
    
    bindEvents() {
        // Choice buttons
        document.querySelectorAll('.choice-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const choice = e.currentTarget.dataset.choice;
                this.playRound(choice);
            });
        });
        
        // Control buttons
        document.getElementById('resetBtn').addEventListener('click', () => this.resetGame());
        document.getElementById('rulesBtn').addEventListener('click', () => this.showRules());
        document.getElementById('closeRulesBtn').addEventListener('click', () => this.hideRules());
        
        // Keyboard controls
        document.addEventListener('keydown', (e) => this.handleKeyPress(e));
        
        // Modal close on outside click
        document.getElementById('rulesModal').addEventListener('click', (e) => {
            if (e.target.id === 'rulesModal') {
                this.hideRules();
            }
        });
    }
    
    handleKeyPress(e) {
        if (!this.gameActive) return;
        
        const key = e.key.toLowerCase();
        
        switch (key) {
            case 'r':
                this.playRound('rock');
                break;
            case 'p':
                this.playRound('paper');
                break;
            case 's':
                this.playRound('scissors');
                break;
            case 'escape':
                this.hideRules();
                break;
        }
    }
    
    async playRound(playerChoice) {
        if (!this.gameActive) return;
        
        this.gameActive = false;
        this.disableChoiceButtons();
        
        // Show player choice
        this.showPlayerChoice(playerChoice);
        
        // Start countdown and computer thinking animation
        await this.startBattle();
        
        // Generate computer choice
        const computerChoice = this.getComputerChoice();
        this.showComputerChoice(computerChoice);
        
        // Determine winner
        const result = this.determineWinner(playerChoice, computerChoice);
        
        // Show result
        await this.showResult(result, playerChoice, computerChoice);
        
        // Update scores and stats
        this.updateScores(result);
        this.updateGameStats(result);
        
        // Check for game end
        if (this.checkGameEnd()) {
            this.endGame();
        } else {
            this.enableChoiceButtons();
            this.gameActive = true;
        }
    }
    
    showPlayerChoice(choice) {
        const playerIcon = document.getElementById('playerChoiceIcon');
        const playerText = document.getElementById('playerChoiceText');
        
        playerIcon.innerHTML = `<i class="${this.choiceIcons[choice]}"></i>`;
        playerIcon.className = `choice-icon ${choice}`;
        playerText.textContent = this.capitalizeFirst(choice);
        
        playerIcon.classList.add('animate-bounce');
        setTimeout(() => playerIcon.classList.remove('animate-bounce'), 600);
    }
    
    async startBattle() {
        const countdown = document.getElementById('countdown');
        const computerIcon = document.getElementById('computerChoiceIcon');
        const computerText = document.getElementById('computerChoiceText');
        
        // Reset computer display
        computerIcon.innerHTML = '<i class="fas fa-question"></i>';
        computerIcon.className = 'choice-icon';
        computerText.textContent = 'Thinking...';
        
        // Countdown animation
        for (let i = 3; i > 0; i--) {
            countdown.textContent = i;
            countdown.classList.add('active');
            
            // Computer thinking animation
            computerIcon.classList.add('animate-shake');
            
            await this.delay(1000);
            
            countdown.classList.remove('active');
            computerIcon.classList.remove('animate-shake');
            
            if (i > 1) {
                await this.delay(200);
            }
        }
        
        countdown.textContent = 'GO!';
        countdown.classList.add('active');
        await this.delay(500);
        countdown.classList.remove('active');
    }
    
    getComputerChoice() {
        return this.choices[Math.floor(Math.random() * this.choices.length)];
    }
    
    showComputerChoice(choice) {
        const computerIcon = document.getElementById('computerChoiceIcon');
        const computerText = document.getElementById('computerChoiceText');
        
        computerIcon.innerHTML = `<i class="${this.choiceIcons[choice]}"></i>`;
        computerIcon.className = `choice-icon ${choice}`;
        computerText.textContent = this.capitalizeFirst(choice);
        
        computerIcon.classList.add('animate-bounce');
        setTimeout(() => computerIcon.classList.remove('animate-bounce'), 600);
    }
    
    determineWinner(playerChoice, computerChoice) {
        if (playerChoice === computerChoice) {
            return 'draw';
        }
        
        const winConditions = {
            rock: 'scissors',
            paper: 'rock',
            scissors: 'paper'
        };
        
        return winConditions[playerChoice] === computerChoice ? 'win' : 'lose';
    }
    
    async showResult(result, playerChoice, computerChoice) {
        const resultDisplay = document.getElementById('resultDisplay');
        const resultIcon = document.getElementById('resultIcon');
        const resultText = document.getElementById('resultText');
        const resultMessage = document.getElementById('resultMessage');
        
        // Set result content
        switch (result) {
            case 'win':
                resultIcon.innerHTML = '<i class="fas fa-trophy"></i>';
                resultIcon.className = 'result-icon win';
                resultText.textContent = 'You Win!';
                resultMessage.textContent = `${this.capitalizeFirst(playerChoice)} beats ${computerChoice}!`;
                this.playSound('win');
                break;
            case 'lose':
                resultIcon.innerHTML = '<i class="fas fa-skull-crossbones"></i>';
                resultIcon.className = 'result-icon lose';
                resultText.textContent = 'You Lose!';
                resultMessage.textContent = `${this.capitalizeFirst(computerChoice)} beats ${playerChoice}!`;
                this.playSound('lose');
                break;
            case 'draw':
                resultIcon.innerHTML = '<i class="fas fa-handshake"></i>';
                resultIcon.className = 'result-icon draw';
                resultText.textContent = "It's a Draw!";
                resultMessage.textContent = `Both chose ${playerChoice}!`;
                this.playSound('draw');
                break;
        }
        
        // Show result with animation
        resultDisplay.classList.add('show');
        
        await this.delay(2500);
        
        // Hide result
        resultDisplay.classList.remove('show');
        await this.delay(300);
    }
    
    updateScores(result) {
        if (result === 'win') {
            this.playerScore++;
            this.animateScore('playerScore');
        } else if (result === 'lose') {
            this.computerScore++;
            this.animateScore('computerScore');
        }
        
        this.updateDisplay();
    }
    
    updateGameStats(result) {
        this.stats.gamesPlayed++;
        
        switch (result) {
            case 'win':
                this.stats.wins++;
                this.stats.currentStreak++;
                if (this.stats.currentStreak > this.stats.bestStreak) {
                    this.stats.bestStreak = this.stats.currentStreak;
                }
                break;
            case 'lose':
                this.stats.losses++;
                this.stats.currentStreak = 0;
                break;
            case 'draw':
                this.stats.draws++;
                break;
        }
        
        this.stats.winRate = Math.round((this.stats.wins / this.stats.gamesPlayed) * 100);
        this.saveStats();
        this.updateStats();
    }
    
    checkGameEnd() {
        return this.playerScore >= this.winningScore || this.computerScore >= this.winningScore;
    }
    
    async endGame() {
        const isPlayerWinner = this.playerScore >= this.winningScore;
        
        // Show final result
        const resultDisplay = document.getElementById('resultDisplay');
        const resultIcon = document.getElementById('resultIcon');
        const resultText = document.getElementById('resultText');
        const resultMessage = document.getElementById('resultMessage');
        
        if (isPlayerWinner) {
            resultIcon.innerHTML = '<i class="fas fa-crown"></i>';
            resultIcon.className = 'result-icon win';
            resultText.textContent = 'Victory!';
            resultMessage.textContent = `You won the match ${this.playerScore}-${this.computerScore}!`;
            this.playSound('victory');
        } else {
            resultIcon.innerHTML = '<i class="fas fa-skull"></i>';
            resultIcon.className = 'result-icon lose';
            resultText.textContent = 'Defeat!';
            resultMessage.textContent = `Computer won the match ${this.computerScore}-${this.playerScore}!`;
            this.playSound('defeat');
        }
        
        resultDisplay.classList.add('show');
        
        // Auto-reset after delay
        await this.delay(4000);
        this.resetGame();
    }
    
    resetGame() {
        this.playerScore = 0;
        this.computerScore = 0;
        this.gameActive = true;
        
        // Reset displays
        this.updateDisplay();
        this.resetChoiceDisplays();
        this.enableChoiceButtons();
        
        // Hide result
        document.getElementById('resultDisplay').classList.remove('show');
        
        this.playSound('reset');
    }
    
    resetChoiceDisplays() {
        const playerIcon = document.getElementById('playerChoiceIcon');
        const playerText = document.getElementById('playerChoiceText');
        const computerIcon = document.getElementById('computerChoiceIcon');
        const computerText = document.getElementById('computerChoiceText');
        
        playerIcon.innerHTML = '<i class="fas fa-question"></i>';
        playerIcon.className = 'choice-icon';
        playerText.textContent = 'Make your choice';
        
        computerIcon.innerHTML = '<i class="fas fa-question"></i>';
        computerIcon.className = 'choice-icon';
        computerText.textContent = 'Waiting...';
    }
    
    updateDisplay() {
        document.getElementById('playerScore').textContent = this.playerScore;
        document.getElementById('computerScore').textContent = this.computerScore;
    }
    
    updateStats() {
        document.getElementById('gamesPlayed').textContent = this.stats.gamesPlayed;
        document.getElementById('winRate').textContent = `${this.stats.winRate}%`;
        document.getElementById('bestStreak').textContent = this.stats.bestStreak;
    }
    
    animateScore(elementId) {
        const element = document.getElementById(elementId);
        element.classList.add('animate');
        setTimeout(() => element.classList.remove('animate'), 300);
    }
    
    disableChoiceButtons() {
        document.querySelectorAll('.choice-btn').forEach(btn => {
            btn.disabled = true;
        });
    }
    
    enableChoiceButtons() {
        document.querySelectorAll('.choice-btn').forEach(btn => {
            btn.disabled = false;
        });
    }
    
    showRules() {
        document.getElementById('rulesModal').style.display = 'flex';
    }
    
    hideRules() {
        document.getElementById('rulesModal').style.display = 'none';
    }
    
    saveStats() {
        localStorage.setItem('rpsStats', JSON.stringify(this.stats));
    }
    
    capitalizeFirst(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }
    
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
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
                case 'win':
                    frequency = 800;
                    duration = 0.3;
                    waveType = 'square';
                    break;
                case 'lose':
                    frequency = 300;
                    duration = 0.5;
                    waveType = 'sawtooth';
                    break;
                case 'draw':
                    frequency = 500;
                    duration = 0.2;
                    break;
                case 'victory':
                    // Play victory fanfare
                    this.playVictoryFanfare(audioContext);
                    return;
                case 'defeat':
                    frequency = 200;
                    duration = 1.0;
                    waveType = 'sawtooth';
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
    
    playVictoryFanfare(audioContext) {
        const notes = [523, 659, 784, 1047]; // C, E, G, C (major chord)
        
        notes.forEach((frequency, index) => {
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.value = frequency;
            oscillator.type = 'sine';
            
            const startTime = audioContext.currentTime + (index * 0.2);
            const duration = 0.4;
            
            gainNode.gain.setValueAtTime(0.05, startTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + duration);
            
            oscillator.start(startTime);
            oscillator.stop(startTime + duration);
        });
    }
}

// Game Statistics Manager
class RPSStatistics {
    constructor(game) {
        this.game = game;
    }
    
    getDetailedStats() {
        const stats = this.game.stats;
        return {
            ...stats,
            totalGames: stats.wins + stats.losses + stats.draws,
            lossRate: Math.round((stats.losses / stats.gamesPlayed) * 100),
            drawRate: Math.round((stats.draws / stats.gamesPlayed) * 100),
            averageGameLength: this.calculateAverageGameLength()
        };
    }
    
    calculateAverageGameLength() {
        // Estimate based on winning score and games played
        if (this.game.stats.gamesPlayed === 0) return 0;
        return Math.round((this.game.stats.gamesPlayed * this.game.winningScore) / 2);
    }
    
    resetStats() {
        this.game.stats = {
            gamesPlayed: 0,
            wins: 0,
            losses: 0,
            draws: 0,
            currentStreak: 0,
            bestStreak: 0,
            winRate: 0
        };
        this.game.saveStats();
        this.game.updateStats();
    }
    
    exportStats() {
        const stats = this.getDetailedStats();
        const dataStr = JSON.stringify(stats, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = 'rps-statistics.json';
        link.click();
    }
}

// Achievement System (Bonus Feature)
class RPSAchievements {
    constructor(game) {
        this.game = game;
        this.achievements = JSON.parse(localStorage.getItem('rpsAchievements')) || {};
        this.achievementDefinitions = {
            firstWin: { name: 'First Victory', description: 'Win your first game', icon: 'fas fa-star' },
            winStreak5: { name: 'Hot Streak', description: 'Win 5 games in a row', icon: 'fas fa-fire' },
            winStreak10: { name: 'Unstoppable', description: 'Win 10 games in a row', icon: 'fas fa-crown' },
            games50: { name: 'Veteran', description: 'Play 50 games', icon: 'fas fa-medal' },
            games100: { name: 'Master', description: 'Play 100 games', icon: 'fas fa-trophy' },
            perfectGame: { name: 'Flawless Victory', description: 'Win a match without losing a round', icon: 'fas fa-gem' }
        };
    }
    
    checkAchievements() {
        const stats = this.game.stats;
        const newAchievements = [];
        
        // Check each achievement
        if (stats.wins >= 1 && !this.achievements.firstWin) {
            this.achievements.firstWin = true;
            newAchievements.push('firstWin');
        }
        
        if (stats.currentStreak >= 5 && !this.achievements.winStreak5) {
            this.achievements.winStreak5 = true;
            newAchievements.push('winStreak5');
        }
        
        if (stats.currentStreak >= 10 && !this.achievements.winStreak10) {
            this.achievements.winStreak10 = true;
            newAchievements.push('winStreak10');
        }
        
        if (stats.gamesPlayed >= 50 && !this.achievements.games50) {
            this.achievements.games50 = true;
            newAchievements.push('games50');
        }
        
        if (stats.gamesPlayed >= 100 && !this.achievements.games100) {
            this.achievements.games100 = true;
            newAchievements.push('games100');
        }
        
        // Save achievements
        if (newAchievements.length > 0) {
            localStorage.setItem('rpsAchievements', JSON.stringify(this.achievements));
            this.showAchievementNotifications(newAchievements);
        }
    }
    
    showAchievementNotifications(achievements) {
        achievements.forEach((achievementId, index) => {
            setTimeout(() => {
                this.showAchievementPopup(achievementId);
            }, index * 1000);
        });
    }
    
    showAchievementPopup(achievementId) {
        const achievement = this.achievementDefinitions[achievementId];
        if (!achievement) return;
        
        // Create popup element
        const popup = document.createElement('div');
        popup.className = 'achievement-popup';
        popup.innerHTML = `
            <div class="achievement-content">
                <i class="${achievement.icon}"></i>
                <div class="achievement-text">
                    <h4>Achievement Unlocked!</h4>
                    <h3>${achievement.name}</h3>
                    <p>${achievement.description}</p>
                </div>
            </div>
        `;
        
        // Add styles
        popup.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(135deg, #667eea, #764ba2);
            color: white;
            padding: 20px;
            border-radius: 12px;
            box-shadow: 0 10px 25px rgba(0,0,0,0.3);
            z-index: 10000;
            transform: translateX(400px);
            transition: transform 0.3s ease-out;
            max-width: 300px;
        `;
        
        document.body.appendChild(popup);
        
        // Animate in
        setTimeout(() => {
            popup.style.transform = 'translateX(0)';
        }, 100);
        
        // Animate out and remove
        setTimeout(() => {
            popup.style.transform = 'translateX(400px)';
            setTimeout(() => {
                document.body.removeChild(popup);
            }, 300);
        }, 4000);
    }
}

// Initialize game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const game = new RockPaperScissorsGame();
    const statistics = new RPSStatistics(game);
    const achievements = new RPSAchievements(game);
    
    // Override updateGameStats to check achievements
    const originalUpdateGameStats = game.updateGameStats.bind(game);
    game.updateGameStats = function(result) {
        originalUpdateGameStats(result);
        achievements.checkAchievements();
    };
    
    // Add detailed statistics button (bonus feature)
    const detailedStatsBtn = document.createElement('button');
    detailedStatsBtn.className = 'btn btn-secondary';
    detailedStatsBtn.innerHTML = '<i class="fas fa-chart-line"></i> Detailed Stats';
    detailedStatsBtn.addEventListener('click', () => {
        const stats = statistics.getDetailedStats();
        alert(`Detailed Statistics:
Games Played: ${stats.gamesPlayed}
Wins: ${stats.wins} (${stats.winRate}%)
Losses: ${stats.losses} (${stats.lossRate}%)
Draws: ${stats.draws} (${stats.drawRate}%)
Current Streak: ${stats.currentStreak}
Best Streak: ${stats.bestStreak}
Total Rounds: ${stats.totalGames}`);
    });
    
    document.querySelector('.game-controls').appendChild(detailedStatsBtn);
    
    console.log('🪨 Rock Paper Scissors game initialized!');
    console.log('💡 Use R (Rock), P (Paper), S (Scissors) keys to play');
}); 