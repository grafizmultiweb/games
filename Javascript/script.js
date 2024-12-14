const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = 800;
canvas.height = 600;

// Cargar imágenes
const playerImage = new Image();
playerImage.src = "img/personaje.png";

const coinImage = new Image();
coinImage.src = "img/modeda.jpg";

const winImage = new Image();
winImage.src = "img/Adobe ilustrator.png";

const loseImage = new Image();
loseImage.src = "img/Adobe XD.png";

// Estado del juego
const player = {
    x: 50,
    y: 50,
    width: 40,
    height: 40,
    speed: 4,
    dx: 0,
    dy: 0,
};

const coins = [
    { x: 200, y: 150, collected: false },
    { x: 400, y: 300, collected: false },
    { x: 600, y: 450, collected: false },
    { x: 100, y: 400, collected: false },
    { x: 700, y: 200, collected: false },
];

const maze = [
    { x: 100, y: 100, width: 600, height: 20 },
    { x: 100, y: 200, width: 20, height: 400 },
    { x: 200, y: 300, width: 400, height: 20 },
    { x: 700, y: 100, width: 20, height: 400 },
];

let score = 0;
let timeLeft = 180; // 3 minutos en segundos
let gameWon = false;
let gameLost = false;
let gameStarted = false;
let timerInterval = null;

// Controles
document.addEventListener("keydown", (e) => {
    if (gameStarted) {
        if (e.key === "ArrowUp") player.dy = -player.speed;
        if (e.key === "ArrowDown") player.dy = player.speed;
        if (e.key === "ArrowLeft") player.dx = -player.speed;
        if (e.key === "ArrowRight") player.dx = player.speed;
    }
});

document.addEventListener("keyup", (e) => {
    if (gameStarted) {
        if (["ArrowUp", "ArrowDown"].includes(e.key)) player.dy = 0;
        if (["ArrowLeft", "ArrowRight"].includes(e.key)) player.dx = 0;
    }
});

// Dibujar jugador
function drawPlayer() {
    ctx.drawImage(playerImage, player.x, player.y, player.width, player.height);
}

// Dibujar monedas
function drawCoins() {
    coins.forEach((coin) => {
        if (!coin.collected) {
            ctx.drawImage(coinImage, coin.x, coin.y, 30, 30);
        }
    });
}

// Dibujar laberinto
function drawMaze() {
    ctx.fillStyle = "brown";
    maze.forEach((wall) => {
        ctx.fillRect(wall.x, wall.y, wall.width, wall.height);
    });
}

// Dibujar encabezado (puntos, cronómetro y botón)
function drawHeader() {
    const header = document.getElementById("header");
    header.innerHTML = `
        <button id="startButton" ${gameStarted ? "disabled" : ""}>Iniciar juego</button>
        <span>Puntaje: ${score}</span>
        <span>Tiempo restante: ${Math.floor(timeLeft / 60)}:${String(timeLeft % 60).padStart(2, "0")}</span>
    `;
}

// Movimiento del jugador
function movePlayer() {
    player.x += player.dx;
    player.y += player.dy;

    // Limitar a los bordes del canvas
    if (player.x < 0) player.x = 0;
    if (player.y < 40) player.y = 40; // Encima del encabezado
    if (player.x + player.width > canvas.width) player.x = canvas.width - player.width;
    if (player.y + player.height > canvas.height) player.y = canvas.height - player.height;

    // Detectar colisión con paredes
    maze.forEach((wall) => {
        if (
            player.x < wall.x + wall.width &&
            player.x + player.width > wall.x &&
            player.y < wall.y + wall.height &&
            player.y + player.height > wall.y
        ) {
            player.x -= player.dx;
            player.y -= player.dy;
        }
    });
}

// Recolectar monedas
function collectCoins() {
    coins.forEach((coin) => {
        if (
            !coin.collected &&
            player.x < coin.x + 30 &&
            player.x + player.width > coin.x &&
            player.y < coin.y + 30 &&
            player.y + player.height > coin.y
        ) {
            coin.collected = true;
            score++;
        }
    });

    // Si recolectaste todas las monedas, ganas
    if (score === coins.length) {
        gameWon = true;
        clearInterval(timerInterval);
    }
}

// Mostrar pantalla de victoria o derrota
function showEndScreen() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (gameWon) {
        ctx.drawImage(winImage, canvas.width / 2 - 150, canvas.height / 2 - 150, 300, 300);
    } else if (gameLost) {
        ctx.drawImage(loseImage, canvas.width / 2 - 150, canvas.height / 2 - 150, 300, 300);
    }
}

// Bucle del juego
function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (!gameWon && !gameLost) {
        drawHeader();
        drawMaze();
        movePlayer();
        drawPlayer();
        drawCoins();
        collectCoins();
        requestAnimationFrame(gameLoop);
    } else {
        showEndScreen();
    }
}

// Iniciar el juego
function startGame() {
    if (!gameStarted) {
        gameStarted = true;
        timerInterval = setInterval(() => {
            if (timeLeft > 0 && !gameWon && !gameLost) {
                timeLeft--;
                drawHeader();
            } else {
                clearInterval(timerInterval);
                if (!gameWon) gameLost = true;
            }
        }, 1000);
        gameLoop();
    }
}

// Configurar el botón de inicio
document.getElementById("header").addEventListener("click", (e) => {
    if (e.target.id === "startButton") {
        startGame();
    }
});