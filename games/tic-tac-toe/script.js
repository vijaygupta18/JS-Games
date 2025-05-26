// Game state
class TicTacToeGame {
    constructor() {
        this.board = Array(9).fill('');
        this.currentPlayer = 'X';
        this.gameActive = true;
        this.scores = {
            X: parseInt(localStorage.getItem('ticTacToeScoreX')) || 0,
            O: parseInt(localStorage.getItem('ticTacToeScoreO')) || 0
        };
        
        // Winning combinations
        this.winningCombinations = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
            [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
            [0, 4, 8], [2, 4, 6] // Diagonals
        ];
        
        this.init();
    }
    
    init() {
        this.bindEvents();
        this.updateScoreDisplay();
        this.updateCurrentPlayerDisplay();
        this.updateGameStatus('Make your move!');
    }
    
    bindEvents() {
        // Cell clicks
        document.querySelectorAll('.cell').forEach(cell => {
            cell.addEventListener('click', (e) => this.handleCellClick(e));
        });
        
        // Control buttons
        document.getElementById('restartBtn').addEventListener('click', () => this.restartGame());
        document.getElementById('resetScoreBtn').addEventListener('click', () => this.resetScore());
        document.getElementById('playAgainBtn').addEventListener('click', () => this.playAgain());
        
        // Keyboard support
        document.addEventListener('keydown', (e) => this.handleKeyPress(e));
    }
    
    handleCellClick(e) {
        const cell = e.target;
        const index = parseInt(cell.dataset.index);
        
        if (!this.gameActive || this.board[index] !== '') {
            return;
        }
        
        this.makeMove(index, cell);
    }
    
    handleKeyPress(e) {
        if (!this.gameActive) return;
        
        const key = e.key;
        if (key >= '1' && key <= '9') {
            const index = parseInt(key) - 1;
            const cell = document.querySelector(`[data-index="${index}"]`);
            
            if (this.board[index] === '') {
                this.makeMove(index, cell);
            }
        }
        
        if (key === 'r' || key === 'R') {
            this.restartGame();
        }
    }
    
    makeMove(index, cell) {
        // Update board state
        this.board[index] = this.currentPlayer;
        
        // Update cell display
        cell.textContent = this.currentPlayer;
        cell.classList.add(this.currentPlayer.toLowerCase());
        cell.classList.add('disabled');
        
        // Play sound effect
        this.playSound('move');
        
        // Check for win or draw
        const result = this.checkGameResult();
        
        if (result.gameOver) {
            this.endGame(result);
        } else {
            this.switchPlayer();
        }
    }
    
    checkGameResult() {
        // Check for win
        for (let combination of this.winningCombinations) {
            const [a, b, c] = combination;
            if (this.board[a] && this.board[a] === this.board[b] && this.board[a] === this.board[c]) {
                return {
                    gameOver: true,
                    winner: this.board[a],
                    winningCombination: combination
                };
            }
        }
        
        // Check for draw
        if (this.board.every(cell => cell !== '')) {
            return {
                gameOver: true,
                winner: null,
                winningCombination: null
            };
        }
        
        return { gameOver: false };
    }
    
    endGame(result) {
        this.gameActive = false;
        
        if (result.winner) {
            // Highlight winning cells
            this.highlightWinningCells(result.winningCombination);
            
            // Update score
            this.scores[result.winner]++;
            this.saveScores();
            this.updateScoreDisplay();
            
            // Show result
            this.showGameResult(result.winner, `Player ${result.winner} wins!`, 'win');
            this.updateGameStatus(`🎉 Player ${result.winner} wins!`);
            
            this.playSound('win');
        } else {
            // Draw
            this.showGameResult(null, "It's a draw!", 'draw');
            this.updateGameStatus("🤝 It's a draw!");
            
            this.playSound('draw');
        }
        
        // Disable all cells
        document.querySelectorAll('.cell').forEach(cell => {
            cell.classList.add('disabled');
        });
    }
    
    highlightWinningCells(combination) {
        combination.forEach(index => {
            const cell = document.querySelector(`[data-index="${index}"]`);
            cell.classList.add('winning');
        });
    }
    
    switchPlayer() {
        this.currentPlayer = this.currentPlayer === 'X' ? 'O' : 'X';
        this.updateCurrentPlayerDisplay();
        this.updateGameStatus(`Player ${this.currentPlayer}'s turn`);
    }
    
    restartGame() {
        this.board = Array(9).fill('');
        this.currentPlayer = 'X';
        this.gameActive = true;
        
        // Reset board display
        document.querySelectorAll('.cell').forEach(cell => {
            cell.textContent = '';
            cell.className = 'cell';
        });
        
        // Hide overlay
        document.getElementById('gameOverlay').style.display = 'none';
        
        this.updateCurrentPlayerDisplay();
        this.updateGameStatus('Make your move!');
        
        this.playSound('restart');
    }
    
    playAgain() {
        this.restartGame();
    }
    
    resetScore() {
        this.scores = { X: 0, O: 0 };
        this.saveScores();
        this.updateScoreDisplay();
        this.playSound('reset');
    }
    
    updateScoreDisplay() {
        document.getElementById('playerXScore').textContent = this.scores.X;
        document.getElementById('playerOScore').textContent = this.scores.O;
    }
    
    updateCurrentPlayerDisplay() {
        document.getElementById('currentPlayerDisplay').textContent = `Player ${this.currentPlayer}'s Turn`;
    }
    
    updateGameStatus(message) {
        document.getElementById('gameStatus').textContent = message;
    }
    
    showGameResult(winner, message, type) {
        const overlay = document.getElementById('gameOverlay');
        const resultIcon = document.getElementById('resultIcon');
        const resultText = document.getElementById('resultText');
        const resultMessage = document.getElementById('resultMessage');
        
        // Set icon based on result
        if (type === 'win') {
            resultIcon.innerHTML = '<i class="fas fa-trophy"></i>';
            resultIcon.className = 'result-icon win';
        } else {
            resultIcon.innerHTML = '<i class="fas fa-handshake"></i>';
            resultIcon.className = 'result-icon draw';
        }
        
        resultText.textContent = message;
        
        if (winner) {
            resultMessage.textContent = `Congratulations! Player ${winner} takes the victory!`;
        } else {
            resultMessage.textContent = 'Great game! Both players played well.';
        }
        
        overlay.style.display = 'flex';
    }
    
    saveScores() {
        localStorage.setItem('ticTacToeScoreX', this.scores.X);
        localStorage.setItem('ticTacToeScoreO', this.scores.O);
    }
    
    playSound(type) {
        // Create audio context for sound effects
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            let frequency, duration;
            
            switch (type) {
                case 'move':
                    frequency = 800;
                    duration = 0.1;
                    break;
                case 'win':
                    frequency = 1000;
                    duration = 0.3;
                    break;
                case 'draw':
                    frequency = 600;
                    duration = 0.2;
                    break;
                case 'restart':
                    frequency = 400;
                    duration = 0.1;
                    break;
                case 'reset':
                    frequency = 300;
                    duration = 0.15;
                    break;
                default:
                    return;
            }
            
            oscillator.frequency.value = frequency;
            oscillator.type = 'sine';
            
            gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + duration);
        } catch (error) {
            // Silently fail if audio context is not supported
            console.log('Audio not supported');
        }
    }
}

// AI Player (bonus feature)
class AIPlayer {
    constructor(game, difficulty = 'medium') {
        this.game = game;
        this.difficulty = difficulty;
        this.symbol = 'O';
        this.opponentSymbol = 'X';
    }
    
    makeMove() {
        if (!this.game.gameActive || this.game.currentPlayer !== this.symbol) {
            return;
        }
        
        let moveIndex;
        
        switch (this.difficulty) {
            case 'easy':
                moveIndex = this.getRandomMove();
                break;
            case 'medium':
                moveIndex = this.getMediumMove();
                break;
            case 'hard':
                moveIndex = this.getBestMove();
                break;
            default:
                moveIndex = this.getRandomMove();
        }
        
        if (moveIndex !== -1) {
            setTimeout(() => {
                const cell = document.querySelector(`[data-index="${moveIndex}"]`);
                this.game.makeMove(moveIndex, cell);
            }, 500); // Add delay for better UX
        }
    }
    
    getRandomMove() {
        const availableMoves = this.getAvailableMoves();
        if (availableMoves.length === 0) return -1;
        
        return availableMoves[Math.floor(Math.random() * availableMoves.length)];
    }
    
    getMediumMove() {
        // Try to win first
        let move = this.findWinningMove(this.symbol);
        if (move !== -1) return move;
        
        // Block opponent's winning move
        move = this.findWinningMove(this.opponentSymbol);
        if (move !== -1) return move;
        
        // Take center if available
        if (this.game.board[4] === '') return 4;
        
        // Take corners
        const corners = [0, 2, 6, 8];
        const availableCorners = corners.filter(index => this.game.board[index] === '');
        if (availableCorners.length > 0) {
            return availableCorners[Math.floor(Math.random() * availableCorners.length)];
        }
        
        // Random move
        return this.getRandomMove();
    }
    
    getBestMove() {
        return this.minimax(this.game.board, this.symbol).index;
    }
    
    findWinningMove(symbol) {
        for (let combination of this.game.winningCombinations) {
            const [a, b, c] = combination;
            const line = [this.game.board[a], this.game.board[b], this.game.board[c]];
            
            if (line.filter(cell => cell === symbol).length === 2 && line.includes('')) {
                return combination[line.indexOf('')];
            }
        }
        return -1;
    }
    
    getAvailableMoves() {
        return this.game.board.map((cell, index) => cell === '' ? index : null).filter(val => val !== null);
    }
    
    minimax(board, player) {
        const availableMoves = board.map((cell, index) => cell === '' ? index : null).filter(val => val !== null);
        
        // Check for terminal states
        const result = this.checkWinner(board);
        if (result === this.symbol) return { score: 10 };
        if (result === this.opponentSymbol) return { score: -10 };
        if (availableMoves.length === 0) return { score: 0 };
        
        const moves = [];
        
        for (let move of availableMoves) {
            const newBoard = [...board];
            newBoard[move] = player;
            
            const result = player === this.symbol 
                ? this.minimax(newBoard, this.opponentSymbol)
                : this.minimax(newBoard, this.symbol);
            
            moves.push({
                index: move,
                score: result.score
            });
        }
        
        // Choose best move
        if (player === this.symbol) {
            return moves.reduce((best, move) => move.score > best.score ? move : best);
        } else {
            return moves.reduce((best, move) => move.score < best.score ? move : best);
        }
    }
    
    checkWinner(board) {
        for (let combination of this.game.winningCombinations) {
            const [a, b, c] = combination;
            if (board[a] && board[a] === board[b] && board[a] === board[c]) {
                return board[a];
            }
        }
        return null;
    }
}

// Game statistics
class GameStatistics {
    constructor() {
        this.stats = JSON.parse(localStorage.getItem('ticTacToeStats')) || {
            gamesPlayed: 0,
            wins: { X: 0, O: 0 },
            draws: 0,
            totalMoves: 0,
            averageGameLength: 0
        };
    }
    
    recordGame(winner, moveCount) {
        this.stats.gamesPlayed++;
        this.stats.totalMoves += moveCount;
        
        if (winner) {
            this.stats.wins[winner]++;
        } else {
            this.stats.draws++;
        }
        
        this.stats.averageGameLength = this.stats.totalMoves / this.stats.gamesPlayed;
        this.save();
    }
    
    save() {
        localStorage.setItem('ticTacToeStats', JSON.stringify(this.stats));
    }
    
    getStats() {
        return this.stats;
    }
    
    reset() {
        this.stats = {
            gamesPlayed: 0,
            wins: { X: 0, O: 0 },
            draws: 0,
            totalMoves: 0,
            averageGameLength: 0
        };
        this.save();
    }
}

// Initialize game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const game = new TicTacToeGame();
    const stats = new GameStatistics();
    
    // Optional: Add AI mode toggle
    let aiMode = false;
    let aiPlayer = null;
    
    // Add AI toggle button (bonus feature)
    const aiToggleBtn = document.createElement('button');
    aiToggleBtn.className = 'btn btn-secondary';
    aiToggleBtn.innerHTML = '<i class="fas fa-robot"></i> Play vs AI';
    aiToggleBtn.addEventListener('click', () => {
        aiMode = !aiMode;
        if (aiMode) {
            aiPlayer = new AIPlayer(game, 'medium');
            aiToggleBtn.innerHTML = '<i class="fas fa-user-friends"></i> Play vs Human';
            aiToggleBtn.classList.remove('btn-secondary');
            aiToggleBtn.classList.add('btn-primary');
        } else {
            aiPlayer = null;
            aiToggleBtn.innerHTML = '<i class="fas fa-robot"></i> Play vs AI';
            aiToggleBtn.classList.remove('btn-primary');
            aiToggleBtn.classList.add('btn-secondary');
        }
        game.restartGame();
    });
    
    document.querySelector('.game-controls').appendChild(aiToggleBtn);
    
    // Override the original makeMove to handle AI
    const originalMakeMove = game.makeMove.bind(game);
    game.makeMove = function(index, cell) {
        originalMakeMove(index, cell);
        
        // If AI mode is enabled and it's AI's turn
        if (aiMode && aiPlayer && this.gameActive && this.currentPlayer === 'O') {
            aiPlayer.makeMove();
        }
    };
    
    console.log('🎮 Tic Tac Toe game initialized!');
    console.log('💡 Use number keys 1-9 to make moves, R to restart');
}); 