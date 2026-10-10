const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const startScreen = document.getElementById('start-screen');
const gameOverScreen = document.getElementById('game-over-screen');
const startBtn = document.getElementById('start-btn');
const restartBtn = document.getElementById('restart-btn');
const finalScoreEl = document.getElementById('final-score');
const highScoreEl = document.getElementById('high-score');

// Configuração do Canvas Responsivo
function resizeCanvas() {
    canvas.width = canvas.parentElement.clientWidth;
    canvas.height = canvas.parentElement.clientHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// Estado do Jogo
let gameState = 'START'; // START, PLAYING, GAMEOVER
let score = 0;
let highScore = localStorage.getItem('neon_rush_highscore') || 0;
let gameSpeed = 4;
let frameCount = 0;

// Jogador
const player = {
    x: 60,
    y: 0,
    size: 24,
    vy: 0,
    gravity: 0.6,
    jumpPower: -10,
    groundY: 0,
    isGrounded: false,
    
    reset() {
        this.groundY = canvas.height - 80;
        this.y = this.groundY - this.size;
        this.vy = 0;
        this.isGrounded = true;
    },
    
    jump() {
        if (gameState === 'PLAYING') {
            this.vy = this.jumpPower;
            this.isGrounded = false;
        }
    },
    
    update() {
        this.vy += this.gravity;
        this.y += this.vy;

        // Colisão com o Chão
        if (this.y + this.size >= this.groundY) {
            this.y = this.groundY - this.size;
            this.vy = 0;
            this.isGrounded = true;
        }
    },
    
    draw() {
        ctx.shadowBlur = 15;
        ctx.shadowColor = '#00f3ff';
        ctx.fillStyle = '#00f3ff';
        ctx.fillRect(this.x, this.y, this.size, this.size);
        ctx.shadowBlur = 0; // Reset
    }
};

// Obstáculos
let obstacles = [];

function createObstacle() {
    const height = Math.floor(Math.random() * 30) + 30;
    obstacles.push({
        x: canvas.width,
        width: 20,
        height: height,
        passed: false
    });
}

function updateObstacles() {
    if (frameCount % Math.max(40, Math.floor(100 - gameSpeed * 3)) === 0) {
        createObstacle();
    }

    for (let i = obstacles.length - 1; i >= 0; i--) {
        let obs = obstacles[i];
        obs.x -= gameSpeed;

        // Checar Colisão
        if (
            player.x < obs.x + obs.width &&
            player.x + player.size > obs.x &&
            player.y < player.groundY &&
            player.y + player.size > player.groundY - obs.height
        ) {
            endGame();
        }

        // Incrementar Pontuação
        if (!obs.passed && obs.x + obs.width < player.x) {
            score++;
            obs.passed = true;
            if (score % 5 === 0) gameSpeed += 0.5; // Aumenta dificuldade
        }

        // Remover obstáculos fora da tela
        if (obs.x + obs.width < 0) {
            obstacles.splice(i, 1);
        }
    }
}

function drawObstacles() {
    ctx.shadowBlur = 12;
    ctx.shadowColor = '#ff0055';
    ctx.fillStyle = '#ff0055';
    
    obstacles.forEach(obs => {
        ctx.fillRect(obs.x, player.groundY - obs.height, obs.width, obs.height);
    });
    
    ctx.shadowBlur = 0;
}

// Linha do Chão Neon
function drawEnvironment() {
    ctx.strokeStyle = '#390099';
    ctx.lineWidth = 4;
    ctx.shadowBlur = 10;
    ctx.shadowColor = '#390099';
    
    ctx.beginPath();
    ctx.moveTo(0, player.groundY);
    ctx.lineTo(canvas.width, player.groundY);
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Placar durante a partida
    if (gameState === 'PLAYING') {
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 24px sans-serif';
        ctx.fillText(`SCORE: ${score}`, 20, 40);
    }
}

// Ciclo Principal (Game Loop)
function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (gameState === 'PLAYING') {
        frameCount++;
        player.update();
        updateObstacles();
    }

    drawEnvironment();
    player.draw();
    drawObstacles();

    requestAnimationFrame(gameLoop);
}

// Fluxo do Jogo
function startGame() {
    score = 0;
    gameSpeed = 5;
    obstacles = [];
    frameCount = 0;
    player.reset();
    gameState = 'PLAYING';
    
    startScreen.classList.add('hidden');
    gameOverScreen.classList.add('hidden');
}

function endGame() {
    gameState = 'GAMEOVER';
    if (score > highScore) {
        highScore = score;
        localStorage.setItem('neon_rush_highscore', highScore);
    }
    
    finalScoreEl.textContent = score;
    highScoreEl.textContent = highScore;
    gameOverScreen.classList.remove('hidden');
}

// Eventos de Controle (Toque na Tela e Botões)
window.addEventListener('touchstart', (e) => {
    // Evita pulo se o clique for nos botões da interface
    if (e.target.tagName !== 'BUTTON') {
        player.jump();
    }
});

window.addEventListener('keydown', (e) => {
    if (e.code === 'Space' || e.code === 'ArrowUp') {
        player.jump();
    }
});

startBtn.addEventListener('click', startGame);
restartBtn.addEventListener('click', startGame);

// Inicializa Posição Inicial
player.reset();
gameLoop();
