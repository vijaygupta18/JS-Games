// Minesweeper Game Class
class MinesweeperGame {
    constructor() {
        this.grid = [];
        this.gameActive = false;
        this.gameStarted = false;
        this.gameWon = false;
        this.gameOver = false;
        this.firstClick = true;
        
        // Game settings
        this.difficulties = {
            beginner: { width: 9, height: 9, mines: 10 },
            intermediate: { width: 16, height: 16, mines: 40 },
            expert: { width: 30, height: 16, mines: 99 },
            custom: { width: 16, height: 16, mines: 40 }
        };
        
        this.currentDifficulty = 'intermediate';
        this.width = 16;
        this.height = 16;
        this.totalMines = 40;
        this.flagCount = 0;
        this.revealedCount = 0;
        this.time = 0;
        this.timer = null;
        
        // Statistics
        this.stats = JSON.parse(localStorage.getItem('minesweeperStats')) || {
            gamesWon: 0,
            gamesPlayed: 0,
            bestTimes: {
                beginner: null,
                intermediate: null,
                expert: null
            }
        };
        
        this.init();
    }
    
    init() {
        this.bindEvents();
        this.updateStatsDisplay();
        this.createGrid();
        this.updateDisplay();
    }
    
    bindEvents() {
        // Button events
        document.getElementById('startBtn').addEventListener('click', () => this.newGame());
        document.getElementById('newGameBtn').addEventListener('click', () => this.newGame());
        document.getElementById('hintBtn').addEventListener('click', () => this.showHint());
        document.getElementById('autoSolveBtn').addEventListener('click', () => this.autoSolve());
        
        // Difficulty selector
        document.getElementById('difficultySelect').addEventListener('change', (e) => {
            this.currentDifficulty = e.target.value;
            this.updateDifficultySettings();
        });
        
        // Custom settings
        document.getElementById('customWidth').addEventListener('change', () => this.updateCustomSettings());
        document.getElementById('customHeight').addEventListener('change', () => this.updateCustomSettings());
        document.getElementById('customMines').addEventListener('change', () => this.updateCustomSettings());
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => this.handleKeyPress(e));
        
        // Prevent context menu on game grid
        document.getElementById('gameGrid').addEventListener('contextmenu', (e) => e.preventDefault());
    }
    
    handleKeyPress(e) {
        if (e.key.toLowerCase() === 'n') {
            this.newGame();
        }
        if (e.key.toLowerCase() === 'h' && this.gameActive) {
            this.showHint();
        }
    }
    
    updateDifficultySettings() {
        const customSettings = document.getElementById('customSettings');
        
        if (this.currentDifficulty === 'custom') {
            customSettings.style.display = 'flex';
            this.updateCustomSettings();
        } else {
            customSettings.style.display = 'none';
            const settings = this.difficulties[this.currentDifficulty];
            this.width = settings.width;
            this.height = settings.height;
            this.totalMines = settings.mines;
        }
        
        this.createGrid();
        this.updateDisplay();
    }
    
    updateCustomSettings() {
        const width = parseInt(document.getElementById('customWidth').value);
        const height = parseInt(document.getElementById('customHeight').value);
        const mines = parseInt(document.getElementById('customMines').value);
        
        this.width = Math.max(5, Math.min(30, width));
        this.height = Math.max(5, Math.min(24, height));
        this.totalMines = Math.max(1, Math.min(Math.floor(this.width * this.height * 0.8), mines));
        
        // Update input values to clamped values
        document.getElementById('customWidth').value = this.width;
        document.getElementById('customHeight').value = this.height;
        document.getElementById('customMines').value = this.totalMines;
        
        this.createGrid();
        this.updateDisplay();
    }
    
    createGrid() {
        this.grid = [];
        this.gameActive = false;
        this.gameStarted = false;
        this.gameWon = false;
        this.gameOver = false;
        this.firstClick = true;
        this.flagCount = 0;
        this.revealedCount = 0;
        this.time = 0;
        
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
        
        // Initialize grid
        for (let row = 0; row < this.height; row++) {
            this.grid[row] = [];
            for (let col = 0; col < this.width; col++) {
                this.grid[row][col] = {
                    isMine: false,
                    isRevealed: false,
                    isFlagged: false,
                    neighborCount: 0,
                    row: row,
                    col: col
                };
            }
        }
        
        this.renderGrid();
        this.hideOverlay();
    }
    
    renderGrid() {
        const gridElement = document.getElementById('gameGrid');
        gridElement.innerHTML = '';
        gridElement.className = `game-grid ${this.currentDifficulty}`;
        
        if (this.currentDifficulty === 'custom') {
            gridElement.style.gridTemplateColumns = `repeat(${this.width}, 1fr)`;
        }
        
        for (let row = 0; row < this.height; row++) {
            for (let col = 0; col < this.width; col++) {
                const cell = document.createElement('div');
                cell.className = 'mine-cell';
                cell.dataset.row = row;
                cell.dataset.col = col;
                
                cell.addEventListener('click', (e) => this.handleCellClick(e, row, col));
                cell.addEventListener('contextmenu', (e) => this.handleRightClick(e, row, col));
                
                gridElement.appendChild(cell);
            }
        }
    }
    
    placeMines(excludeRow, excludeCol) {
        let minesPlaced = 0;
        
        while (minesPlaced < this.totalMines) {
            const row = Math.floor(Math.random() * this.height);
            const col = Math.floor(Math.random() * this.width);
            
            // Don't place mine on first click or if already has mine
            if ((row === excludeRow && col === excludeCol) || this.grid[row][col].isMine) {
                continue;
            }
            
            this.grid[row][col].isMine = true;
            minesPlaced++;
        }
        
        this.calculateNeighborCounts();
    }
    
    calculateNeighborCounts() {
        for (let row = 0; row < this.height; row++) {
            for (let col = 0; col < this.width; col++) {
                if (!this.grid[row][col].isMine) {
                    this.grid[row][col].neighborCount = this.countNeighborMines(row, col);
                }
            }
        }
    }
    
    countNeighborMines(row, col) {
        let count = 0;
        
        for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
                if (dr === 0 && dc === 0) continue;
                
                const newRow = row + dr;
                const newCol = col + dc;
                
                if (this.isValidCell(newRow, newCol) && this.grid[newRow][newCol].isMine) {
                    count++;
                }
            }
        }
        
        return count;
    }
    
    isValidCell(row, col) {
        return row >= 0 && row < this.height && col >= 0 && col < this.width;
    }
    
    handleCellClick(e, row, col) {
        e.preventDefault();
        
        if (!this.gameActive && !this.gameStarted) {
            this.startGame(row, col);
        }
        
        if (!this.gameActive || this.grid[row][col].isRevealed || this.grid[row][col].isFlagged) {
            return;
        }
        
        this.revealCell(row, col);
    }
    
    handleRightClick(e, row, col) {
        e.preventDefault();
        
        if (!this.gameActive || this.grid[row][col].isRevealed) {
            return;
        }
        
        this.toggleFlag(row, col);
    }
    
    startGame(firstRow, firstCol) {
        this.gameActive = true;
        this.gameStarted = true;
        this.firstClick = false;
        
        this.placeMines(firstRow, firstCol);
        this.startTimer();
        this.playSound('start');
    }
    
    startTimer() {
        this.timer = setInterval(() => {
            this.time++;
            this.updateDisplay();
        }, 1000);
    }
    
    revealCell(row, col) {
        const cell = this.grid[row][col];
        
        if (cell.isRevealed || cell.isFlagged) return;
        
        cell.isRevealed = true;
        this.revealedCount++;
        
        const cellElement = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
        cellElement.classList.add('revealed');
        
        if (cell.isMine) {
            this.explodeMine(row, col);
            this.gameOver = true;
            this.endGame(false);
        } else {
            if (cell.neighborCount > 0) {
                cellElement.textContent = cell.neighborCount;
                cellElement.dataset.count = cell.neighborCount;
            }
            
            // Auto-reveal empty neighbors (flood fill)
            if (cell.neighborCount === 0) {
                this.revealNeighbors(row, col);
            }
            
            this.playSound('reveal');
            this.checkWinCondition();
        }
        
        this.updateDisplay();
    }
    
    revealNeighbors(row, col) {
        for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
                if (dr === 0 && dc === 0) continue;
                
                const newRow = row + dr;
                const newCol = col + dc;
                
                if (this.isValidCell(newRow, newCol)) {
                    this.revealCell(newRow, newCol);
                }
            }
        }
    }
    
    toggleFlag(row, col) {
        const cell = this.grid[row][col];
        const cellElement = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
        
        if (cell.isFlagged) {
            cell.isFlagged = false;
            cellElement.classList.remove('flagged');
            cellElement.textContent = '';
            this.flagCount--;
            this.playSound('unflag');
        } else {
            cell.isFlagged = true;
            cellElement.classList.add('flagged');
            cellElement.textContent = '🚩';
            this.flagCount++;
            this.playSound('flag');
        }
        
        this.updateDisplay();
        this.checkWinCondition();
    }
    
    explodeMine(row, col) {
        const cellElement = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
        cellElement.classList.add('mine', 'exploded');
        cellElement.textContent = '💣';
        
        // Reveal all mines
        setTimeout(() => {
            for (let r = 0; r < this.height; r++) {
                for (let c = 0; c < this.width; c++) {
                    const cell = this.grid[r][c];
                    const element = document.querySelector(`[data-row="${r}"][data-col="${c}"]`);
                    
                    if (cell.isMine && !cell.isRevealed) {
                        element.classList.add('mine');
                        element.textContent = '💣';
                    } else if (cell.isFlagged && !cell.isMine) {
                        element.classList.add('wrong-flag');
                        element.textContent = '❌';
                    }
                }
            }
        }, 500);
        
        this.playSound('explode');
    }
    
    checkWinCondition() {
        const totalCells = this.width * this.height;
        const nonMineCells = totalCells - this.totalMines;
        
        if (this.revealedCount === nonMineCells) {
            this.gameWon = true;
            this.endGame(true);
        }
    }
    
    endGame(won) {
        this.gameActive = false;
        
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
        
        // Update statistics
        this.stats.gamesPlayed++;
        
        if (won) {
            this.stats.gamesWon++;
            
            // Update best time
            if (this.currentDifficulty !== 'custom') {
                const currentBest = this.stats.bestTimes[this.currentDifficulty];
                if (!currentBest || this.time < currentBest) {
                    this.stats.bestTimes[this.currentDifficulty] = this.time;
                }
            }
            
            // Auto-flag remaining mines
            this.autoFlagMines();
            
            this.showOverlay('You Win!', `Completed in ${this.time} seconds!`);
            this.playSound('win');
        } else {
            this.showOverlay('Game Over!', 'You hit a mine! Try again.');
            this.playSound('lose');
        }
        
        localStorage.setItem('minesweeperStats', JSON.stringify(this.stats));
        this.updateStatsDisplay();
    }
    
    autoFlagMines() {
        for (let row = 0; row < this.height; row++) {
            for (let col = 0; col < this.width; col++) {
                const cell = this.grid[row][col];
                if (cell.isMine && !cell.isFlagged) {
                    this.toggleFlag(row, col);
                }
            }
        }
    }
    
    newGame() {
        this.createGrid();
        this.updateDisplay();
        this.playSound('newGame');
    }
    
    showHint() {
        if (!this.gameActive) return;
        
        // Find a safe cell to reveal
        const safeCells = [];
        
        for (let row = 0; row < this.height; row++) {
            for (let col = 0; col < this.width; col++) {
                const cell = this.grid[row][col];
                if (!cell.isRevealed && !cell.isFlagged && !cell.isMine) {
                    safeCells.push({ row, col });
                }
            }
        }
        
        if (safeCells.length > 0) {
            const randomSafe = safeCells[Math.floor(Math.random() * safeCells.length)];
            const cellElement = document.querySelector(`[data-row="${randomSafe.row}"][data-col="${randomSafe.col}"]`);
            
            cellElement.classList.add('hint');
            setTimeout(() => cellElement.classList.remove('hint'), 3000);
            
            this.playSound('hint');
        }
    }
    
    autoSolve() {
        if (!this.gameActive) return;
        
        let progress = true;
        
        while (progress && this.gameActive && !this.gameWon) {
            progress = false;
            
            // Look for cells where we can deduce safe moves
            for (let row = 0; row < this.height; row++) {
                for (let col = 0; col < this.width; col++) {
                    const cell = this.grid[row][col];
                    
                    if (cell.isRevealed && cell.neighborCount > 0) {
                        const neighbors = this.getNeighbors(row, col);
                        const flaggedNeighbors = neighbors.filter(n => n.isFlagged).length;
                        const unrevealedNeighbors = neighbors.filter(n => !n.isRevealed && !n.isFlagged);
                        
                        // If all mines are flagged, reveal remaining neighbors
                        if (flaggedNeighbors === cell.neighborCount && unrevealedNeighbors.length > 0) {
                            unrevealedNeighbors.forEach(n => {
                                this.revealCell(n.row, n.col);
                                progress = true;
                            });
                        }
                        
                        // If remaining unrevealed neighbors equal remaining mines, flag them
                        if (unrevealedNeighbors.length === cell.neighborCount - flaggedNeighbors && unrevealedNeighbors.length > 0) {
                            unrevealedNeighbors.forEach(n => {
                                if (!n.isFlagged) {
                                    this.toggleFlag(n.row, n.col);
                                    progress = true;
                                }
                            });
                        }
                    }
                }
            }
        }
        
        this.playSound('autoSolve');
    }
    
    getNeighbors(row, col) {
        const neighbors = [];
        
        for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
                if (dr === 0 && dc === 0) continue;
                
                const newRow = row + dr;
                const newCol = col + dc;
                
                if (this.isValidCell(newRow, newCol)) {
                    neighbors.push(this.grid[newRow][newCol]);
                }
            }
        }
        
        return neighbors;
    }
    
    updateDisplay() {
        document.getElementById('minesDisplay').textContent = this.totalMines;
        document.getElementById('flagsDisplay').textContent = this.flagCount;
        document.getElementById('timeDisplay').textContent = this.time.toString().padStart(3, '0');
        document.getElementById('cellsDisplay').textContent = this.revealedCount;
    }
    
    updateStatsDisplay() {
        const winRate = this.stats.gamesPlayed > 0 ? 
            Math.round((this.stats.gamesWon / this.stats.gamesPlayed) * 100) : 0;
        
        document.getElementById('gamesWon').textContent = this.stats.gamesWon;
        document.getElementById('gamesPlayed').textContent = this.stats.gamesPlayed;
        document.getElementById('winRate').textContent = `${winRate}%`;
        
        // Show best time for current difficulty
        const bestTime = this.stats.bestTimes[this.currentDifficulty];
        document.getElementById('bestTime').textContent = bestTime ? `${bestTime}s` : '---';
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
                case 'reveal': frequency = 600; duration = 0.1; break;
                case 'flag': frequency = 800; duration = 0.1; waveType = 'square'; break;
                case 'unflag': frequency = 700; duration = 0.1; break;
                case 'explode': frequency = 200; duration = 0.5; waveType = 'sawtooth'; break;
                case 'win': frequency = 1000; duration = 0.5; waveType = 'square'; break;
                case 'lose': frequency = 300; duration = 0.5; waveType = 'sawtooth'; break;
                case 'hint': frequency = 900; duration = 0.2; break;
                case 'autoSolve': frequency = 1200; duration = 0.3; waveType = 'square'; break;
                case 'newGame': frequency = 500; duration = 0.2; break;
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
    const game = new MinesweeperGame();
    
    console.log('💣 Minesweeper game initialized!');
    console.log('💡 Left click to reveal, right click to flag, N for new game, H for hint');
}); 