// Typing Speed Test Game Class
class TypingSpeedTest {
    constructor() {
        this.currentText = '';
        this.userInput = '';
        this.currentIndex = 0;
        this.startTime = null;
        this.endTime = null;
        this.isActive = false;
        this.timeLeft = 60;
        this.selectedTime = 60;
        this.errors = 0;
        this.correctChars = 0;
        this.totalChars = 0;
        
        // Timer
        this.timer = null;
        
        // Statistics
        this.stats = JSON.parse(localStorage.getItem('typingStats')) || {
            testsCompleted: 0,
            bestWPM: 0,
            bestAccuracy: 0,
            averageWPM: 0,
            totalWPM: 0,
            averageAccuracy: 0,
            totalAccuracy: 0
        };
        
        // Text samples by difficulty
        this.textSamples = {
            easy: [
                "The quick brown fox jumps over the lazy dog. This is a simple sentence that contains all letters of the alphabet. It is often used for typing practice because it helps improve finger coordination and speed.",
                "A journey of a thousand miles begins with a single step. Every expert was once a beginner. Practice makes perfect, and with dedication, anyone can improve their typing skills significantly.",
                "Technology has changed the way we communicate and work. Computers and smartphones have become essential tools in our daily lives. Learning to type efficiently is now more important than ever before.",
                "Reading books expands our knowledge and imagination. Stories transport us to different worlds and help us understand various perspectives. The habit of reading regularly can improve vocabulary and writing skills."
            ],
            medium: [
                "Programming requires logical thinking and attention to detail. Variables, functions, and algorithms form the foundation of software development. Debugging code teaches patience and systematic problem-solving approaches that benefit many areas of life.",
                "Climate change represents one of humanity's greatest challenges. Rising temperatures, melting ice caps, and extreme weather patterns affect ecosystems worldwide. Sustainable practices and renewable energy sources offer hope for future generations.",
                "Artificial intelligence and machine learning are revolutionizing industries across the globe. From healthcare diagnostics to autonomous vehicles, these technologies promise to enhance human capabilities while raising important ethical questions about automation.",
                "The human brain contains approximately 86 billion neurons, each forming thousands of connections with other cells. This intricate network enables consciousness, memory formation, creative thinking, and the remarkable ability to learn throughout our lifetime."
            ],
            hard: [
                "Quantum mechanics fundamentally challenges our intuitive understanding of reality. Particles exist in superposition states until observed, exhibiting wave-particle duality that defies classical physics. Einstein's famous objection, 'God does not play dice,' reflects the philosophical implications of quantum uncertainty principles.",
                "Cryptocurrency blockchain technology utilizes cryptographic hash functions and distributed consensus mechanisms to maintain immutable transaction ledgers. Smart contracts execute automatically when predetermined conditions are met, potentially revolutionizing financial systems and eliminating intermediary institutions.",
                "Neuroplasticity demonstrates the brain's remarkable capacity for reorganization throughout life. Synaptic connections strengthen or weaken based on usage patterns, enabling recovery from injuries and adaptation to new environments. This phenomenon underlies learning, memory consolidation, and rehabilitation strategies.",
                "Bioengineering combines principles from biology, chemistry, physics, and engineering to develop innovative solutions for medical challenges. Gene therapy, tissue engineering, and prosthetic devices exemplify how interdisciplinary collaboration advances healthcare and improves quality of life for patients worldwide."
            ]
        };
        
        this.init();
    }
    
    init() {
        this.bindEvents();
        this.generateText();
        this.updateDisplay();
    }
    
    bindEvents() {
        // Control buttons
        document.getElementById('startBtn').addEventListener('click', () => this.startTest());
        document.getElementById('resetBtn').addEventListener('click', () => this.resetTest());
        document.getElementById('tryAgainBtn').addEventListener('click', () => this.resetTest());
        
        // Input handling
        const typingInput = document.getElementById('typingInput');
        typingInput.addEventListener('input', (e) => this.handleInput(e));
        typingInput.addEventListener('focus', () => this.startTest());
        
        // Settings
        document.getElementById('difficultySelect').addEventListener('change', () => this.generateText());
        document.getElementById('timeSelect').addEventListener('change', (e) => {
            this.selectedTime = parseInt(e.target.value);
            this.timeLeft = this.selectedTime;
            this.updateDisplay();
        });
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => this.handleKeyPress(e));
    }
    
    handleKeyPress(e) {
        if (e.key === 'Escape') {
            this.resetTest();
        }
        
        if (e.key === 'Tab') {
            e.preventDefault();
            this.generateText();
        }
    }
    
    generateText() {
        const difficulty = document.getElementById('difficultySelect').value;
        const samples = this.textSamples[difficulty];
        this.currentText = samples[Math.floor(Math.random() * samples.length)];
        
        this.renderText();
        this.resetTest();
    }
    
    renderText() {
        const textContent = document.getElementById('textContent');
        textContent.innerHTML = '';
        
        for (let i = 0; i < this.currentText.length; i++) {
            const span = document.createElement('span');
            span.textContent = this.currentText[i];
            span.className = 'char';
            if (i === 0) span.classList.add('current');
            textContent.appendChild(span);
        }
    }
    
    startTest() {
        if (this.isActive) return;
        
        this.isActive = true;
        this.startTime = new Date();
        this.currentIndex = 0;
        this.errors = 0;
        this.correctChars = 0;
        this.totalChars = 0;
        this.timeLeft = this.selectedTime;
        
        // Enable input
        const typingInput = document.getElementById('typingInput');
        typingInput.disabled = false;
        typingInput.focus();
        typingInput.value = '';
        
        // Update buttons
        document.getElementById('startBtn').disabled = true;
        
        // Start timer
        this.timer = setInterval(() => this.updateTimer(), 1000);
        
        this.playSound('start');
    }
    
    handleInput(e) {
        if (!this.isActive) return;
        
        const input = e.target.value;
        this.userInput = input;
        this.totalChars = input.length;
        
        this.updateTextDisplay();
        this.calculateStats();
        this.updateDisplay();
        
        // Check if test is complete
        if (input.length >= this.currentText.length) {
            this.endTest();
        }
    }
    
    updateTextDisplay() {
        const chars = document.querySelectorAll('.char');
        this.correctChars = 0;
        this.errors = 0;
        
        chars.forEach((char, index) => {
            char.className = 'char';
            
            if (index < this.userInput.length) {
                if (this.userInput[index] === this.currentText[index]) {
                    char.classList.add('correct');
                    this.correctChars++;
                } else {
                    char.classList.add('incorrect');
                    this.errors++;
                }
            } else if (index === this.userInput.length) {
                char.classList.add('current');
            }
        });
        
        // Update progress bar
        const progress = (this.userInput.length / this.currentText.length) * 100;
        document.getElementById('progressFill').style.width = `${progress}%`;
    }
    
    calculateStats() {
        if (!this.startTime) return;
        
        const timeElapsed = (new Date() - this.startTime) / 1000 / 60; // in minutes
        const wordsTyped = this.correctChars / 5; // Standard: 5 characters = 1 word
        const wpm = timeElapsed > 0 ? Math.round(wordsTyped / timeElapsed) : 0;
        const accuracy = this.totalChars > 0 ? Math.round((this.correctChars / this.totalChars) * 100) : 100;
        
        // Update real-time display
        document.getElementById('wpmDisplay').textContent = wpm;
        document.getElementById('accuracyDisplay').textContent = `${accuracy}%`;
        document.getElementById('charactersDisplay').textContent = this.totalChars;
        
        // Animate stats
        this.animateElement('wpmDisplay');
        this.animateElement('accuracyDisplay');
    }
    
    updateTimer() {
        this.timeLeft--;
        this.updateDisplay();
        
        if (this.timeLeft <= 0) {
            this.endTest();
        } else if (this.timeLeft <= 10) {
            this.playSound('warning');
        }
    }
    
    endTest() {
        this.isActive = false;
        this.endTime = new Date();
        
        // Clear timer
        clearInterval(this.timer);
        
        // Disable input
        document.getElementById('typingInput').disabled = true;
        
        // Calculate final stats
        const timeElapsed = (this.endTime - this.startTime) / 1000 / 60;
        const wordsTyped = this.correctChars / 5;
        const finalWPM = timeElapsed > 0 ? Math.round(wordsTyped / timeElapsed) : 0;
        const finalAccuracy = this.totalChars > 0 ? Math.round((this.correctChars / this.totalChars) * 100) : 100;
        
        // Update statistics
        this.updateGameStats(finalWPM, finalAccuracy);
        
        // Show results
        this.showResults(finalWPM, finalAccuracy);
        
        // Reset buttons
        document.getElementById('startBtn').disabled = false;
        
        this.playSound('complete');
    }
    
    resetTest() {
        this.isActive = false;
        this.startTime = null;
        this.endTime = null;
        this.currentIndex = 0;
        this.errors = 0;
        this.correctChars = 0;
        this.totalChars = 0;
        this.timeLeft = this.selectedTime;
        this.userInput = '';
        
        // Clear timer
        clearInterval(this.timer);
        
        // Reset input
        const typingInput = document.getElementById('typingInput');
        typingInput.value = '';
        typingInput.disabled = true;
        
        // Reset display
        this.renderText();
        this.updateDisplay();
        this.hideResults();
        
        // Reset buttons
        document.getElementById('startBtn').disabled = false;
        
        // Reset progress bar
        document.getElementById('progressFill').style.width = '0%';
        
        this.playSound('reset');
    }
    
    updateDisplay() {
        document.getElementById('timeDisplay').textContent = this.timeLeft;
        
        if (!this.isActive) {
            document.getElementById('wpmDisplay').textContent = '0';
            document.getElementById('accuracyDisplay').textContent = '100%';
            document.getElementById('charactersDisplay').textContent = '0';
        }
    }
    
    showResults(wpm, accuracy) {
        const overlay = document.getElementById('gameOverlay');
        
        document.getElementById('finalWPM').textContent = wpm;
        document.getElementById('finalAccuracy').textContent = `${accuracy}%`;
        document.getElementById('finalCharacters').textContent = this.totalChars;
        document.getElementById('finalErrors').textContent = this.errors;
        
        // Performance message
        const performanceMessage = document.getElementById('performanceMessage');
        if (wpm >= 80) {
            performanceMessage.textContent = '🚀 Exceptional! You\'re a typing master!';
        } else if (wpm >= 60) {
            performanceMessage.textContent = '⭐ Excellent! Your typing skills are impressive!';
        } else if (wpm >= 40) {
            performanceMessage.textContent = '👍 Good job! You\'re above average!';
        } else if (wpm >= 20) {
            performanceMessage.textContent = '📈 Not bad! Keep practicing to improve!';
        } else {
            performanceMessage.textContent = '💪 Keep going! Practice makes perfect!';
        }
        
        overlay.style.display = 'flex';
    }
    
    hideResults() {
        document.getElementById('gameOverlay').style.display = 'none';
    }
    
    updateGameStats(wpm, accuracy) {
        this.stats.testsCompleted++;
        this.stats.totalWPM += wpm;
        this.stats.totalAccuracy += accuracy;
        this.stats.averageWPM = Math.round(this.stats.totalWPM / this.stats.testsCompleted);
        this.stats.averageAccuracy = Math.round(this.stats.totalAccuracy / this.stats.testsCompleted);
        
        if (wpm > this.stats.bestWPM) {
            this.stats.bestWPM = wpm;
        }
        
        if (accuracy > this.stats.bestAccuracy) {
            this.stats.bestAccuracy = accuracy;
        }
        
        localStorage.setItem('typingStats', JSON.stringify(this.stats));
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
                case 'complete':
                    frequency = 800;
                    duration = 0.5;
                    waveType = 'square';
                    break;
                case 'warning':
                    frequency = 600;
                    duration = 0.1;
                    break;
                case 'reset':
                    frequency = 400;
                    duration = 0.15;
                    break;
                case 'error':
                    frequency = 200;
                    duration = 0.1;
                    waveType = 'sawtooth';
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

// Statistics Manager
class TypingStatistics {
    constructor(game) {
        this.game = game;
    }
    
    getDetailedStats() {
        return {
            ...this.game.stats,
            improvementRate: this.calculateImprovementRate(),
            consistency: this.calculateConsistency()
        };
    }
    
    calculateImprovementRate() {
        // Simple calculation based on recent performance vs average
        if (this.game.stats.testsCompleted < 2) return 0;
        
        const recentTests = Math.min(5, this.game.stats.testsCompleted);
        const improvementFactor = this.game.stats.bestWPM / Math.max(1, this.game.stats.averageWPM);
        return Math.round((improvementFactor - 1) * 100);
    }
    
    calculateConsistency() {
        // Measure how consistent the user's performance is
        const accuracyConsistency = Math.max(0, 100 - Math.abs(this.game.stats.bestAccuracy - this.game.stats.averageAccuracy));
        return Math.round(accuracyConsistency);
    }
    
    resetStats() {
        this.game.stats = {
            testsCompleted: 0,
            bestWPM: 0,
            bestAccuracy: 0,
            averageWPM: 0,
            totalWPM: 0,
            averageAccuracy: 0,
            totalAccuracy: 0
        };
        localStorage.setItem('typingStats', JSON.stringify(this.game.stats));
    }
    
    exportStats() {
        const stats = this.getDetailedStats();
        const dataStr = JSON.stringify(stats, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = 'typing-statistics.json';
        link.click();
    }
}

// Typing Tutor (bonus feature)
class TypingTutor {
    constructor(game) {
        this.game = game;
        this.lessons = {
            homeRow: 'asdf jkl; asdf jkl; aaa sss ddd fff jjj kkk lll ;;;',
            topRow: 'qwer tyui qwer tyui qqq www eee rrr ttt yyy uuu iii',
            bottomRow: 'zxcv bnm, zxcv bnm, zzz xxx ccc vvv bbb nnn mmm ,,,',
            numbers: '1234 5678 90 1234 5678 90 111 222 333 444 555 666',
            symbols: '!@#$ %^&* () !@#$ %^&* () !!! @@@ ### $$$ %%% ^^^'
        };
    }
    
    startLesson(lessonType) {
        if (this.lessons[lessonType]) {
            this.game.currentText = this.lessons[lessonType];
            this.game.renderText();
            this.game.resetTest();
        }
    }
    
    createLessonButtons() {
        const container = document.createElement('div');
        container.className = 'lesson-buttons';
        container.innerHTML = `
            <h4>Typing Lessons</h4>
            <div class="lesson-grid">
                <button class="btn btn-secondary lesson-btn" data-lesson="homeRow">Home Row</button>
                <button class="btn btn-secondary lesson-btn" data-lesson="topRow">Top Row</button>
                <button class="btn btn-secondary lesson-btn" data-lesson="bottomRow">Bottom Row</button>
                <button class="btn btn-secondary lesson-btn" data-lesson="numbers">Numbers</button>
                <button class="btn btn-secondary lesson-btn" data-lesson="symbols">Symbols</button>
            </div>
        `;
        
        // Add event listeners
        container.querySelectorAll('.lesson-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const lesson = e.target.dataset.lesson;
                this.startLesson(lesson);
            });
        });
        
        return container;
    }
}

// Real-time feedback system
class TypingFeedback {
    constructor(game) {
        this.game = game;
        this.lastAccuracy = 100;
        this.lastWPM = 0;
    }
    
    showFeedback() {
        const textDisplay = document.getElementById('textDisplay');
        let feedback = textDisplay.querySelector('.typing-feedback');
        
        if (!feedback) {
            feedback = document.createElement('div');
            feedback.className = 'typing-feedback';
            textDisplay.appendChild(feedback);
        }
        
        const currentWPM = parseInt(document.getElementById('wpmDisplay').textContent);
        const currentAccuracy = parseInt(document.getElementById('accuracyDisplay').textContent.replace('%', ''));
        
        if (currentAccuracy >= 95 && currentWPM > this.lastWPM) {
            feedback.textContent = 'Excellent!';
            feedback.className = 'typing-feedback good show';
        } else if (currentAccuracy < 80) {
            feedback.textContent = 'Focus on accuracy';
            feedback.className = 'typing-feedback bad show';
        } else {
            feedback.className = 'typing-feedback';
        }
        
        this.lastAccuracy = currentAccuracy;
        this.lastWPM = currentWPM;
        
        setTimeout(() => {
            feedback.classList.remove('show');
        }, 2000);
    }
}

// Initialize game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const game = new TypingSpeedTest();
    const statistics = new TypingStatistics(game);
    const tutor = new TypingTutor(game);
    const feedback = new TypingFeedback(game);
    
    // Override calculateStats to show real-time feedback
    const originalCalculateStats = game.calculateStats.bind(game);
    game.calculateStats = function() {
        originalCalculateStats();
        feedback.showFeedback();
    };
    
    // Add statistics button
    const statsBtn = document.createElement('button');
    statsBtn.className = 'btn btn-secondary';
    statsBtn.innerHTML = '<i class="fas fa-chart-bar"></i> Statistics';
    statsBtn.addEventListener('click', () => {
        const stats = statistics.getDetailedStats();
        alert(`Typing Statistics:
Tests Completed: ${stats.testsCompleted}
Best WPM: ${stats.bestWPM}
Average WPM: ${stats.averageWPM}
Best Accuracy: ${stats.bestAccuracy}%
Average Accuracy: ${stats.averageAccuracy}%
Improvement Rate: ${stats.improvementRate}%
Consistency: ${stats.consistency}%`);
    });
    
    document.querySelector('.game-controls').appendChild(statsBtn);
    
    // Add lesson buttons
    const lessonContainer = tutor.createLessonButtons();
    lessonContainer.style.cssText = `
        margin-top: 20px;
        padding: 20px;
        background: linear-gradient(135deg, #f7fafc, #edf2f7);
        border-radius: 12px;
        border: 1px solid #e2e8f0;
    `;
    
    const lessonGrid = lessonContainer.querySelector('.lesson-grid');
    lessonGrid.style.cssText = `
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
        gap: 10px;
        margin-top: 15px;
    `;
    
    document.querySelector('.game-container').appendChild(lessonContainer);
    
    console.log('⌨️ Typing Speed Test initialized!');
    console.log('💡 Use Tab to generate new text, Escape to reset');
}); 