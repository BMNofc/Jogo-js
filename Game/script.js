const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Dimensões do jogo
const canvasWidth = canvas.width;
const canvasHeight = canvas.height;

// Configurações do jogador
const playerCarWidth = 50;
const playerCarHeight = 80;
let playerCarX = (canvasWidth - playerCarWidth) / 2;
let playerCarY = canvasHeight - playerCarHeight - 10;
const playerCarSpeed = 5;

// Configurações dos carros inimigos
const enemyCarWidth = 50;
const enemyCarHeight = 80;
const enemyCarSpeed = 3;
let enemyCars = [];
const enemySpawnInterval = 1000; // 1 segundo
let lastEnemySpawnTime = 0;

// Configurações do jogo
let score = 0;
let gameOver = false;

// Eventos de teclado
let rightPressed = false;
let leftPressed = false;

document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') {
        rightPressed = true;
    } else if (e.key === 'ArrowLeft') {
        leftPressed = true;
    }
});

document.addEventListener('keyup', (e) => {
    if (e.key === 'ArrowRight') {
        rightPressed = false;
    } else if (e.key === 'ArrowLeft') {
        leftPressed = false;
    }
});

// Desenha o carro do jogador
function drawPlayerCar() {
    ctx.fillStyle = 'blue';
    ctx.fillRect(playerCarX, playerCarY, playerCarWidth, playerCarHeight);
}

// Desenha os carros inimigos
function drawEnemyCars() {
    ctx.fillStyle = 'red';
    enemyCars.forEach(car => {
        ctx.fillRect(car.x, car.y, enemyCarWidth, enemyCarHeight);
    });
}

// Atualiza a posição dos carros inimigos e remove os que saem da tela
function updateEnemyCars() {
    enemyCars.forEach(car => {
        car.y += enemyCarSpeed;
    });

    enemyCars = enemyCars.filter(car => car.y < canvasHeight);
}

// Verifica colisão
function checkCollision() {
    enemyCars.forEach(car => {
        if (
            playerCarX < car.x + enemyCarWidth &&
            playerCarX + playerCarWidth > car.x &&
            playerCarY < car.y + enemyCarHeight &&
            playerCarY + playerCarHeight > car.y
        ) {
            gameOver = true;
        }
    });
}

// Adiciona um novo carro inimigo
function spawnEnemyCar() {
    const randomX = Math.random() * (canvasWidth - enemyCarWidth);
    enemyCars.push({ x: randomX, y: -enemyCarHeight });
}

// Desenha a pontuação
function drawScore() {
    ctx.fillStyle = '#fff';
    ctx.font = '20px Arial';
    ctx.fillText('Pontos: ' + score, 10, 30);
}

// Loop principal do jogo
function gameLoop(timestamp) {
    if (gameOver) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);
        ctx.fillStyle = '#fff';
        ctx.font = '40px Arial';
        ctx.fillText('Game Over', canvasWidth / 2 - 100, canvasHeight / 2);
        ctx.font = '20px Arial';
        ctx.fillText('Pontuação final: ' + score, canvasWidth / 2 - 80, canvasHeight / 2 + 40);
        return;
    }

    // Limpa o canvas
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    // Movimento do jogador
    if (rightPressed && playerCarX < canvasWidth - playerCarWidth) {
        playerCarX += playerCarSpeed;
    } else if (leftPressed && playerCarX > 0) {
        playerCarX -= playerCarSpeed;
    }

    // Gerar novos carros inimigos
    if (timestamp - lastEnemySpawnTime > enemySpawnInterval) {
        spawnEnemyCar();
        lastEnemySpawnTime = timestamp;
        score += 10;
    }

    // Atualiza e desenha
    updateEnemyCars();
    drawEnemyCars();
    drawPlayerCar();
    checkCollision();
    drawScore();

    requestAnimationFrame(gameLoop);
}

// Inicia o jogo
gameLoop(0);