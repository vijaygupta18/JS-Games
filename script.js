// ================================================================
//  JS Games Hub — hub interactions
// ================================================================

// ----------------------------------------------------------------
//  Game data — titles, descriptions and difficulty preserved
// ----------------------------------------------------------------
const games = [
    {
        id: 'tic-tac-toe',
        title: 'Tic Tac Toe',
        description: 'Classic 3×3 grid game. Get three in a row to win against the computer or a friend.',
        difficulty: 'easy',
        path: 'games/tic-tac-toe/index.html',
        icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="8" y1="2" x2="8" y2="22"/><line x1="16" y1="2" x2="16" y2="22"/><line x1="2" y1="8" x2="22" y2="8"/><line x1="2" y1="16" x2="22" y2="16"/></svg>`
    },
    {
        id: 'snake',
        title: 'Snake',
        description: 'Steer the snake to eat food and grow. One wrong turn into a wall and it\'s over.',
        difficulty: 'medium',
        path: 'games/snake/index.html',
        icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19V7a4 4 0 0 1 8 0v9a3 3 0 0 0 6 0V9"/><circle cx="4" cy="19" r="1" fill="currentColor" stroke="none"/></svg>`
    },
    {
        id: 'memory',
        title: 'Memory Match',
        description: 'Flip cards to find matching pairs. All pairs cleared wins — test how sharp your recall is.',
        difficulty: 'medium',
        path: 'games/memory/index.html',
        icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="8" height="10" rx="1"/><rect x="14" y="4" width="8" height="10" rx="1"/><line x1="6" y1="18" x2="6" y2="20"/><line x1="18" y1="18" x2="18" y2="20"/><line x1="2" y1="20" x2="22" y2="20"/></svg>`
    },
    {
        id: 'flappy-bird',
        title: 'Flappy Bird',
        description: 'Tap to stay airborne and thread through pipes. Harder than it looks — much harder.',
        difficulty: 'hard',
        path: 'games/flappy-bird/index.html',
        icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 12c-2 2.5-4 3-6 2 2-1 3.5-3 3-6 2 1 4 3 3 4z"/><path d="M12 12c2-1 4-1 6 1-2 0-4 1-4 3-1-1.5-2-3-2-4z"/><circle cx="10" cy="9" r="1" fill="currentColor" stroke="none"/></svg>`
    },
    {
        id: 'rock-paper-scissors',
        title: 'Rock Paper Scissors',
        description: 'Best the computer at the oldest hand game. Three rounds, pure probability and pattern.',
        difficulty: 'easy',
        path: 'games/rock-paper-scissors/index.html',
        icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 11V7a2 2 0 0 1 4 0v4"/><path d="M11 7a2 2 0 0 1 4 0v4"/><path d="M15 9a2 2 0 0 1 4 0v7a6 6 0 0 1-6 6H9a6 6 0 0 1-6-6v-1a2 2 0 0 1 4 0"/></svg>`
    },
    {
        id: '2048',
        title: '2048',
        description: 'Slide and merge tiles until you reach 2048. Easier said than done — the board fills fast.',
        difficulty: 'medium',
        path: 'games/2048/index.html',
        icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="9" height="9" rx="1"/><rect x="13" y="2" width="9" height="9" rx="1"/><rect x="2" y="13" width="9" height="9" rx="1"/><rect x="13" y="13" width="9" height="9" rx="1"/></svg>`
    },
    {
        id: 'minesweeper',
        title: 'Minesweeper',
        description: 'Reveal the safe squares without detonating a mine. Logic and nerve in equal measure.',
        difficulty: 'hard',
        path: 'games/minesweeper/index.html',
        icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="2" x2="12" y2="4"/><line x1="12" y1="20" x2="12" y2="22"/><line x1="2" y1="12" x2="4" y2="12"/><line x1="20" y1="12" x2="22" y2="12"/><line x1="4.9" y1="4.9" x2="6.3" y2="6.3"/><line x1="17.7" y1="17.7" x2="19.1" y2="19.1"/><line x1="4.9" y1="19.1" x2="6.3" y2="17.7"/><line x1="17.7" y1="6.3" x2="19.1" y2="4.9"/></svg>`
    },
    {
        id: 'breakout',
        title: 'Breakout',
        description: 'Keep the ball in play and demolish the brick wall before you lose all your lives.',
        difficulty: 'medium',
        path: 'games/breakout/index.html',
        icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="4" rx="1"/><rect x="2" y="9" width="8" height="4" rx="1"/><rect x="12" y="9" width="10" height="4" rx="1"/><circle cx="11" cy="18" r="2" fill="currentColor" stroke="none"/><rect x="6" y="21" width="12" height="2" rx="1"/></svg>`
    },
    {
        id: 'typing-test',
        title: 'Typing Speed',
        description: 'Race the clock on a random passage and find out your WPM. Accuracy counts too.',
        difficulty: 'easy',
        path: 'games/typing-test/index.html',
        icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="6" y1="10" x2="6" y2="10" stroke-width="3" stroke-linecap="round"/><line x1="10" y1="10" x2="10" y2="10" stroke-width="3" stroke-linecap="round"/><line x1="14" y1="10" x2="14" y2="10" stroke-width="3" stroke-linecap="round"/><line x1="18" y1="10" x2="18" y2="10" stroke-width="3" stroke-linecap="round"/><line x1="8" y1="14" x2="16" y2="14" stroke-linecap="round"/></svg>`
    },
    {
        id: 'pong',
        title: 'Pong',
        description: 'The original two-player paddle game. First to 10 takes it — watch the ball speed up.',
        difficulty: 'medium',
        path: 'games/pong/index.html',
        icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="2" y="7" width="3" height="10" rx="1"/><rect x="19" y="7" width="3" height="10" rx="1"/><circle cx="12" cy="12" r="2" fill="currentColor" stroke="none"/><line x1="12" y1="2" x2="12" y2="4" stroke-dasharray="2 3"/><line x1="12" y1="20" x2="12" y2="22" stroke-dasharray="2 3"/></svg>`
    },
    {
        id: 'whack-a-mole',
        title: 'Whack-a-Mole',
        description: 'Moles pop up at random holes — hit them before they disappear. Your click speed will be judged.',
        difficulty: 'easy',
        path: 'games/whack-a-mole/index.html',
        icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 4a2 2 0 1 1-4 0 2 2 0 0 1 4 0z" fill="currentColor" stroke="none"/><path d="M9 10c0-1.7 1.3-3 3-3s3 1.3 3 3v3H9v-3z"/><ellipse cx="12" cy="18" rx="7" ry="3"/><line x1="18" y1="3" x2="20" y2="2"/><line x1="18" y1="5" x2="22" y2="5"/></svg>`
    },
    {
        id: 'platformer',
        title: 'Mini Platformer',
        description: 'Jump, run, and dodge your way through an obstacle course. Arrow keys or WASD to move.',
        difficulty: 'hard',
        path: 'games/platformer/index.html',
        icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="8" cy="6" r="2" fill="currentColor" stroke="none"/><path d="M6 10h4l1 4h-6z"/><path d="M9 14l2 4"/><path d="M7 14l-1 4"/><rect x="2" y="19" width="20" height="2" rx="1"/><rect x="12" y="13" width="8" height="2" rx="1"/></svg>`
    }
];

// ----------------------------------------------------------------
//  State
// ----------------------------------------------------------------
let activeFilter = 'all';
let searchTerm   = '';

// ----------------------------------------------------------------
//  DOM refs
// ----------------------------------------------------------------
const gamesGrid     = document.getElementById('gamesGrid');
const randomGameBtn = document.getElementById('randomGameBtn');
const loadingOverlay = document.getElementById('loadingOverlay');
const searchInput   = document.getElementById('searchInput');
const searchClear   = document.getElementById('searchClear');
const emptyState    = document.getElementById('emptyState');
const emptyReset    = document.getElementById('emptyReset');
const filterChips   = document.querySelectorAll('.filter-chip');
const gameCountPill = document.getElementById('gameCountPill');

// ----------------------------------------------------------------
//  Render
// ----------------------------------------------------------------
function filteredGames() {
    return games.filter(g => {
        const matchFilter = activeFilter === 'all' || g.difficulty === activeFilter;
        const matchSearch = !searchTerm
            || g.title.toLowerCase().includes(searchTerm)
            || g.description.toLowerCase().includes(searchTerm)
            || g.difficulty.toLowerCase().includes(searchTerm);
        return matchFilter && matchSearch;
    });
}

function createCard(game, delay) {
    const a = document.createElement('a');
    a.href = game.path;
    a.className = 'game-card';
    a.setAttribute('data-game-id', game.id);
    a.style.animationDelay = `${delay * 0.06}s`;

    a.innerHTML = `
        <div class="card-header">
            <div class="card-icon">${game.icon}</div>
            <span class="game-difficulty difficulty-${game.difficulty}">${game.difficulty}</span>
        </div>
        <h3 class="game-title">${game.title}</h3>
        <p class="game-description">${game.description}</p>
        <div class="play-btn">
            <svg viewBox="0 0 24 24" fill="currentColor" stroke="none" aria-hidden="true"><polygon points="5,3 19,12 5,21"/></svg>
            Play
        </div>
    `;

    a.addEventListener('click', e => {
        e.preventDefault();
        gameStats.incrementPlayCount(game.id);
        navigateWithLoader(game.path);
    });

    return a;
}

function renderGames() {
    const list = filteredGames();
    gamesGrid.innerHTML = '';

    if (list.length === 0) {
        emptyState.hidden = false;
        gameCountPill.textContent = '0 games';
        return;
    }
    emptyState.hidden = true;
    gameCountPill.textContent = `${list.length} game${list.length !== 1 ? 's' : ''}`;

    list.forEach((game, i) => {
        gamesGrid.appendChild(createCard(game, i));
    });
}

// ----------------------------------------------------------------
//  Navigation with loader
// ----------------------------------------------------------------
function navigateWithLoader(path) {
    loadingOverlay.setAttribute('aria-hidden', 'false');
    loadingOverlay.style.display = 'flex';
    setTimeout(() => { window.location.href = path; }, 700);
}

// ----------------------------------------------------------------
//  Random game
// ----------------------------------------------------------------
function pickRandomGame() {
    const pool = filteredGames();
    if (pool.length === 0) return;
    const g = pool[Math.floor(Math.random() * pool.length)];
    gameStats.incrementPlayCount(g.id);
    navigateWithLoader(g.path);
}

// ----------------------------------------------------------------
//  Filter chips
// ----------------------------------------------------------------
filterChips.forEach(chip => {
    chip.addEventListener('click', () => {
        activeFilter = chip.dataset.filter;
        filterChips.forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        renderGames();
    });
});

// ----------------------------------------------------------------
//  Search
// ----------------------------------------------------------------
searchInput.addEventListener('input', () => {
    searchTerm = searchInput.value.trim().toLowerCase();
    searchClear.hidden = searchTerm.length === 0;
    renderGames();
});
searchClear.addEventListener('click', () => {
    searchInput.value = '';
    searchTerm = '';
    searchClear.hidden = true;
    searchInput.focus();
    renderGames();
});

// ----------------------------------------------------------------
//  Empty state reset
// ----------------------------------------------------------------
if (emptyReset) {
    emptyReset.addEventListener('click', () => {
        searchInput.value = '';
        searchTerm = '';
        searchClear.hidden = true;
        activeFilter = 'all';
        filterChips.forEach(c => c.classList.remove('active'));
        filterChips[0] && filterChips[0].classList.add('active');
        renderGames();
    });
}

// ----------------------------------------------------------------
//  Keyboard shortcuts
// ----------------------------------------------------------------
document.addEventListener('keydown', e => {
    // Ctrl+R → random
    if (e.key === 'r' && e.ctrlKey) {
        e.preventDefault();
        pickRandomGame();
    }
    // / → focus search
    if (e.key === '/' && !['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) {
        e.preventDefault();
        searchInput.focus();
    }
});

// ----------------------------------------------------------------
//  Game stats (play count)
// ----------------------------------------------------------------
class GameStats {
    constructor() {
        this.stats = JSON.parse(localStorage.getItem('gameStats') || '{}');
    }
    incrementPlayCount(gameId) {
        if (!this.stats[gameId]) this.stats[gameId] = { playCount: 0, lastPlayed: null };
        this.stats[gameId].playCount++;
        this.stats[gameId].lastPlayed = new Date().toISOString();
        localStorage.setItem('gameStats', JSON.stringify(this.stats));
    }
    getMostPlayed() {
        const entries = Object.entries(this.stats);
        if (!entries.length) return null;
        return entries.reduce((max, cur) => cur[1].playCount > max[1].playCount ? cur : max);
    }
}
const gameStats = new GameStats();

// ----------------------------------------------------------------
//  BMC support dialog
// ----------------------------------------------------------------
const BMC_UPI_ID   = 'vijaygupta1818@ptyes';
const BMC_UPI_NAME = 'Vijay Gupta';
const BMC_TN       = 'vijay.tools support';

function buildUpiIntent(amount) {
    const params = new URLSearchParams({ pa: BMC_UPI_ID, pn: BMC_UPI_NAME, cu: 'INR', tn: BMC_TN });
    if (amount) params.set('am', String(amount));
    return `upi://pay?${params.toString()}`;
}

function wireSupportDialog() {
    const dialog  = document.getElementById('supportDialog');
    const copyBtn = document.getElementById('supportCopyBtn');
    const amt49   = document.getElementById('amount49');
    const amt99   = document.getElementById('amount99');
    if (!dialog) return;

    if (amt49) amt49.href = buildUpiIntent(49);
    if (amt99) amt99.href = buildUpiIntent(99);

    const open = () => {
        dialog.classList.add('open');
        dialog.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
    };
    const close = () => {
        dialog.classList.remove('open');
        dialog.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
    };

    document.querySelectorAll('[data-open="support"], #supportFab').forEach(el => {
        el.addEventListener('click', open);
    });
    dialog.addEventListener('click', e => {
        if (e.target.closest('[data-close]')) close();
    });
    document.addEventListener('keydown', e => {
        if (e.key === 'Escape' && dialog.classList.contains('open')) close();
    });

    if (copyBtn) {
        const icon = document.getElementById('supportCopyIcon');
        const original = icon ? icon.innerHTML : '';
        copyBtn.addEventListener('click', async () => {
            try {
                await navigator.clipboard.writeText(BMC_UPI_ID);
                copyBtn.classList.add('copied');
                if (icon) icon.innerHTML = '<polyline points="20 6 9 17 4 12"/>';
                setTimeout(() => {
                    copyBtn.classList.remove('copied');
                    if (icon) icon.innerHTML = original;
                }, 2000);
            } catch {
                // fallback: select text
                const span = document.getElementById('supportUpiId');
                if (span) {
                    const range = document.createRange();
                    range.selectNodeContents(span);
                    window.getSelection().removeAllRanges();
                    window.getSelection().addRange(range);
                }
            }
        });
    }
}

// ----------------------------------------------------------------
//  Boot
// ----------------------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
    renderGames();
    randomGameBtn.addEventListener('click', pickRandomGame);
    wireSupportDialog();
    document.body.classList.add('loaded');
});
