class TennisGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.gameRunning = false;
        
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
        this.draw();
    }
    
    initEventListeners() {
        // キーボードイベント
        document.addEventListener('keydown', (e) => {
            this.keys[e.key] = true;
        });
        
        document.addEventListener('keyup', (e) => {
            this.keys[e.key] = false;
        });
        
        // ボタンイベント
        document.getElementById('startButton').addEventListener('click', () => {
            this.startGame();
        });
        
        document.getElementById('resetButton').addEventListener('click', () => {
            this.resetGame();
        });
        
        document.getElementById('playAgainButton').addEventListener('click', () => {
            this.resetGame();
            this.startGame();
        });
    }
    
    startGame() {
        if (!this.gameRunning) {
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
        
        // プレイヤー2の移動 (矢印キー)
        if (this.keys['ArrowUp']) {
            this.player2.dy = -this.player2.speed;
        } else if (this.keys['ArrowDown']) {
            this.player2.dy = this.player2.speed;
        } else {
            this.player2.dy = 0;
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
            this.resetBall();
        } else if (this.ball.x > this.canvas.width) {
            this.score.player1++;
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
            this.ball.y <= this.player1.y + this.player1.height) {
            
            this.ball.dx = Math.abs(this.ball.dx);
            // パドルの位置に応じてボールの角度を変更
            let paddleCenter = this.player1.y + this.player1.height / 2;
            let hitPos = (this.ball.y - paddleCenter) / (this.player1.height / 2);
            this.ball.dy = hitPos * 5;
        }
        
        // プレイヤー2のパドルとの衝突
        if (this.ball.x + this.ball.radius >= this.player2.x &&
            this.ball.x - this.ball.radius <= this.player2.x + this.player2.width &&
            this.ball.y >= this.player2.y &&
            this.ball.y <= this.player2.y + this.player2.height) {
            
            this.ball.dx = -Math.abs(this.ball.dx);
            // パドルの位置に応じてボールの角度を変更
            let paddleCenter = this.player2.y + this.player2.height / 2;
            let hitPos = (this.ball.y - paddleCenter) / (this.player2.height / 2);
            this.ball.dy = hitPos * 5;
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
        let winner = this.score.player1 >= 5 ? 'プレイヤー1の勝利！' : 'プレイヤー2の勝利！';
        document.getElementById('winner').textContent = winner;
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