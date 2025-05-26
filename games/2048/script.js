// 2048 Game Class
class Game2048 {
    constructor() {
        this.grid = [];
        this.score = 0;
        this.bestScore = parseInt(localStorage.getItem('2048BestScore')) || 0;
        this.moveCount = 0;
        this.gameWon = false;
        this.gameOver = false;
        this.previousState = null;
        
        this.stats = JSON.parse(localStorage.getItem('2048Stats')) || {
            gamesPlayed: 0,
            gamesWon: 0,
            highestTile: 2
        };
        
        this.init();
    }
    
    init() {
        this.initGrid();
        this.bindEvents();
        this.updateDisplay();
        this.updateStatsDisplay();
        this.newGame();
    }
    
    initGrid() {
        const gridElement = document.getElementById('gameGrid');
        gridElement.innerHTML = '';
        
        for (let i = 0; i < 16; i++) {
            const cell = document.createElement('div');
            cell.className = 'grid-cell';
            gridElement.appendChild(cell);
        }
        
        this.grid = Array(4).fill().map(() => Array(4).fill(0));
    }
    
    bindEvents() {
        document.getElementById('newGameBtn').addEventListener('click', () => this.newGame());
        document.getElementById('undoBtn').addEventListener('click', () => this.undo());
        document.getElementById('hintBtn').addEventListener('click', () => this.showHint());
        document.getElementById('tryAgainBtn').addEventListener('click', () => this.newGame());
        document.getElementById('continueBtn').addEventListener('click', () => this.hideOverlay());
        
        document.addEventListener('keydown', (e) => this.handleKeyPress(e));
        
        // Touch events for mobile
        let startX, startY;
        document.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
        });
        
        document.addEventListener('touchend', (e) => {
            if (!startX || !startY) return;
            
            const endX = e.changedTouches[0].clientX;
            const endY = e.changedTouches[0].clientY;
            
            const diffX = startX - endX;
            const diffY = startY - endY;
            
            if (Math.abs(diffX) > Math.abs(diffY)) {
                if (diffX > 30) this.move('left');
                else if (diffX < -30) this.move('right');
            } else {
                if (diffY > 30) this.move('up');
                else if (diffY < -30) this.move('down');
            }
            
            startX = startY = null;
        });
    }
    
    handleKeyPress(e) {
        if (this.gameOver) return;
        
        switch(e.key) {
            case 'ArrowUp': e.preventDefault(); this.move('up'); break;
            case 'ArrowDown': e.preventDefault(); this.move('down'); break;
            case 'ArrowLeft': e.preventDefault(); this.move('left'); break;
            case 'ArrowRight': e.preventDefault(); this.move('right'); break;
            case 'n': this.newGame(); break;
            case 'u': this.undo(); break;
            case 'h': this.showHint(); break;
        }
    }
    
    newGame() {
        this.saveState();
        this.grid = Array(4).fill().map(() => Array(4).fill(0));
        this.score = 0;
        this.moveCount = 0;
        this.gameWon = false;
        this.gameOver = false;
        this.previousState = null;
        
        this.addRandomTile();
        this.addRandomTile();
        this.updateDisplay();
        this.hideOverlay();
        this.updateButtons();
        
        this.playSound('start');
    }
    
    move(direction) {
        if (this.gameOver) return;
        
        this.saveState();
        let moved = false;
        let merged = false;
        
        const newGrid = this.grid.map(row => [...row]);
        
        switch(direction) {
            case 'left':
                for (let row = 0; row < 4; row++) {
                    const result = this.processLine(newGrid[row]);
                    newGrid[row] = result.line;
                    if (result.moved) moved = true;
                    if (result.merged) merged = true;
                }
                break;
            case 'right':
                for (let row = 0; row < 4; row++) {
                    const result = this.processLine(newGrid[row].slice().reverse());
                    newGrid[row] = result.line.reverse();
                    if (result.moved) moved = true;
                    if (result.merged) merged = true;
                }
                break;
            case 'up':
                for (let col = 0; col < 4; col++) {
                    const column = [newGrid[0][col], newGrid[1][col], newGrid[2][col], newGrid[3][col]];
                    const result = this.processLine(column);
                    for (let row = 0; row < 4; row++) {
                        newGrid[row][col] = result.line[row];
                    }
                    if (result.moved) moved = true;
                    if (result.merged) merged = true;
                }
                break;
            case 'down':
                for (let col = 0; col < 4; col++) {
                    const column = [newGrid[3][col], newGrid[2][col], newGrid[1][col], newGrid[0][col]];
                    const result = this.processLine(column);
                    for (let row = 0; row < 4; row++) {
                        newGrid[3-row][col] = result.line[row];
                    }
                    if (result.moved) moved = true;
                    if (result.merged) merged = true;
                }
                break;
        }
        
        if (moved) {
            this.grid = newGrid;
            this.moveCount++;
            this.addRandomTile();
            this.updateDisplay();
            this.updateButtons();
            
            if (merged) this.playSound('merge');
            else this.playSound('move');
            
            if (this.checkWin() && !this.gameWon) {
                this.gameWon = true;
                this.showWinOverlay();
                this.stats.gamesWon++;
            }
            
            if (this.checkGameOver()) {
                this.gameOver = true;
                this.showGameOverOverlay();
                this.stats.gamesPlayed++;
                localStorage.setItem('2048Stats', JSON.stringify(this.stats));
                this.updateStatsDisplay();
            }
        }
    }
    
    processLine(line) {
        let moved = false;
        let merged = false;
        
        // Remove zeros
        let newLine = line.filter(val => val !== 0);
        
        // Merge adjacent equal values
        for (let i = 0; i < newLine.length - 1; i++) {
            if (newLine[i] === newLine[i + 1]) {
                newLine[i] *= 2;
                this.score += newLine[i];
                newLine.splice(i + 1, 1);
                merged = true;
                
                if (newLine[i] > this.stats.highestTile) {
                    this.stats.highestTile = newLine[i];
                }
            }
        }
        
        // Add zeros to the end
        while (newLine.length < 4) {
            newLine.push(0);
        }
        
        // Check if line changed
        for (let i = 0; i < 4; i++) {
            if (line[i] !== newLine[i]) {
                moved = true;
                break;
            }
        }
        
        return { line: newLine, moved, merged };
    }
    
    addRandomTile() {
        const emptyCells = [];
        for (let row = 0; row < 4; row++) {
            for (let col = 0; col < 4; col++) {
                if (this.grid[row][col] === 0) {
                    emptyCells.push({ row, col });
                }
            }
        }
        
        if (emptyCells.length > 0) {
            const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
            this.grid[randomCell.row][randomCell.col] = Math.random() < 0.9 ? 2 : 4;
        }
    }
    
    checkWin() {
        for (let row = 0; row < 4; row++) {
            for (let col = 0; col < 4; col++) {
                if (this.grid[row][col] === 2048) {
                    return true;
                }
            }
        }
        return false;
    }
    
    checkGameOver() {
        // Check for empty cells
        for (let row = 0; row < 4; row++) {
            for (let col = 0; col < 4; col++) {
                if (this.grid[row][col] === 0) {
                    return false;
                }
            }
        }
        
        // Check for possible merges
        for (let row = 0; row < 4; row++) {
            for (let col = 0; col < 4; col++) {
                const current = this.grid[row][col];
                if ((col < 3 && current === this.grid[row][col + 1]) ||
                    (row < 3 && current === this.grid[row + 1][col])) {
                    return false;
                }
            }
        }
        
        return true;
    }
    
    saveState() {
        this.previousState = {
            grid: this.grid.map(row => [...row]),
            score: this.score,
            moveCount: this.moveCount
        };
    }
    
    undo() {
        if (this.previousState) {
            this.grid = this.previousState.grid;
            this.score = this.previousState.score;
            this.moveCount = this.previousState.moveCount;
            this.previousState = null;
            this.updateDisplay();
            this.updateButtons();
            this.playSound('undo');
        }
    }
    
    showHint() {
        // Simple hint: highlight tiles that can merge
        const hints = [];
        for (let row = 0; row < 4; row++) {
            for (let col = 0; col < 4; col++) {
                const current = this.grid[row][col];
                if (current > 0) {
                    if ((col < 3 && current === this.grid[row][col + 1]) ||
                        (row < 3 && current === this.grid[row + 1][col])) {
                        hints.push({ row, col });
                    }
                }
            }
        }
        
        if (hints.length > 0) {
            hints.forEach(hint => {
                const tile = document.querySelector(`[data-row="${hint.row}"][data-col="${hint.col}"]`);
                if (tile) {
                    tile.classList.add('hint');
                    setTimeout(() => tile.classList.remove('hint'), 2000);
                }
            });
            this.playSound('hint');
        }
    }
    
    updateDisplay() {
        const gridElement = document.getElementById('gameGrid');
        
        // Remove existing tiles
        gridElement.querySelectorAll('.tile').forEach(tile => tile.remove());
        
        // Add current tiles
        for (let row = 0; row < 4; row++) {
            for (let col = 0; col < 4; col++) {
                const value = this.grid[row][col];
                if (value > 0) {
                    const tile = document.createElement('div');
                    tile.className = 'tile';
                    tile.dataset.value = value;
                    tile.dataset.row = row;
                    tile.dataset.col = col;
                    tile.textContent = value;
                    tile.style.left = `${col * 25 + 2.5}%`;
                    tile.style.top = `${row * 25 + 2.5}%`;
                    gridElement.appendChild(tile);
                }
            }
        }
        
        document.getElementById('currentScore').textContent = this.score;
        document.getElementById('moveCount').textContent = this.moveCount;
        
        if (this.score > this.bestScore) {
            this.bestScore = this.score;
            localStorage.setItem('2048BestScore', this.bestScore);
        }
        document.getElementById('bestScore').textContent = this.bestScore;
    }
    
    updateStatsDisplay() {
        const winRate = this.stats.gamesPlayed > 0 ? 
            Math.round((this.stats.gamesWon / this.stats.gamesPlayed) * 100) : 0;
        
        document.getElementById('gamesPlayed').textContent = this.stats.gamesPlayed;
        document.getElementById('gamesWon').textContent = this.stats.gamesWon;
        document.getElementById('winRate').textContent = `${winRate}%`;
        document.getElementById('highestTile').textContent = this.stats.highestTile;
    }
    
    updateButtons() {
        document.getElementById('undoBtn').disabled = !this.previousState;
    }
    
    showWinOverlay() {
        document.getElementById('overlayTitle').textContent = 'You Win!';
        document.getElementById('overlayMessage').textContent = 'You reached 2048! Keep playing to reach higher scores.';
        document.getElementById('continueBtn').style.display = 'flex';
        document.getElementById('gameOverlay').style.display = 'flex';
        this.playSound('win');
    }
    
    showGameOverOverlay() {
        document.getElementById('overlayTitle').textContent = 'Game Over!';
        document.getElementById('overlayMessage').textContent = `Final Score: ${this.score}`;
        document.getElementById('continueBtn').style.display = 'none';
        document.getElementById('gameOverlay').style.display = 'flex';
        this.playSound('gameOver');
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
                case 'move': frequency = 600; duration = 0.1; break;
                case 'merge': frequency = 800; duration = 0.2; waveType = 'square'; break;
                case 'win': frequency = 1000; duration = 0.5; waveType = 'square'; break;
                case 'gameOver': frequency = 300; duration = 0.5; waveType = 'sawtooth'; break;
                case 'undo': frequency = 500; duration = 0.1; break;
                case 'hint': frequency = 700; duration = 0.2; break;
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

document.addEventListener('DOMContentLoaded', () => {
    new Game2048();
    console.log('🎯 2048 game initialized!');
    console.log('💡 Use arrow keys to move, N for new game, U to undo, H for hint');
}); 