// Game data configuration
const games = [
    {
        id: 'tic-tac-toe',
        title: 'Tic Tac Toe',
        description: 'Classic 3x3 grid game. Get three in a row to win!',
        icon: 'fas fa-hashtag',
        difficulty: 'easy',
        path: 'games/tic-tac-toe/index.html'
    },
    {
        id: 'snake',
        title: 'Snake Game',
        description: 'Control the snake to eat food and grow longer. Avoid hitting walls!',
        icon: 'fas fa-snake',
        difficulty: 'medium',
        path: 'games/snake/index.html'
    },
    {
        id: 'memory',
        title: 'Memory Game',
        description: 'Flip cards to find matching pairs. Test your memory skills!',
        icon: 'fas fa-brain',
        difficulty: 'medium',
        path: 'games/memory/index.html'
    },
    {
        id: 'flappy-bird',
        title: 'Flappy Bird',
        description: 'Navigate through pipes by tapping to keep the bird flying!',
        icon: 'fas fa-dove',
        difficulty: 'hard',
        path: 'games/flappy-bird/index.html'
    },
    {
        id: 'rock-paper-scissors',
        title: 'Rock Paper Scissors',
        description: 'Classic hand game against the computer. Best of luck!',
        icon: 'fas fa-hand-rock',
        difficulty: 'easy',
        path: 'games/rock-paper-scissors/index.html'
    },
    {
        id: '2048',
        title: '2048',
        description: 'Slide tiles to combine numbers and reach the 2048 tile!',
        icon: 'fas fa-th-large',
        difficulty: 'medium',
        path: 'games/2048/index.html'
    },
    {
        id: 'minesweeper',
        title: 'Minesweeper',
        description: 'Clear the field without hitting any mines. Use logic and luck!',
        icon: 'fas fa-bomb',
        difficulty: 'hard',
        path: 'games/minesweeper/index.html'
    },
    {
        id: 'breakout',
        title: 'Breakout',
        description: 'Break all the bricks with a bouncing ball and paddle!',
        icon: 'fas fa-square',
        difficulty: 'medium',
        path: 'games/breakout/index.html'
    },
    {
        id: 'typing-test',
        title: 'Typing Speed Test',
        description: 'Test your typing speed and accuracy with random words!',
        icon: 'fas fa-keyboard',
        difficulty: 'easy',
        path: 'games/typing-test/index.html'
    },
    {
        id: 'pong',
        title: 'Pong',
        description: 'Classic paddle game. First to score 10 points wins!',
        icon: 'fas fa-table-tennis',
        difficulty: 'medium',
        path: 'games/pong/index.html'
    },
    {
        id: 'whack-a-mole',
        title: 'Whack-a-Mole',
        description: 'Hit the moles as they pop up! Quick reflexes required!',
        icon: 'fas fa-hammer',
        difficulty: 'easy',
        path: 'games/whack-a-mole/index.html'
    },
    {
        id: 'platformer',
        title: 'Mini Platformer',
        description: 'Jump and run through obstacles in this mini adventure!',
        icon: 'fas fa-running',
        difficulty: 'hard',
        path: 'games/platformer/index.html'
    }
];

// DOM elements
const gamesGrid = document.getElementById('gamesGrid');
const themeToggle = document.getElementById('themeToggle');
const randomGameBtn = document.getElementById('randomGameBtn');
const loadingOverlay = document.getElementById('loadingOverlay');

// Theme management
class ThemeManager {
    constructor() {
        this.currentTheme = localStorage.getItem('theme') || 'light';
        this.init();
    }

    init() {
        this.applyTheme();
        this.updateToggleIcon();
        themeToggle.addEventListener('click', () => this.toggleTheme());
    }

    toggleTheme() {
        this.currentTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        this.applyTheme();
        this.updateToggleIcon();
        localStorage.setItem('theme', this.currentTheme);
    }

    applyTheme() {
        document.documentElement.setAttribute('data-theme', this.currentTheme);
    }

    updateToggleIcon() {
        const icon = themeToggle.querySelector('i');
        icon.className = this.currentTheme === 'light' ? 'fas fa-moon' : 'fas fa-sun';
    }
}

// Game card creation
function createGameCard(game) {
    const card = document.createElement('a');
    card.href = game.path;
    card.className = 'game-card';
    card.setAttribute('data-game-id', game.id);
    
    card.innerHTML = `
        <i class="${game.icon} game-icon"></i>
        <h3 class="game-title">${game.title}</h3>
        <p class="game-description">${game.description}</p>
        <span class="game-difficulty difficulty-${game.difficulty}">${game.difficulty}</span>
        <button class="play-button">
            <i class="fas fa-play"></i>
            Play Now
        </button>
    `;

    // Add click event for loading animation
    card.addEventListener('click', (e) => {
        e.preventDefault();
        showLoadingAndNavigate(game.path);
    });

    return card;
}

// Loading animation and navigation
function showLoadingAndNavigate(path) {
    loadingOverlay.style.display = 'flex';
    
    // Simulate loading time for better UX
    setTimeout(() => {
        window.location.href = path;
    }, 800);
}

// Random game selection
function selectRandomGame() {
    const randomIndex = Math.floor(Math.random() * games.length);
    const randomGame = games[randomIndex];
    showLoadingAndNavigate(randomGame.path);
}

// Render all games
function renderGames() {
    gamesGrid.innerHTML = '';
    
    games.forEach((game, index) => {
        const card = createGameCard(game);
        // Add staggered animation delay
        card.style.animationDelay = `${index * 0.1}s`;
        gamesGrid.appendChild(card);
    });
}

// Search functionality (bonus feature)
function initSearch() {
    const searchInput = document.createElement('input');
    searchInput.type = 'text';
    searchInput.placeholder = 'Search games...';
    searchInput.className = 'search-input';
    
    // Add search input to header
    const headerControls = document.querySelector('.header-controls');
    headerControls.insertBefore(searchInput, headerControls.firstChild);
    
    searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        filterGames(searchTerm);
    });
}

// Filter games based on search
function filterGames(searchTerm) {
    const filteredGames = games.filter(game => 
        game.title.toLowerCase().includes(searchTerm) ||
        game.description.toLowerCase().includes(searchTerm) ||
        game.difficulty.toLowerCase().includes(searchTerm)
    );
    
    gamesGrid.innerHTML = '';
    
    if (filteredGames.length === 0) {
        gamesGrid.innerHTML = `
            <div class="no-results">
                <i class="fas fa-search"></i>
                <h3>No games found</h3>
                <p>Try searching with different keywords</p>
            </div>
        `;
        return;
    }
    
    filteredGames.forEach((game, index) => {
        const card = createGameCard(game);
        card.style.animationDelay = `${index * 0.1}s`;
        gamesGrid.appendChild(card);
    });
}

// Statistics tracking
class GameStats {
    constructor() {
        this.stats = JSON.parse(localStorage.getItem('gameStats')) || {};
    }

    incrementPlayCount(gameId) {
        if (!this.stats[gameId]) {
            this.stats[gameId] = { playCount: 0, lastPlayed: null };
        }
        this.stats[gameId].playCount++;
        this.stats[gameId].lastPlayed = new Date().toISOString();
        this.save();
    }

    save() {
        localStorage.setItem('gameStats', JSON.stringify(this.stats));
    }

    getMostPlayed() {
        const entries = Object.entries(this.stats);
        if (entries.length === 0) return null;
        
        return entries.reduce((max, [gameId, stats]) => 
            stats.playCount > (max[1]?.playCount || 0) ? [gameId, stats] : max
        );
    }
}

// Sound effects (optional)
class SoundManager {
    constructor() {
        this.enabled = localStorage.getItem('soundEnabled') !== 'false';
        this.sounds = {
            click: this.createSound(800, 0.1),
            hover: this.createSound(600, 0.05)
        };
    }

    createSound(frequency, duration) {
        return () => {
            if (!this.enabled) return;
            
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.value = frequency;
            oscillator.type = 'sine';
            
            gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + duration);
        };
    }

    toggle() {
        this.enabled = !this.enabled;
        localStorage.setItem('soundEnabled', this.enabled);
    }
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Initialize core functionality
    const themeManager = new ThemeManager();
    const gameStats = new GameStats();
    const soundManager = new SoundManager();
    
    // Render games
    renderGames();
    
    // Add event listeners
    randomGameBtn.addEventListener('click', selectRandomGame);
    
    // Add sound effects to interactions
    document.addEventListener('click', (e) => {
        if (e.target.matches('.play-button, .random-game-btn, .theme-toggle')) {
            soundManager.sounds.click();
        }
    });
    
    document.addEventListener('mouseover', (e) => {
        if (e.target.matches('.game-card')) {
            soundManager.sounds.hover();
        }
    });
    
    // Track game plays
    document.addEventListener('click', (e) => {
        const gameCard = e.target.closest('.game-card');
        if (gameCard) {
            const gameId = gameCard.getAttribute('data-game-id');
            gameStats.incrementPlayCount(gameId);
        }
    });
    
    // Initialize search (bonus feature)
    // initSearch();
    
    // Add keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        if (e.key === 'r' && e.ctrlKey) {
            e.preventDefault();
            selectRandomGame();
        }
        if (e.key === 't' && e.ctrlKey) {
            e.preventDefault();
            themeManager.toggleTheme();
        }
    });
    
    // Add welcome animation
    setTimeout(() => {
        document.body.classList.add('loaded');
    }, 100);
    
    console.log('🎮 JS Games Hub initialized successfully!');
    console.log('💡 Keyboard shortcuts: Ctrl+R (Random Game), Ctrl+T (Toggle Theme)');
});

// Service Worker registration for PWA (bonus feature)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('SW registered: ', registration);
            })
            .catch(registrationError => {
                console.log('SW registration failed: ', registrationError);
            });
    });
} 