const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const canvasWidth = canvas.width;
const canvasHeight = canvas.height;

// --- Estados do Jogo ---
const GAME_STATE = {
    MENU: 'menu',
    PLAYING: 'playing',
    GAME_OVER: 'gameOver'
};
let currentState = GAME_STATE.MENU;

// --- Configurações do Jogo ---
const GRAVITY = 0.2;
const MAX_SPEED = 6;
const ACCELERATION = 0.08;
const DRAG = 0.98; // Atrito/arrasto

// --- Configurações do Terreno Infinito ---
let terrainPoints = [];
const TERRAIN_SEGMENTS = 25;
const TERRAIN_AMPLITUDE = 120;
const TERRAIN_SMOOTHNESS = 40;
let lastTerrainX = 0;

// --- Configurações do Carro ---
const car = {
    x: 100,
    y: 100,
    width: 60,
    height: 25,
    speed: 0,
    angle: 0,
    enginePower: 0.15,
    wheelRadius: 10
};

// --- Câmera e Pontuação ---
let cameraOffset = 0;
let distance = 0;
let lastFrameTime = 0;

// --- Controles de Teclado ---
let keys = {
    ArrowRight: false,
    ArrowLeft: false,
};

document.addEventListener('keydown', (e) => {
    if (keys.hasOwnProperty(e.key)) {
        keys[e.key] = true;
    }
});

document.addEventListener('keyup', (e) => {
    if (keys.hasOwnProperty(e.key)) {
        keys[e.key] = false;
    }
});

// --- Lógica de Transição de Estados ---

function startGame() {
    // Resetar o jogo
    terrainPoints = [];
    lastTerrainX = 0;
    car.x = 100;
    car.y = 100;
    car.speed = 0;
    car.angle = 0;
    distance = 0;
    cameraOffset = 0;
    generateTerrain(TERRAIN_SEGMENTS);
    currentState = GAME_STATE.PLAYING;
    gameLoop();
}

canvas.addEventListener('click', () => {
    if (currentState !== GAME_STATE.PLAYING) {
        startGame();
    }
});

// --- Funções de Terreno ---

function generateTerrain(numSegments) {
    if (terrainPoints.length > 0) {
        lastTerrainX = terrainPoints[terrainPoints.length - 1].x;
    }
    
    let lastY = terrainPoints.length > 0 ? terrainPoints[terrainPoints.length - 1].y : canvasHeight / 2;
    
    for (let i = 0; i < numSegments; i++) {
        const x = lastTerrainX + (canvasWidth / (TERRAIN_SEGMENTS - 1));
        lastY += (Math.random() - 0.5) * TERRAIN_AMPLITUDE;
        
        if (lastY > canvasHeight - 50) lastY = canvasHeight - 50;
        if (lastY < canvasHeight / 3) lastY = canvasHeight / 3;
        
        terrainPoints.push({ x, y: lastY });
        lastTerrainX = x;
    }
}

function getTerrainY(x) {
    while (terrainPoints[0] && terrainPoints[0].x < x - canvasWidth / 2) {
        terrainPoints.shift();
    }
    
    const segmentWidth = canvasWidth / (TERRAIN_SEGMENTS - 1);
    const segment = Math.floor((x - terrainPoints[0].x) / segmentWidth);
    const p1 = terrainPoints[segment];
    const p2 = terrainPoints[segment + 1];

    if (!p1 || !p2) {
        return terrainPoints[terrainPoints.length - 1].y;
    }

    const t = (x - p1.x) / (p2.x - p1.x);
    return p1.y * (1 - t) + p2.y * t;
}

// --- Funções de Desenho ---

function drawTerrain() {
    ctx.beginPath();
    ctx.strokeStyle = '#555';
    ctx.lineWidth = 4;
    ctx.fillStyle = '#8B4513';
    
    ctx.moveTo(terrainPoints[0].x - cameraOffset, canvasHeight);
    
    for (let i = 0; i < terrainPoints.length; i++) {
        const p = terrainPoints[i];
        ctx.lineTo(p.x - cameraOffset, p.y);
    }
    
    ctx.lineTo(terrainPoints[terrainPoints.length - 1].x - cameraOffset, canvasHeight);
    ctx.closePath();
    
    ctx.fill();
    ctx.stroke();
}

function drawCar() {
    ctx.save();
    ctx.translate(car.x - cameraOffset, car.y);
    ctx.rotate(car.angle);
    ctx.fillStyle = 'blue';
    ctx.fillRect(-car.width / 2, -car.height / 2, car.width, car.height);
    
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(-car.width / 2, car.height / 2, car.wheelRadius, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.beginPath();
    ctx.arc(car.width / 2, car.height / 2, car.wheelRadius, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
}

function drawScore() {
    ctx.fillStyle = '#fff';
    ctx.font = '24px Arial';
    ctx.fillText(`Distância: ${Math.floor(distance)}m`, 10, 30);
}

function drawMenu() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    ctx.fillStyle = '#fff';
    ctx.font = '40px Arial';
    ctx.fillText('Hill Climb Racing', canvasWidth / 2 - 170, canvasHeight / 2 - 50);
    ctx.font = '24px Arial';
    ctx.fillText('Clique para começar', canvasWidth / 2 - 120, canvasHeight / 2 + 20);
}

function drawGameOver() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    ctx.fillStyle = '#fff';
    ctx.font = '40px Arial';
    ctx.fillText('Game Over', canvasWidth / 2 - 100, canvasHeight / 2 - 50);
    ctx.font = '24px Arial';
    ctx.fillText(`Distância final: ${Math.floor(distance)}m`, canvasWidth / 2 - 120, canvasHeight / 2 + 20);
    ctx.fillText('Clique para reiniciar', canvasWidth / 2 - 110, canvasHeight / 2 + 60);
}

// --- Loop Principal do Jogo ---

function gameLoop(timestamp) {
    const deltaTime = timestamp - lastFrameTime;
    lastFrameTime = timestamp;

    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    if (currentState === GAME_STATE.PLAYING) {
        // Lógica de Movimento do Carro
        if (keys.ArrowRight) {
            car.speed += car.enginePower;
        } else if (keys.ArrowLeft) {
            car.speed -= car.enginePower;
        } else {
            car.speed *= DRAG;
        }

        if (car.speed > MAX_SPEED) car.speed = MAX_SPEED;
        if (car.speed < -MAX_SPEED) car.speed = -MAX_SPEED;

        // Movimento do carro com base na física
        car.x += car.speed * Math.cos(car.angle);
        car.y += car.speed * Math.sin(car.angle) + GRAVITY;

        // Verificação de colisão com o terreno
        const terrainY = getTerrainY(car.x);
        if (car.y + car.height / 2 > terrainY) {
            car.y = terrainY - car.height / 2;
            
            // Simulação de "tombo" se o ângulo for muito inclinado
            if (Math.abs(car.angle) > Math.PI / 2.5) {
                currentState = GAME_STATE.GAME_OVER;
            } else {
                car.speed *= 0.95; // Atrito com o solo
            }
        }

        // Atualiza o ângulo do carro
        const nextTerrainY = getTerrainY(car.x + 10);
        const prevTerrainY = getTerrainY(car.x - 10);
        car.angle = Math.atan2(nextTerrainY - prevTerrainY, 20);

        // Atualiza a câmera e a distância percorrida
        cameraOffset = car.x - canvasWidth / 2;
        distance = car.x / 50;

        // Gerar mais terreno se necessário
        if (car.x > lastTerrainX - canvasWidth) {
            generateTerrain(10);
        }

        // Desenha os elementos do jogo
        drawTerrain();
        drawCar();
        drawScore();

        // Loop de animação
        if (currentState === GAME_STATE.PLAYING) {
            requestAnimationFrame(gameLoop);
        }
    } else if (currentState === GAME_STATE.MENU) {
        drawMenu();
        requestAnimationFrame(gameLoop);
    } else if (currentState === GAME_STATE.GAME_OVER) {
        drawGameOver();
        requestAnimationFrame(gameLoop);
    }
}

// Inicia o jogo no estado de menu
gameLoop(0);
