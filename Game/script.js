const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const canvasWidth = canvas.width;
const canvasHeight = canvas.height;

// --- Configurações do Jogo ---
const GRAVITY = 0.2;
const MAX_SPEED = 5;
const ACCELERATION = 0.05;
const FRICTION = 0.01;

// --- Configurações do Terreno ---
let terrainPoints = [];
const TERRAIN_SEGMENTS = 20;
const TERRAIN_AMPLITUDE = 100;
const TERRAIN_SMOOTHNESS = 40;

// --- Configurações do Carro ---
const car = {
    x: 100,
    y: 100,
    width: 60,
    height: 25,
    speed: 0,
    angle: 0,
    enginePower: 0.1,
    wheelRadius: 10,
    frontWheelX: 0,
    backWheelX: 0
};

// --- Funções de Início ---

function generateTerrain() {
    let y = canvasHeight / 2;
    for (let i = 0; i < TERRAIN_SEGMENTS; i++) {
        const x = (canvasWidth / (TERRAIN_SEGMENTS - 1)) * i;
        y += (Math.random() - 0.5) * TERRAIN_AMPLITUDE;
        terrainPoints.push({ x, y });
    }
}

function getTerrainY(x) {
    if (x < 0) return terrainPoints[0].y;
    if (x >= canvasWidth) return terrainPoints[terrainPoints.length - 1].y;

    const segment = Math.floor(x / (canvasWidth / (TERRAIN_SEGMENTS - 1)));
    const p1 = terrainPoints[segment];
    const p2 = terrainPoints[segment + 1];

    if (!p1 || !p2) return canvasHeight / 2;

    const t = (x - p1.x) / (p2.x - p1.x);
    return p1.y * (1 - t) + p2.y * t;
}

// --- Desenhos ---

function drawTerrain() {
    ctx.beginPath();
    ctx.strokeStyle = '#555';
    ctx.lineWidth = 4;
    ctx.moveTo(0, canvasHeight);
    for (let i = 0; i < terrainPoints.length; i++) {
        ctx.lineTo(terrainPoints[i].x, terrainPoints[i].y);
    }
    ctx.lineTo(canvasWidth, canvasHeight);
    ctx.closePath();
    ctx.fillStyle = '#8B4513'; // Cor da terra
    ctx.fill();
    ctx.stroke();
}

function drawCar() {
    // Corpo do carro
    ctx.save();
    ctx.translate(car.x, car.y);
    ctx.rotate(car.angle);
    ctx.fillStyle = 'blue';
    ctx.fillRect(-car.width / 2, -car.height / 2, car.width, car.height);

    // Rodas (desenhadas com a rotação do carro)
    ctx.fillStyle = '#000';
    
    // Roda traseira
    ctx.beginPath();
    ctx.arc(-car.width / 2, car.height / 2, car.wheelRadius, 0, Math.PI * 2);
    ctx.fill();
    
    // Roda dianteira
    ctx.beginPath();
    ctx.arc(car.width / 2, car.height / 2, car.wheelRadius, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
}

// --- Lógica de Controles ---

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

// --- Loop Principal do Jogo ---

function gameLoop() {
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    // Lógica do Carro
    if (keys.ArrowRight) {
        car.speed += car.enginePower;
    }
    if (keys.ArrowLeft) {
        car.speed -= car.enginePower;
    }
    
    // Simulação de atrito
    car.speed *= 0.98;

    // Atualiza a posição do carro
    car.x += car.speed * Math.cos(car.angle);
    car.y += car.speed * Math.sin(car.angle);

    // Verifica a altura do terreno
    const terrainY = getTerrainY(car.x);
    car.y = terrainY - car.height;

    // Atualiza o ângulo do carro baseado na inclinação do terreno
    const nextTerrainY = getTerrainY(car.x + 10);
    const prevTerrainY = getTerrainY(car.x - 10);
    car.angle = Math.atan2(nextTerrainY - prevTerrainY, 20);

    // Desenha tudo
    drawTerrain();
    drawCar();

    requestAnimationFrame(gameLoop);
}

// --- Iniciar o Jogo ---
generateTerrain();
gameLoop();
