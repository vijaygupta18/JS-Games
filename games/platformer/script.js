// Mini Platformer Game Class
class PlatformerGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        // Game state
        this.gameActive = false;
        this.gamePaused = false;
        this.gameOver = false;
        this.currentLevel = 1;
        this.score = 0;
        this.lives = 3;
        this.coins = 0;
        this.time = 0;
        this.timer = null;
        
        // Camera
        this.camera = {
            x: 0,
            y: 0
        };
        
        // Player
        this.player = {
            x: 100,
            y: 400,
            width: 32,
            height: 32,
            vx: 0,
            vy: 0,
            speed: 5,
            jumpPower: 15,
            onGround: false,
            facing: 1, // 1 = right, -1 = left
            invulnerable: false,
            invulnerabilityTime: 0,
            doubleJumpAvailable: false,
            hasDoubleJump: false
        };
        
        // Game objects
        this.platforms = [];
        this.enemies = [];
        this.collectibles = [];
        this.powerUps = [];
        this.particles = [];
        this.spikes = [];
        this.checkpoints = [];
        this.levelExit = null;
        
        // Physics
        this.gravity = 0.8;
        this.friction = 0.85;
        
        // Controls
        this.keys = {};
        this.mobileControls = {
            left: false,
            right: false,
            jump: false,
            action: false
        };
        
        // Power-ups
        this.activePowerUps = {
            speed: false,
            doubleJump: false,
            invincibility: false
        };
        this.powerUpTimers = {};
        
        // Level data
        this.levels = this.createLevels();
        
        // Statistics
        this.stats = JSON.parse(localStorage.getItem('platformerStats')) || {
            highScore: 0,
            gamesPlayed: 0,
            levelsCompleted: 0,
            totalCoins: 0,
            bestTime: null,
            totalDeaths: 0
        };
        
        // Animation frame
        this.animationId = null;
        
        this.init();
    }
    
    init() {
        this.bindEvents();
        this.updateDisplay();
        this.updateStatsDisplay();
        this.loadLevel(this.currentLevel);
        this.render();
    }
    
    bindEvents() {
        // Button events
        document.getElementById('startBtn').addEventListener('click', () => this.startGame());
        document.getElementById('pauseBtn').addEventListener('click', () => this.togglePause());
        document.getElementById('resetBtn').addEventListener('click', () => this.resetGame());
        document.getElementById('powerUpBtn').addEventListener('click', () => this.activateRandomPowerUp());
        
        // Keyboard controls
        document.addEventListener('keydown', (e) => this.handleKeyDown(e));
        document.addEventListener('keyup', (e) => this.handleKeyUp(e));
        
        // Mobile controls
        this.bindMobileControls();
        
        // Prevent context menu
        this.canvas.addEventListener('contextmenu', (e) => e.preventDefault());
    }
    
    bindMobileControls() {
        const leftBtn = document.getElementById('leftBtn');
        const rightBtn = document.getElementById('rightBtn');
        const jumpBtn = document.getElementById('jumpBtn');
        const actionBtn = document.getElementById('actionBtn');
        
        // Touch events for mobile controls
        leftBtn.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.mobileControls.left = true;
        });
        leftBtn.addEventListener('touchend', (e) => {
            e.preventDefault();
            this.mobileControls.left = false;
        });
        
        rightBtn.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.mobileControls.right = true;
        });
        rightBtn.addEventListener('touchend', (e) => {
            e.preventDefault();
            this.mobileControls.right = false;
        });
        
        jumpBtn.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.mobileControls.jump = true;
            this.jump();
        });
        jumpBtn.addEventListener('touchend', (e) => {
            e.preventDefault();
            this.mobileControls.jump = false;
        });
        
        actionBtn.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.mobileControls.action = true;
        });
        actionBtn.addEventListener('touchend', (e) => {
            e.preventDefault();
            this.mobileControls.action = false;
        });
        
        // Mouse events as fallback
        leftBtn.addEventListener('mousedown', () => this.mobileControls.left = true);
        leftBtn.addEventListener('mouseup', () => this.mobileControls.left = false);
        rightBtn.addEventListener('mousedown', () => this.mobileControls.right = true);
        rightBtn.addEventListener('mouseup', () => this.mobileControls.right = false);
        jumpBtn.addEventListener('mousedown', () => {
            this.mobileControls.jump = true;
            this.jump();
        });
        jumpBtn.addEventListener('mouseup', () => this.mobileControls.jump = false);
    }
    
    handleKeyDown(e) {
        this.keys[e.key.toLowerCase()] = true;
        
        if (e.key === ' ' || e.key.toLowerCase() === 'w' || e.key === 'ArrowUp') {
            e.preventDefault();
            if (this.gameActive && !this.gamePaused) {
                this.jump();
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
    
    handleKeyUp(e) {
        this.keys[e.key.toLowerCase()] = false;
    }
    
    startGame() {
        this.gameActive = true;
        this.gamePaused = false;
        this.gameOver = false;
        this.currentLevel = 1;
        this.score = 0;
        this.lives = 3;
        this.coins = 0;
        this.time = 0;
        
        this.clearPowerUps();
        this.loadLevel(this.currentLevel);
        this.hideOverlay();
        this.updateButtons();
        this.startTimer();
        this.gameLoop();
        
        this.playSound('start');
    }
    
    togglePause() {
        if (!this.gameActive) return;
        
        this.gamePaused = !this.gamePaused;
        
        if (this.gamePaused) {
            this.showOverlay('Game Paused', 'Press P or click Resume to continue');
            this.playSound('pause');
            if (this.timer) {
                clearInterval(this.timer);
            }
        } else {
            this.hideOverlay();
            this.startTimer();
            this.gameLoop();
            this.playSound('resume');
        }
        
        this.updateButtons();
    }
    
    resetGame() {
        this.gameActive = false;
        this.gamePaused = false;
        this.gameOver = false;
        this.currentLevel = 1;
        this.score = 0;
        this.lives = 3;
        this.coins = 0;
        this.time = 0;
        
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        
        if (this.timer) {
            clearInterval(this.timer);
        }
        
        this.clearPowerUps();
        this.loadLevel(this.currentLevel);
        this.updateDisplay();
        this.updateButtons();
        this.showOverlay('Mini Platformer', 'Use WASD or Arrow Keys to move and jump!');
        this.render();
        
        this.playSound('reset');
    }
    
    startTimer() {
        if (this.timer) {
            clearInterval(this.timer);
        }
        
        this.timer = setInterval(() => {
            this.time++;
            this.updateDisplay();
        }, 1000);
    }
    
    jump() {
        if (!this.gameActive || this.gamePaused || this.gameOver) return;
        
        if (this.player.onGround) {
            this.player.vy = -this.player.jumpPower;
            this.player.onGround = false;
            this.player.doubleJumpAvailable = this.player.hasDoubleJump;
            this.playSound('jump');
        } else if (this.player.doubleJumpAvailable && this.player.hasDoubleJump) {
            this.player.vy = -this.player.jumpPower * 0.8;
            this.player.doubleJumpAvailable = false;
            this.createJumpParticles();
            this.playSound('doubleJump');
        }
    }
    
    gameLoop() {
        if (!this.gameActive || this.gamePaused) return;
        
        this.update();
        this.render();
        
        this.animationId = requestAnimationFrame(() => this.gameLoop());
    }
    
    update() {
        this.updatePlayer();
        this.updateEnemies();
        this.updateCollectibles();
        this.updatePowerUps();
        this.updateParticles();
        this.updateCamera();
        this.checkCollisions();
        this.updatePowerUpTimers();
    }
    
    updatePlayer() {
        // Handle input
        const moveLeft = this.keys['a'] || this.keys['arrowleft'] || this.mobileControls.left;
        const moveRight = this.keys['d'] || this.keys['arrowright'] || this.mobileControls.right;
        
        // Horizontal movement
        const speed = this.activePowerUps.speed ? this.player.speed * 1.5 : this.player.speed;
        
        if (moveLeft) {
            this.player.vx = -speed;
            this.player.facing = -1;
        } else if (moveRight) {
            this.player.vx = speed;
            this.player.facing = 1;
        } else {
            this.player.vx *= this.friction;
        }
        
        // Apply gravity
        this.player.vy += this.gravity;
        
        // Update position
        this.player.x += this.player.vx;
        this.player.y += this.player.vy;
        
        // Handle invulnerability
        if (this.player.invulnerable) {
            this.player.invulnerabilityTime--;
            if (this.player.invulnerabilityTime <= 0) {
                this.player.invulnerable = false;
            }
        }
        
        // Check world bounds
        if (this.player.y > this.canvas.height + 100) {
            this.playerDie();
        }
        
        // Clamp horizontal position
        this.player.x = Math.max(0, Math.min(this.getLevelWidth() - this.player.width, this.player.x));
    }
    
    updateEnemies() {
        for (const enemy of this.enemies) {
            if (enemy.type === 'walker') {
                enemy.x += enemy.vx;
                
                // Reverse direction at platform edges or walls
                if (enemy.x <= enemy.minX || enemy.x >= enemy.maxX) {
                    enemy.vx = -enemy.vx;
                }
            } else if (enemy.type === 'jumper') {
                enemy.vy += this.gravity;
                enemy.x += enemy.vx;
                enemy.y += enemy.vy;
                
                // Simple AI: jump towards player occasionally
                if (enemy.onGround && Math.random() < 0.01) {
                    enemy.vy = -10;
                    enemy.onGround = false;
                }
            }
        }
    }
    
    updateCollectibles() {
        for (let i = this.collectibles.length - 1; i >= 0; i--) {
            const collectible = this.collectibles[i];
            
            if (collectible.type === 'coin') {
                collectible.rotation += 0.1;
                collectible.bobOffset = Math.sin(Date.now() * 0.005 + collectible.x * 0.01) * 5;
            }
        }
    }
    
    updatePowerUps() {
        for (const powerUp of this.powerUps) {
            powerUp.rotation += 0.05;
            powerUp.bobOffset = Math.sin(Date.now() * 0.003 + powerUp.x * 0.01) * 8;
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
    
    updateCamera() {
        // Follow player with smooth camera
        const targetX = this.player.x - this.canvas.width / 2;
        const targetY = this.player.y - this.canvas.height / 2;
        
        this.camera.x += (targetX - this.camera.x) * 0.1;
        this.camera.y += (targetY - this.camera.y) * 0.1;
        
        // Clamp camera to level bounds
        this.camera.x = Math.max(0, Math.min(this.getLevelWidth() - this.canvas.width, this.camera.x));
        this.camera.y = Math.max(-200, Math.min(this.canvas.height - 200, this.camera.y));
    }
    
    checkCollisions() {
        this.player.onGround = false;
        
        // Platform collisions
        for (const platform of this.platforms) {
            if (this.checkRectCollision(this.player, platform)) {
                this.resolveCollision(this.player, platform);
            }
        }
        
        // Enemy collisions
        if (!this.player.invulnerable && !this.activePowerUps.invincibility) {
            for (const enemy of this.enemies) {
                if (this.checkRectCollision(this.player, enemy)) {
                    this.playerDie();
                    break;
                }
            }
        }
        
        // Spike collisions
        if (!this.player.invulnerable && !this.activePowerUps.invincibility) {
            for (const spike of this.spikes) {
                if (this.checkRectCollision(this.player, spike)) {
                    this.playerDie();
                    break;
                }
            }
        }
        
        // Collectible collisions
        for (let i = this.collectibles.length - 1; i >= 0; i--) {
            const collectible = this.collectibles[i];
            if (this.checkRectCollision(this.player, collectible)) {
                this.collectItem(collectible);
                this.collectibles.splice(i, 1);
            }
        }
        
        // Power-up collisions
        for (let i = this.powerUps.length - 1; i >= 0; i--) {
            const powerUp = this.powerUps[i];
            if (this.checkRectCollision(this.player, powerUp)) {
                this.activatePowerUp(powerUp.type);
                this.powerUps.splice(i, 1);
            }
        }
        
        // Level exit collision
        if (this.levelExit && this.checkRectCollision(this.player, this.levelExit)) {
            this.completeLevel();
        }
    }
    
    checkRectCollision(rect1, rect2) {
        return rect1.x < rect2.x + rect2.width &&
               rect1.x + rect1.width > rect2.x &&
               rect1.y < rect2.y + rect2.height &&
               rect1.y + rect1.height > rect2.y;
    }
    
    resolveCollision(player, platform) {
        const overlapX = Math.min(player.x + player.width - platform.x, platform.x + platform.width - player.x);
        const overlapY = Math.min(player.y + player.height - platform.y, platform.y + platform.height - player.y);
        
        if (overlapX < overlapY) {
            // Horizontal collision
            if (player.x < platform.x) {
                player.x = platform.x - player.width;
            } else {
                player.x = platform.x + platform.width;
            }
            player.vx = 0;
        } else {
            // Vertical collision
            if (player.y < platform.y) {
                player.y = platform.y - player.height;
                player.vy = 0;
                player.onGround = true;
            } else {
                player.y = platform.y + platform.height;
                player.vy = 0;
            }
        }
    }
    
    collectItem(item) {
        if (item.type === 'coin') {
            this.coins++;
            this.score += 100;
            this.stats.totalCoins++;
            this.animateElement('coinsDisplay');
            this.animateElement('scoreDisplay');
            this.createCoinParticles(item.x + item.width / 2, item.y + item.height / 2);
            this.playSound('coin');
        }
    }
    
    activatePowerUp(type) {
        switch (type) {
            case 'speed':
                this.activePowerUps.speed = true;
                this.powerUpTimers.speed = 600; // 10 seconds at 60fps
                break;
            case 'doubleJump':
                this.player.hasDoubleJump = true;
                this.powerUpTimers.doubleJump = 900; // 15 seconds
                break;
            case 'invincibility':
                this.activePowerUps.invincibility = true;
                this.powerUpTimers.invincibility = 300; // 5 seconds
                break;
        }
        
        this.updateButtons();
        this.playSound('powerUp');
    }
    
    updatePowerUpTimers() {
        Object.keys(this.powerUpTimers).forEach(type => {
            this.powerUpTimers[type]--;
            if (this.powerUpTimers[type] <= 0) {
                this.deactivatePowerUp(type);
            }
        });
    }
    
    deactivatePowerUp(type) {
        switch (type) {
            case 'speed':
                this.activePowerUps.speed = false;
                break;
            case 'doubleJump':
                this.player.hasDoubleJump = false;
                this.player.doubleJumpAvailable = false;
                break;
            case 'invincibility':
                this.activePowerUps.invincibility = false;
                break;
        }
        
        delete this.powerUpTimers[type];
        this.updateButtons();
    }
    
    clearPowerUps() {
        this.activePowerUps = {
            speed: false,
            doubleJump: false,
            invincibility: false
        };
        this.powerUpTimers = {};
        this.player.hasDoubleJump = false;
        this.player.doubleJumpAvailable = false;
    }
    
    activateRandomPowerUp() {
        const types = ['speed', 'doubleJump', 'invincibility'];
        const randomType = types[Math.floor(Math.random() * types.length)];
        this.activatePowerUp(randomType);
    }
    
    playerDie() {
        if (this.player.invulnerable || this.activePowerUps.invincibility) return;
        
        this.lives--;
        this.stats.totalDeaths++;
        this.player.invulnerable = true;
        this.player.invulnerabilityTime = 120; // 2 seconds at 60fps
        
        this.createDeathParticles();
        this.animateElement('livesDisplay');
        
        if (this.lives <= 0) {
            this.endGame();
        } else {
            // Respawn at level start or last checkpoint
            this.respawnPlayer();
            this.playSound('death');
        }
    }
    
    respawnPlayer() {
        this.player.x = 100;
        this.player.y = 400;
        this.player.vx = 0;
        this.player.vy = 0;
        this.camera.x = 0;
        this.camera.y = 0;
    }
    
    completeLevel() {
        this.currentLevel++;
        this.stats.levelsCompleted++;
        this.score += 1000 + (this.time > 0 ? Math.max(0, 300 - this.time) : 0); // Time bonus
        
        if (this.currentLevel > this.levels.length) {
            // Game completed!
            this.endGame(true);
        } else {
            this.loadLevel(this.currentLevel);
            this.showOverlay('Level Complete!', `Starting Level ${this.currentLevel}`);
            setTimeout(() => this.hideOverlay(), 2000);
            this.playSound('levelComplete');
        }
    }
    
    endGame(won = false) {
        this.gameActive = false;
        
        if (this.timer) {
            clearInterval(this.timer);
        }
        
        // Update statistics
        this.stats.gamesPlayed++;
        
        if (this.score > this.stats.highScore) {
            this.stats.highScore = this.score;
        }
        
        if (won || this.currentLevel > 1) {
            const timeStr = this.formatTime(this.time);
            if (!this.stats.bestTime || this.time < this.parseTime(this.stats.bestTime)) {
                this.stats.bestTime = timeStr;
            }
        }
        
        localStorage.setItem('platformerStats', JSON.stringify(this.stats));
        this.updateStatsDisplay();
        
        const message = won ? 
            `Congratulations! All levels completed in ${this.formatTime(this.time)}!` :
            `Game Over! Final Score: ${this.score}`;
        
        this.showOverlay(won ? 'Victory!' : 'Game Over!', message);
        this.updateButtons();
        this.playSound(won ? 'victory' : 'gameOver');
    }
    
    createLevels() {
        return [
            // Level 1 - Tutorial
            {
                platforms: [
                    { x: 0, y: 550, width: 200, height: 50 },
                    { x: 300, y: 500, width: 100, height: 20 },
                    { x: 500, y: 450, width: 100, height: 20 },
                    { x: 700, y: 400, width: 200, height: 20 },
                    { x: 1000, y: 550, width: 200, height: 50 }
                ],
                enemies: [
                    { x: 350, y: 470, width: 30, height: 30, type: 'walker', vx: 1, minX: 300, maxX: 400 }
                ],
                collectibles: [
                    { x: 330, y: 460, width: 20, height: 20, type: 'coin' },
                    { x: 530, y: 410, width: 20, height: 20, type: 'coin' },
                    { x: 750, y: 360, width: 20, height: 20, type: 'coin' }
                ],
                powerUps: [
                    { x: 750, y: 350, width: 25, height: 25, type: 'doubleJump' }
                ],
                spikes: [],
                exit: { x: 1100, y: 500, width: 40, height: 50 }
            },
            
            // Level 2 - More challenging
            {
                platforms: [
                    { x: 0, y: 550, width: 150, height: 50 },
                    { x: 250, y: 480, width: 80, height: 20 },
                    { x: 400, y: 420, width: 80, height: 20 },
                    { x: 550, y: 360, width: 80, height: 20 },
                    { x: 700, y: 480, width: 100, height: 20 },
                    { x: 900, y: 400, width: 80, height: 20 },
                    { x: 1100, y: 320, width: 100, height: 20 },
                    { x: 1300, y: 550, width: 200, height: 50 }
                ],
                enemies: [
                    { x: 270, y: 450, width: 30, height: 30, type: 'walker', vx: 1.5, minX: 250, maxX: 330 },
                    { x: 720, y: 450, width: 30, height: 30, type: 'walker', vx: -1, minX: 700, maxX: 800 },
                    { x: 920, y: 370, width: 30, height: 30, type: 'jumper', vx: 0.5, vy: 0, onGround: true }
                ],
                collectibles: [
                    { x: 280, y: 440, width: 20, height: 20, type: 'coin' },
                    { x: 430, y: 380, width: 20, height: 20, type: 'coin' },
                    { x: 580, y: 320, width: 20, height: 20, type: 'coin' },
                    { x: 730, y: 440, width: 20, height: 20, type: 'coin' },
                    { x: 1130, y: 280, width: 20, height: 20, type: 'coin' }
                ],
                powerUps: [
                    { x: 430, y: 370, width: 25, height: 25, type: 'speed' },
                    { x: 1130, y: 270, width: 25, height: 25, type: 'invincibility' }
                ],
                spikes: [
                    { x: 180, y: 530, width: 40, height: 20 },
                    { x: 350, y: 580, width: 60, height: 20 },
                    { x: 850, y: 580, width: 80, height: 20 }
                ],
                exit: { x: 1400, y: 500, width: 40, height: 50 }
            },
            
            // Level 3 - Advanced
            {
                platforms: [
                    { x: 0, y: 550, width: 120, height: 50 },
                    { x: 200, y: 450, width: 60, height: 20 },
                    { x: 320, y: 380, width: 60, height: 20 },
                    { x: 450, y: 320, width: 60, height: 20 },
                    { x: 580, y: 260, width: 60, height: 20 },
                    { x: 700, y: 380, width: 80, height: 20 },
                    { x: 850, y: 480, width: 60, height: 20 },
                    { x: 980, y: 420, width: 60, height: 20 },
                    { x: 1120, y: 360, width: 60, height: 20 },
                    { x: 1250, y: 300, width: 60, height: 20 },
                    { x: 1400, y: 550, width: 200, height: 50 }
                ],
                enemies: [
                    { x: 220, y: 420, width: 30, height: 30, type: 'walker', vx: 1, minX: 200, maxX: 260 },
                    { x: 470, y: 290, width: 30, height: 30, type: 'walker', vx: -1, minX: 450, maxX: 510 },
                    { x: 720, y: 350, width: 30, height: 30, type: 'jumper', vx: 0.8, vy: 0, onGround: true },
                    { x: 870, y: 450, width: 30, height: 30, type: 'walker', vx: 1.2, minX: 850, maxX: 910 },
                    { x: 1140, y: 330, width: 30, height: 30, type: 'walker', vx: -0.8, minX: 1120, maxX: 1180 }
                ],
                collectibles: [
                    { x: 230, y: 410, width: 20, height: 20, type: 'coin' },
                    { x: 350, y: 340, width: 20, height: 20, type: 'coin' },
                    { x: 480, y: 280, width: 20, height: 20, type: 'coin' },
                    { x: 610, y: 220, width: 20, height: 20, type: 'coin' },
                    { x: 730, y: 340, width: 20, height: 20, type: 'coin' },
                    { x: 1010, y: 380, width: 20, height: 20, type: 'coin' },
                    { x: 1280, y: 260, width: 20, height: 20, type: 'coin' }
                ],
                powerUps: [
                    { x: 350, y: 330, width: 25, height: 25, type: 'doubleJump' },
                    { x: 610, y: 210, width: 25, height: 25, type: 'speed' },
                    { x: 1010, y: 370, width: 25, height: 25, type: 'invincibility' }
                ],
                spikes: [
                    { x: 150, y: 530, width: 40, height: 20 },
                    { x: 280, y: 580, width: 60, height: 20 },
                    { x: 520, y: 580, width: 80, height: 20 },
                    { x: 800, y: 580, width: 40, height: 20 },
                    { x: 1050, y: 580, width: 60, height: 20 },
                    { x: 1320, y: 580, width: 40, height: 20 }
                ],
                exit: { x: 1500, y: 500, width: 40, height: 50 }
            }
        ];
    }
    
    loadLevel(levelNum) {
        if (levelNum > this.levels.length) return;
        
        const level = this.levels[levelNum - 1];
        
        // Reset player position
        this.player.x = 100;
        this.player.y = 400;
        this.player.vx = 0;
        this.player.vy = 0;
        this.player.onGround = false;
        this.player.invulnerable = false;
        this.player.invulnerabilityTime = 0;
        
        // Reset camera
        this.camera.x = 0;
        this.camera.y = 0;
        
        // Load level objects
        this.platforms = [...level.platforms];
        this.enemies = level.enemies.map(e => ({ ...e, onGround: e.onGround || false }));
        this.collectibles = level.collectibles.map(c => ({ 
            ...c, 
            rotation: 0, 
            bobOffset: 0 
        }));
        this.powerUps = level.powerUps.map(p => ({ 
            ...p, 
            rotation: 0, 
            bobOffset: 0 
        }));
        this.spikes = [...level.spikes];
        this.levelExit = { ...level.exit };
        this.particles = [];
        
        this.updateDisplay();
    }
    
    getLevelWidth() {
        return this.currentLevel <= this.levels.length ? 1600 : 800;
    }
    
    createJumpParticles() {
        for (let i = 0; i < 8; i++) {
            this.particles.push({
                x: this.player.x + this.player.width / 2,
                y: this.player.y + this.player.height,
                vx: (Math.random() - 0.5) * 6,
                vy: Math.random() * 3 + 1,
                life: 30,
                maxLife: 30,
                alpha: 1,
                color: `hsl(${200 + Math.random() * 60}, 70%, 70%)`
            });
        }
    }
    
    createCoinParticles(x, y) {
        for (let i = 0; i < 10; i++) {
            this.particles.push({
                x: x,
                y: y,
                vx: (Math.random() - 0.5) * 8,
                vy: (Math.random() - 0.5) * 8,
                life: 40,
                maxLife: 40,
                alpha: 1,
                color: '#ffd700'
            });
        }
    }
    
    createDeathParticles() {
        for (let i = 0; i < 15; i++) {
            this.particles.push({
                x: this.player.x + this.player.width / 2,
                y: this.player.y + this.player.height / 2,
                vx: (Math.random() - 0.5) * 10,
                vy: (Math.random() - 0.5) * 10,
                life: 50,
                maxLife: 50,
                alpha: 1,
                color: `hsl(${Math.random() * 60}, 70%, 60%)`
            });
        }
    }
    
    render() {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Save context for camera transform
        this.ctx.save();
        this.ctx.translate(-this.camera.x, -this.camera.y);
        
        // Draw background
        this.drawBackground();
        
        // Draw platforms
        this.drawPlatforms();
        
        // Draw spikes
        this.drawSpikes();
        
        // Draw collectibles
        this.drawCollectibles();
        
        // Draw power-ups
        this.drawPowerUps();
        
        // Draw enemies
        this.drawEnemies();
        
        // Draw player
        this.drawPlayer();
        
        // Draw level exit
        this.drawLevelExit();
        
        // Draw particles
        this.drawParticles();
        
        // Restore context
        this.ctx.restore();
        
        // Draw UI (not affected by camera)
        this.drawUI();
    }
    
    drawBackground() {
        // Sky gradient
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        gradient.addColorStop(0, '#87ceeb');
        gradient.addColorStop(1, '#98d8e8');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(this.camera.x, this.camera.y, this.canvas.width, this.canvas.height);
        
        // Clouds
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        for (let i = 0; i < 5; i++) {
            const x = i * 300 + 100;
            const y = 100 + i * 50;
            this.drawCloud(x, y);
        }
    }
    
    drawCloud(x, y) {
        this.ctx.beginPath();
        this.ctx.arc(x, y, 30, 0, Math.PI * 2);
        this.ctx.arc(x + 40, y, 40, 0, Math.PI * 2);
        this.ctx.arc(x + 80, y, 30, 0, Math.PI * 2);
        this.ctx.arc(x + 40, y - 25, 25, 0, Math.PI * 2);
        this.ctx.fill();
    }
    
    drawPlatforms() {
        this.ctx.fillStyle = '#8b4513';
        this.ctx.strokeStyle = '#654321';
        this.ctx.lineWidth = 2;
        
        for (const platform of this.platforms) {
            this.ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
            this.ctx.strokeRect(platform.x, platform.y, platform.width, platform.height);
        }
    }
    
    drawSpikes() {
        this.ctx.fillStyle = '#666';
        this.ctx.strokeStyle = '#333';
        this.ctx.lineWidth = 1;
        
        for (const spike of this.spikes) {
            const spikes = Math.floor(spike.width / 20);
            for (let i = 0; i < spikes; i++) {
                const x = spike.x + i * 20;
                const y = spike.y;
                
                this.ctx.beginPath();
                this.ctx.moveTo(x, y + spike.height);
                this.ctx.lineTo(x + 10, y);
                this.ctx.lineTo(x + 20, y + spike.height);
                this.ctx.closePath();
                this.ctx.fill();
                this.ctx.stroke();
            }
        }
    }
    
    drawCollectibles() {
        for (const collectible of this.collectibles) {
            if (collectible.type === 'coin') {
                this.ctx.save();
                this.ctx.translate(
                    collectible.x + collectible.width / 2,
                    collectible.y + collectible.height / 2 + collectible.bobOffset
                );
                this.ctx.rotate(collectible.rotation);
                
                this.ctx.fillStyle = '#ffd700';
                this.ctx.strokeStyle = '#ffb000';
                this.ctx.lineWidth = 2;
                
                this.ctx.beginPath();
                this.ctx.arc(0, 0, collectible.width / 2, 0, Math.PI * 2);
                this.ctx.fill();
                this.ctx.stroke();
                
                // Draw coin symbol
                this.ctx.fillStyle = '#ffb000';
                this.ctx.font = 'bold 12px Arial';
                this.ctx.textAlign = 'center';
                this.ctx.fillText('$', 0, 4);
                
                this.ctx.restore();
            }
        }
    }
    
    drawPowerUps() {
        for (const powerUp of this.powerUps) {
            this.ctx.save();
            this.ctx.translate(
                powerUp.x + powerUp.width / 2,
                powerUp.y + powerUp.height / 2 + powerUp.bobOffset
            );
            this.ctx.rotate(powerUp.rotation);
            
            // Power-up colors
            const colors = {
                speed: '#00ff00',
                doubleJump: '#0080ff',
                invincibility: '#ff8000'
            };
            
            this.ctx.fillStyle = colors[powerUp.type] || '#ff00ff';
            this.ctx.strokeStyle = '#fff';
            this.ctx.lineWidth = 2;
            
            this.ctx.fillRect(-powerUp.width / 2, -powerUp.height / 2, powerUp.width, powerUp.height);
            this.ctx.strokeRect(-powerUp.width / 2, -powerUp.height / 2, powerUp.width, powerUp.height);
            
            // Draw power-up icon
            this.ctx.fillStyle = '#fff';
            this.ctx.font = 'bold 14px Arial';
            this.ctx.textAlign = 'center';
            
            const icons = {
                speed: '⚡',
                doubleJump: '↑↑',
                invincibility: '★'
            };
            
            this.ctx.fillText(icons[powerUp.type] || '?', 0, 4);
            
            this.ctx.restore();
        }
    }
    
    drawEnemies() {
        for (const enemy of this.enemies) {
            this.ctx.fillStyle = '#e53e3e';
            this.ctx.strokeStyle = '#c53030';
            this.ctx.lineWidth = 2;
            
            if (enemy.type === 'walker') {
                // Draw simple enemy rectangle
                this.ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
                this.ctx.strokeRect(enemy.x, enemy.y, enemy.width, enemy.height);
                
                // Draw eyes
                this.ctx.fillStyle = '#fff';
                this.ctx.fillRect(enemy.x + 5, enemy.y + 5, 6, 6);
                this.ctx.fillRect(enemy.x + 19, enemy.y + 5, 6, 6);
                
                this.ctx.fillStyle = '#000';
                this.ctx.fillRect(enemy.x + 7, enemy.y + 7, 2, 2);
                this.ctx.fillRect(enemy.x + 21, enemy.y + 7, 2, 2);
            } else if (enemy.type === 'jumper') {
                // Draw jumping enemy (circular)
                this.ctx.beginPath();
                this.ctx.arc(
                    enemy.x + enemy.width / 2,
                    enemy.y + enemy.height / 2,
                    enemy.width / 2,
                    0,
                    Math.PI * 2
                );
                this.ctx.fill();
                this.ctx.stroke();
                
                // Draw eyes
                this.ctx.fillStyle = '#fff';
                this.ctx.beginPath();
                this.ctx.arc(enemy.x + 10, enemy.y + 10, 4, 0, Math.PI * 2);
                this.ctx.arc(enemy.x + 20, enemy.y + 10, 4, 0, Math.PI * 2);
                this.ctx.fill();
                
                this.ctx.fillStyle = '#000';
                this.ctx.beginPath();
                this.ctx.arc(enemy.x + 10, enemy.y + 10, 2, 0, Math.PI * 2);
                this.ctx.arc(enemy.x + 20, enemy.y + 10, 2, 0, Math.PI * 2);
                this.ctx.fill();
            }
        }
    }
    
    drawPlayer() {
        this.ctx.save();
        
        // Apply invulnerability flashing
        if (this.player.invulnerable && Math.floor(Date.now() / 100) % 2) {
            this.ctx.globalAlpha = 0.5;
        }
        
        // Apply power-up effects
        if (this.activePowerUps.invincibility) {
            this.ctx.shadowColor = '#ff8000';
            this.ctx.shadowBlur = 10;
        }
        
        this.ctx.fillStyle = '#3182ce';
        this.ctx.strokeStyle = '#2c5aa0';
        this.ctx.lineWidth = 2;
        
        // Draw player body
        this.ctx.fillRect(this.player.x, this.player.y, this.player.width, this.player.height);
        this.ctx.strokeRect(this.player.x, this.player.y, this.player.width, this.player.height);
        
        // Draw eyes
        this.ctx.fillStyle = '#fff';
        const eyeY = this.player.y + 8;
        if (this.player.facing === 1) {
            this.ctx.fillRect(this.player.x + 18, eyeY, 6, 6);
            this.ctx.fillRect(this.player.x + 26, eyeY, 4, 4);
        } else {
            this.ctx.fillRect(this.player.x + 2, eyeY, 4, 4);
            this.ctx.fillRect(this.player.x + 8, eyeY, 6, 6);
        }
        
        this.ctx.fillStyle = '#000';
        if (this.player.facing === 1) {
            this.ctx.fillRect(this.player.x + 20, eyeY + 2, 2, 2);
            this.ctx.fillRect(this.player.x + 27, eyeY + 1, 2, 2);
        } else {
            this.ctx.fillRect(this.player.x + 3, eyeY + 1, 2, 2);
            this.ctx.fillRect(this.player.x + 10, eyeY + 2, 2, 2);
        }
        
        this.ctx.restore();
    }
    
    drawLevelExit() {
        if (!this.levelExit) return;
        
        this.ctx.fillStyle = '#48bb78';
        this.ctx.strokeStyle = '#38a169';
        this.ctx.lineWidth = 3;
        
        // Draw flag pole
        this.ctx.fillRect(this.levelExit.x + 5, this.levelExit.y, 5, this.levelExit.height);
        
        // Draw flag
        this.ctx.fillRect(this.levelExit.x + 10, this.levelExit.y, 25, 20);
        this.ctx.strokeRect(this.levelExit.x + 10, this.levelExit.y, 25, 20);
        
        // Draw checkered pattern
        this.ctx.fillStyle = '#fff';
        for (let i = 0; i < 2; i++) {
            for (let j = 0; j < 2; j++) {
                if ((i + j) % 2 === 0) {
                    this.ctx.fillRect(
                        this.levelExit.x + 10 + i * 12.5,
                        this.levelExit.y + j * 10,
                        12.5,
                        10
                    );
                }
            }
        }
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
    
    drawUI() {
        // Draw level indicator
        this.ctx.fillStyle = '#fff';
        this.ctx.strokeStyle = '#000';
        this.ctx.lineWidth = 2;
        this.ctx.font = 'bold 24px Poppins';
        this.ctx.textAlign = 'center';
        
        const levelText = `Level ${this.currentLevel}`;
        this.ctx.strokeText(levelText, this.canvas.width / 2, 40);
        this.ctx.fillText(levelText, this.canvas.width / 2, 40);
        
        // Draw power-up indicators
        let powerUpY = 80;
        Object.keys(this.activePowerUps).forEach(type => {
            if (this.activePowerUps[type]) {
                const timeLeft = this.powerUpTimers[type] || 0;
                const seconds = Math.ceil(timeLeft / 60);
                
                this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
                this.ctx.fillRect(10, powerUpY, 120, 30);
                
                this.ctx.fillStyle = '#fff';
                this.ctx.font = '14px Poppins';
                this.ctx.textAlign = 'left';
                this.ctx.fillText(`${type}: ${seconds}s`, 15, powerUpY + 20);
                
                powerUpY += 35;
            }
        });
    }
    
    updateDisplay() {
        document.getElementById('scoreDisplay').textContent = this.score;
        document.getElementById('livesDisplay').textContent = this.lives;
        document.getElementById('levelDisplay').textContent = this.currentLevel;
        document.getElementById('coinsDisplay').textContent = this.coins;
        document.getElementById('timeDisplay').textContent = this.formatTime(this.time);
    }
    
    updateStatsDisplay() {
        document.getElementById('highScore').textContent = this.stats.highScore;
        document.getElementById('gamesPlayed').textContent = this.stats.gamesPlayed;
        document.getElementById('levelsCompleted').textContent = this.stats.levelsCompleted;
        document.getElementById('totalCoins').textContent = this.stats.totalCoins;
        document.getElementById('bestTime').textContent = this.stats.bestTime || '--:--';
        document.getElementById('totalDeaths').textContent = this.stats.totalDeaths;
    }
    
    updateButtons() {
        const startBtn = document.getElementById('startBtn');
        const pauseBtn = document.getElementById('pauseBtn');
        const powerUpBtn = document.getElementById('powerUpBtn');
        
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
        
        // Power-up button
        const hasActivePowerUps = Object.values(this.activePowerUps).some(active => active);
        powerUpBtn.disabled = !this.gameActive || this.gamePaused;
        
        if (hasActivePowerUps) {
            powerUpBtn.classList.add('power-up-active');
        } else {
            powerUpBtn.classList.remove('power-up-active');
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
    
    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }
    
    parseTime(timeStr) {
        const [mins, secs] = timeStr.split(':').map(Number);
        return mins * 60 + secs;
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
                case 'jump': frequency = 600; duration = 0.1; waveType = 'square'; break;
                case 'doubleJump': frequency = 800; duration = 0.15; waveType = 'square'; break;
                case 'coin': frequency = 1000; duration = 0.2; waveType = 'square'; break;
                case 'powerUp': frequency = 1200; duration = 0.3; waveType = 'square'; break;
                case 'death': frequency = 300; duration = 0.3; waveType = 'sawtooth'; break;
                case 'levelComplete': frequency = 1000; duration = 0.5; waveType = 'square'; break;
                case 'victory': frequency = 1500; duration = 0.8; waveType = 'square'; break;
                case 'gameOver': frequency = 250; duration = 0.5; waveType = 'sawtooth'; break;
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
    const game = new PlatformerGame();
    
    // Handle window resize
    window.addEventListener('resize', () => {
        const container = document.querySelector('.game-area');
        const containerWidth = container.clientWidth;
        
        if (containerWidth < 800) {
            game.canvas.style.width = '100%';
            game.canvas.style.height = 'auto';
        }
    });
    
    console.log('🏃 Mini Platformer game initialized!');
    console.log('💡 Use WASD or Arrow Keys to move, SPACE to jump, P to pause, R to reset');
}); 