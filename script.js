class TennisGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.gameRunning = false;
        
        // ゲームモード管理
        this.gameMode = 'multiplayer'; // 'singleplayer' or 'multiplayer'
        this.difficulty = 'normal'; // 'easy', 'normal', 'hard'
        this.currentScreen = 'modeSelection'; // 'modeSelection', 'game'
        
        // 効果音用のAudioContext
        this.audioContext = null;
        this.initAudio();
        
        // ゲーム要素
        this.ball = {
            x: this.canvas.width / 2,
            y: this.canvas.height / 2,
            dx: 5,
            dy: 3,
            radius: 8
        };
        
        this.player1 = {
            x: 20,
            y: this.canvas.height / 2 - 50,
            width: 10,
            height: 100,
            dy: 0,
            speed: 8
        };
        
        this.player2 = {
            x: this.canvas.width - 30,
            y: this.canvas.height / 2 - 50,
            width: 10,
            height: 100,
            dy: 0,
            speed: 8
        };
        
        this.score = {
            player1: 0,
            player2: 0
        };
        
        this.keys = {};
        this.initEventListeners();
        this.initUI();
        this.draw();
    }
    
    initUI() {
        // 初期画面をモード選択に設定
        this.showModeSelection();
    }
    
    showModeSelection() {
        const modeSelection = document.getElementById('modeSelection');
        const gameScreen = document.getElementById('gameScreen');
        
        if (modeSelection) {
            modeSelection.classList.remove('hidden');
        }
        if (gameScreen) {
            gameScreen.classList.add('hidden');
        }
        this.currentScreen = 'modeSelection';
    }
    
    showGameScreen() {
        const modeSelection = document.getElementById('modeSelection');
        const difficultySelection = document.getElementById('difficultySelection');
        const gameScreen = document.getElementById('gameScreen');
        
        if (modeSelection) {
            modeSelection.classList.add('hidden');
        }
        if (difficultySelection) {
            difficultySelection.classList.add('hidden');
        }
        if (gameScreen) {
            gameScreen.classList.remove('hidden');
        }
        this.currentScreen = 'game';
        this.updateModeDisplay();
    }
    
    showDifficultySelection() {
        const modeSelection = document.getElementById('modeSelection');
        const difficultySelection = document.getElementById('difficultySelection');
        
        if (modeSelection) {
            const modeButtons = modeSelection.querySelector('.mode-buttons');
            if (modeButtons) {
                modeButtons.style.display = 'none';
            }
        }
        if (difficultySelection) {
            difficultySelection.classList.remove('hidden');
        }
    }
    
    hideDifficultySelection() {
        const modeSelection = document.getElementById('modeSelection');
        const difficultySelection = document.getElementById('difficultySelection');
        
        if (modeSelection) {
            const modeButtons = modeSelection.querySelector('.mode-buttons');
            if (modeButtons) {
                modeButtons.style.display = 'flex';
            }
        }
        if (difficultySelection) {
            difficultySelection.classList.add('hidden');
        }
    }
    
    updateModeDisplay() {
        const modeText = this.gameMode === 'singleplayer' ? '一人プレイ (vs CPU)' : '二人プレイ';
        const currentModeText = document.getElementById('currentModeText');
        if (currentModeText) {
            currentModeText.textContent = modeText;
        }
        
        const controlsText = this.gameMode === 'singleplayer' 
            ? 'プレイヤー: W/S キー　CPU: 自動操作'
            : 'プレイヤー1: W/S キー　プレイヤー2: ↑/↓ キー';
        const controlsElement = document.getElementById('controlsText');
        if (controlsElement) {
            controlsElement.textContent = controlsText;
        }
    }
    
    initAudio() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        } catch (e) {
            console.warn('Web Audio API not supported');
        }
    }
    
    // パドルヒット音を生成
    playPaddleHitSound() {
        if (!this.audioContext) return;
        
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.frequency.setValueAtTime(400, this.audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(200, this.audioContext.currentTime + 0.1);
        
        gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.1);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + 0.1);
    }
    
    // 得点音を生成
    playScoreSound() {
        if (!this.audioContext) return;
        
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.frequency.setValueAtTime(523, this.audioContext.currentTime);
        oscillator.frequency.setValueAtTime(659, this.audioContext.currentTime + 0.1);
        oscillator.frequency.setValueAtTime(784, this.audioContext.currentTime + 0.2);
        
        gainNode.gain.setValueAtTime(0.4, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.3);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + 0.3);
    }
    
    // 勝利音を生成
    playWinSound() {
        if (!this.audioContext) return;
        
        const frequencies = [523, 659, 784, 1047];
        frequencies.forEach((freq, index) => {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            oscillator.frequency.setValueAtTime(freq, this.audioContext.currentTime);
            
            const startTime = this.audioContext.currentTime + index * 0.15;
            gainNode.gain.setValueAtTime(0, startTime);
            gainNode.gain.linearRampToValueAtTime(0.3, startTime + 0.05);
            gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + 0.4);
            
            oscillator.start(startTime);
            oscillator.stop(startTime + 0.4);
        });
    }
    
    initEventListeners() {
        // キーボードイベント
        document.addEventListener('keydown', (e) => {
            this.keys[e.key] = true;
        });
        
        document.addEventListener('keyup', (e) => {
            this.keys[e.key] = false;
        });
        
        // モード選択イベント
        const singlePlayerBtn = document.getElementById('singlePlayerBtn');
        const multiPlayerBtn = document.getElementById('multiPlayerBtn');
        
        if (singlePlayerBtn) {
            singlePlayerBtn.addEventListener('click', () => {
                this.showDifficultySelection();
            });
        }
        
        if (multiPlayerBtn) {
            multiPlayerBtn.addEventListener('click', () => {
                this.gameMode = 'multiplayer';
                this.showGameScreen();
            });
        }
        
        // 難易度選択イベント
        const easyBtn = document.getElementById('easyBtn');
        const normalBtn = document.getElementById('normalBtn');
        const hardBtn = document.getElementById('hardBtn');
        const backToModeBtn = document.getElementById('backToModeBtn');
        
        if (easyBtn) {
            easyBtn.addEventListener('click', () => {
                this.selectDifficulty('easy');
            });
        }
        
        if (normalBtn) {
            normalBtn.addEventListener('click', () => {
                this.selectDifficulty('normal');
            });
        }
        
        if (hardBtn) {
            hardBtn.addEventListener('click', () => {
                this.selectDifficulty('hard');
            });
        }
        
        if (backToModeBtn) {
            backToModeBtn.addEventListener('click', () => {
                this.hideDifficultySelection();
            });
        }
        
        // ゲーム画面イベント
        const startButton = document.getElementById('startButton');
        const resetButton = document.getElementById('resetButton');
        const playAgainButton = document.getElementById('playAgainButton');
        const backToMenuBtn = document.getElementById('backToMenuBtn');
        const changeModeBtn = document.getElementById('changeModeBtn');
        
        if (startButton) {
            startButton.addEventListener('click', () => {
                this.startGame();
            });
        }
        
        if (resetButton) {
            resetButton.addEventListener('click', () => {
                this.resetGame();
            });
        }
        
        if (playAgainButton) {
            playAgainButton.addEventListener('click', () => {
                this.resetGame();
                this.startGame();
            });
        }
        
        if (backToMenuBtn) {
            backToMenuBtn.addEventListener('click', () => {
                this.resetGame();
                this.showModeSelection();
            });
        }
        
        if (changeModeBtn) {
            changeModeBtn.addEventListener('click', () => {
                this.resetGame();
                this.showModeSelection();
            });
        }
    }
    
    selectDifficulty(difficulty) {
        this.difficulty = difficulty;
        this.gameMode = 'singleplayer';
        
        // 難易度ボタンの選択状態を更新
        const difficultyBtns = document.querySelectorAll('.difficulty-btn');
        difficultyBtns.forEach(btn => {
            btn.classList.remove('selected');
        });
        
        const selectedBtn = document.getElementById(difficulty + 'Btn');
        if (selectedBtn) {
            selectedBtn.classList.add('selected');
        }
        
        // 少し遅延してからゲーム画面に移行
        setTimeout(() => {
            this.showGameScreen();
        }, 500);
    }
    
    updateCPUPlayer() {
        // CPU AIの動作パラメータ（難易度に応じて調整）
        let cpuSpeed, reactionDelay, accuracy;
        
        switch (this.difficulty) {
            case 'easy':
                cpuSpeed = 4;
                reactionDelay = 0.8;
                accuracy = 0.7;
                break;
            case 'normal':
                cpuSpeed = 6;
                reactionDelay = 0.6;
                accuracy = 0.85;
                break;
            case 'hard':
                cpuSpeed = 8;
                reactionDelay = 0.4;
                accuracy = 0.95;
                break;
        }
        
        
        // ボールとの距離を考慮した予測位置
        const ballDistanceToPlayer2 = this.canvas.width - this.ball.x;
        const timeToReachPlayer2 = ballDistanceToPlayer2 / Math.abs(this.ball.dx);
        
        // ボールの予測位置（簡単な線形予測）
        let predictedBallY = this.ball.y;
        if (this.ball.dx > 0) { // ボールがCPUの方向に向かっている場合
            predictedBallY = this.ball.y + (this.ball.dy * timeToReachPlayer2 * reactionDelay);
        }
        
        // 精度を適用（完璧でない動きをシミュレート）
        const randomOffset = (Math.random() - 0.5) * (1 - accuracy) * 100;
        predictedBallY += randomOffset;
        
        // CPUの動作決定
        const targetY = predictedBallY - this.player2.height / 2;
        const currentY = this.player2.y;
        const diff = targetY - currentY;
        
        // デッドゾーン（小さな差は無視）
        const deadZone = 20;
        
        if (Math.abs(diff) > deadZone) {
            if (diff > 0) {
                this.player2.dy = cpuSpeed;
            } else {
                this.player2.dy = -cpuSpeed;
            }
        } else {
            this.player2.dy = 0;
        }
        
        // ボールがCPUから離れている時は中央に戻る傾向
        if (this.ball.dx < 0) {
            const centerY = this.canvas.height / 2 - this.player2.height / 2;
            const centerDiff = centerY - currentY;
            
            if (Math.abs(centerDiff) > 50) {
                this.player2.dy = centerDiff > 0 ? cpuSpeed * 0.3 : -cpuSpeed * 0.3;
            }
        }
    }
    
    startGame() {
        if (!this.gameRunning) {
            // AudioContextをユーザーインタラクション後に有効化
            if (this.audioContext && this.audioContext.state === 'suspended') {
                this.audioContext.resume();
            }
            this.gameRunning = true;
            this.gameLoop();
        }
    }
    
    resetGame() {
        this.gameRunning = false;
        this.ball.x = this.canvas.width / 2;
        this.ball.y = this.canvas.height / 2;
        this.ball.dx = Math.random() > 0.5 ? 5 : -5;
        this.ball.dy = (Math.random() - 0.5) * 6;
        
        this.player1.y = this.canvas.height / 2 - 50;
        this.player2.y = this.canvas.height / 2 - 50;
        
        this.score.player1 = 0;
        this.score.player2 = 0;
        
        this.updateScore();
        this.hideGameOver();
        this.draw();
    }
    
    update() {
        if (!this.gameRunning) return;
        
        // プレイヤー1の移動 (W/S キー)
        if (this.keys['w'] || this.keys['W']) {
            this.player1.dy = -this.player1.speed;
        } else if (this.keys['s'] || this.keys['S']) {
            this.player1.dy = this.player1.speed;
        } else {
            this.player1.dy = 0;
        }
        
        // プレイヤー2の移動 (二人プレイ時は矢印キー、一人プレイ時はCPU)
        if (this.gameMode === 'multiplayer') {
            if (this.keys['ArrowUp']) {
                this.player2.dy = -this.player2.speed;
            } else if (this.keys['ArrowDown']) {
                this.player2.dy = this.player2.speed;
            } else {
                this.player2.dy = 0;
            }
        } else {
            // CPU AIの動作
            this.updateCPUPlayer();
        }
        
        // パドルの位置更新
        this.player1.y += this.player1.dy;
        this.player2.y += this.player2.dy;
        
        // パドルの境界チェック
        this.player1.y = Math.max(0, Math.min(this.canvas.height - this.player1.height, this.player1.y));
        this.player2.y = Math.max(0, Math.min(this.canvas.height - this.player2.height, this.player2.y));
        
        // ボールの移動
        this.ball.x += this.ball.dx;
        this.ball.y += this.ball.dy;
        
        // 上下の境界での反射
        if (this.ball.y <= this.ball.radius || this.ball.y >= this.canvas.height - this.ball.radius) {
            this.ball.dy = -this.ball.dy;
        }
        
        // パドルとの衝突判定
        this.checkPaddleCollision();
        
        // スコア判定
        if (this.ball.x < 0) {
            this.score.player2++;
            this.playScoreSound();
            this.resetBall();
        } else if (this.ball.x > this.canvas.width) {
            this.score.player1++;
            this.playScoreSound();
            this.resetBall();
        }
        
        this.updateScore();
        
        // ゲーム終了判定
        if (this.score.player1 >= 5 || this.score.player2 >= 5) {
            this.endGame();
        }
    }
    
    checkPaddleCollision() {
        // プレイヤー1のパドルとの衝突
        if (this.ball.x - this.ball.radius <= this.player1.x + this.player1.width &&
            this.ball.x + this.ball.radius >= this.player1.x &&
            this.ball.y >= this.player1.y &&
            this.ball.y <= this.player1.y + this.player1.height &&
            this.ball.dx < 0) {
            
            this.ball.dx = Math.abs(this.ball.dx);
            // パドルの位置に応じてボールの角度を変更
            let paddleCenter = this.player1.y + this.player1.height / 2;
            let hitPos = (this.ball.y - paddleCenter) / (this.player1.height / 2);
            this.ball.dy = hitPos * 5;
            this.playPaddleHitSound();
        }
        
        // プレイヤー2のパドルとの衝突
        if (this.ball.x + this.ball.radius >= this.player2.x &&
            this.ball.x - this.ball.radius <= this.player2.x + this.player2.width &&
            this.ball.y >= this.player2.y &&
            this.ball.y <= this.player2.y + this.player2.height &&
            this.ball.dx > 0) {
            
            this.ball.dx = -Math.abs(this.ball.dx);
            // パドルの位置に応じてボールの角度を変更
            let paddleCenter = this.player2.y + this.player2.height / 2;
            let hitPos = (this.ball.y - paddleCenter) / (this.player2.height / 2);
            this.ball.dy = hitPos * 5;
            this.playPaddleHitSound();
        }
    }
    
    resetBall() {
        this.ball.x = this.canvas.width / 2;
        this.ball.y = this.canvas.height / 2;
        this.ball.dx = Math.random() > 0.5 ? 5 : -5;
        this.ball.dy = (Math.random() - 0.5) * 6;
    }
    
    updateScore() {
        document.querySelector('.player1-score').textContent = this.score.player1;
        document.querySelector('.player2-score').textContent = this.score.player2;
    }
    
    endGame() {
        this.gameRunning = false;
        let winner;
        
        if (this.gameMode === 'singleplayer') {
            winner = this.score.player1 >= 5 ? 'プレイヤーの勝利！' : 'CPUの勝利！';
        } else {
            winner = this.score.player1 >= 5 ? 'プレイヤー1の勝利！' : 'プレイヤー2の勝利！';
        }
        
        document.getElementById('winner').textContent = winner;
        this.playWinSound();
        this.showGameOver();
    }
    
    showGameOver() {
        document.getElementById('gameOver').classList.remove('hidden');
    }
    
    hideGameOver() {
        document.getElementById('gameOver').classList.add('hidden');
    }
    
    draw() {
        // 背景をクリア
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 中央線を描画
        this.ctx.setLineDash([5, 5]);
        this.ctx.strokeStyle = '#444';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.moveTo(this.canvas.width / 2, 0);
        this.ctx.lineTo(this.canvas.width / 2, this.canvas.height);
        this.ctx.stroke();
        this.ctx.setLineDash([]);
        
        // プレイヤー1のパドル
        this.ctx.fillStyle = '#00ff00';
        this.ctx.fillRect(this.player1.x, this.player1.y, this.player1.width, this.player1.height);
        
        // プレイヤー2のパドル
        this.ctx.fillStyle = '#00ff00';
        this.ctx.fillRect(this.player2.x, this.player2.y, this.player2.width, this.player2.height);
        
        // ボール
        this.ctx.fillStyle = '#fff';
        this.ctx.beginPath();
        this.ctx.arc(this.ball.x, this.ball.y, this.ball.radius, 0, Math.PI * 2);
        this.ctx.fill();
    }
    
    gameLoop() {
        if (this.gameRunning) {
            this.update();
            this.draw();
            requestAnimationFrame(() => this.gameLoop());
        }
    }
}

// ゲーム初期化
window.addEventListener('load', () => {
    new TennisGame();
});