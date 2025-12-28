const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

canvas.width = 800;
canvas.height = 400;

const maxLevel = 50;
const levelDuration = 60; // seconds

// ---- DOM refs ----
const startScreen = document.getElementById('startScreen');
const charOptions = document.querySelectorAll('.charOption');
const startBtn = document.getElementById('startBtn');

const starCountEl = document.getElementById('starCount');
const levelNumEl = document.getElementById('levelNum');
const livesEl = document.getElementById('lives');
const timeLeftEl = document.getElementById('timeLeft');

const gameOverScreen = document.getElementById('gameOver');
const finalScoreEl = document.getElementById('finalScore');
const finalLevelEl = document.getElementById('finalLevel');
const restartBtn = document.getElementById('restartBtn');

// ---- Game state ----
let gameState = {
  stars: 0,
  level: 1,
  lives: 3,
  gameRunning: false,
  gameSpeed: 2,
  scrollOffset: 0,
  timeLeft: levelDuration,
  characterStyle: 'pink',
  falling: false
};

let timerInterval = null;

// ---- Player ----
const player = {
  x: 120,
  y: 300,
  width: 32,
  height: 60,
  velX: 0,
  velY: 0,
  grounded: false
};

// Input
const keys = {};
document.addEventListener('keydown', (e) => {
  keys[e.code] = true;
});
document.addEventListener('keyup', (e) => {
  keys[e.code] = false;
});

// World arrays
let stars = [];
let potholes = [];
let platforms = [];

// ---- Character selection ----
charOptions.forEach(opt => {
  opt.addEventListener('click', () => {
    charOptions.forEach(o => o.classList.remove('selected'));
    opt.classList.add('selected');
    gameState.characterStyle = opt.dataset.char;
    startBtn.disabled = false;
  });
});

startBtn.addEventListener('click', () => {
  startScreen.style.display = 'none';
  startGameRun();
});

// ---- Level / game control ----
function startGameRun() {
  resetPlayer();
  gameState.stars = 0;
  gameState.level = 1;
  gameState.lives = 3;
  gameState.gameSpeed = 2;
  gameState.scrollOffset = 0;
  gameState.timeLeft = levelDuration;
  gameState.gameRunning = true;
  gameState.falling = false;
  initLevel();
  updateUI();
  startTimer();
}

function startTimer() {
  if (timerInterval) clearInterval(timerInterval);
  gameState.timeLeft = levelDuration;
  timeLeftEl.textContent = gameState.timeLeft;
  timerInterval = setInterval(() => {
    if (!gameState.gameRunning) return;
    gameState.timeLeft--;
    if (gameState.timeLeft < 0) gameState.timeLeft = 0;
    timeLeftEl.textContent = gameState.timeLeft;
    if (gameState.timeLeft <= 0) {
      nextLevel();
    }
  }, 1000);
}

function resetPlayer() {
  player.x = 120;
  player.y = 280;
  player.velX = 0;
  player.velY = 0;
  player.grounded = false;
  gameState.scrollOffset = 0;
  gameState.falling = false;
}

function initLevel() {
  stars = [];
  potholes = [];
  platforms = [];

  const groundY = canvas.height - 50;

  // Make each level very long so you have obstacles for full 60s
  const levelLength = 8000 + gameState.level * 400; // was 2200

  // Ground platform covering full length
  platforms.push({
    x: 0,
    y: groundY,
    width: levelLength,
    height: 50,
    color: '#27ae60'
  });

  // Number of objects scaled with level & length
  const levelStars = 20 + gameState.level * 3;
  const levelPotholes = 12 + gameState.level * 2;
  const floatCount = 8 + Math.floor(gameState.level / 2);

  // Stars spread along whole length
  for (let i = 0; i < levelStars; i++) {
    const baseX = 400 + Math.random() * (levelLength - 800);
    stars.push({
      x: baseX,
      y: 160 + Math.random() * 120,
      width: 20,
      height: 20,
      collected: false
    });
  }

  // Potholes on ground along whole length
  for (let i = 0; i < levelPotholes; i++) {
    const baseX = 500 + Math.random() * (levelLength - 900);
    potholes.push({
      x: baseX,
      y: groundY,
      width: 80 + gameState.level * 2,
      height: 50
    });
  }

  // Floating steps throughout the level
  for (let i = 0; i < floatCount; i++) {
    const baseX = 600 + Math.random() * (levelLength - 1000);
    platforms.push({
      x: baseX,
      y: 260 + Math.sin(i) * 40,
      width: 130,
      height: 20,
      color: '#ff9ad5'
    });
  }
}


function updateUI() {
  starCountEl.textContent = gameState.stars;
  levelNumEl.textContent = gameState.level;
  livesEl.textContent = gameState.lives;
}

// rect collision
function collides(a, b) {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}

function nextLevel() {
  if (gameState.level >= maxLevel) {
    endGame();
    return;
  }
  gameState.level++;
  gameState.gameSpeed += 0.35;
  resetPlayer();
  initLevel();
  updateUI();
  startTimer();
}

function loseLifeAndRestartLevel() {
  gameState.lives--;
  if (gameState.lives <= 0) {
    endGame();
    return;
  }
  resetPlayer();
  initLevel();
  updateUI();
  startTimer();
}

function endGame() {
  gameState.gameRunning = false;
  if (timerInterval) clearInterval(timerInterval);
  finalScoreEl.textContent = gameState.stars;
  finalLevelEl.textContent = gameState.level;
  gameOverScreen.classList.remove('hidden');
}

// Restart from game-over
restartBtn.addEventListener('click', () => {
  gameOverScreen.classList.add('hidden');
  startScreen.style.display = 'block';
  startBtn.disabled = true;
  charOptions.forEach(o => o.classList.remove('selected'));
});

// ---- Physics / update ----
function updatePlayer() {
  if (gameState.falling) {
    player.velY += 1.2;
    player.y += player.velY;
    if (player.y > canvas.height + 50) {
      gameState.falling = false;
      loseLifeAndRestartLevel();
    }
    return;
  }

  if (!player.grounded) {
    player.velY += 0.8;
  }

  if (keys['Space'] && player.grounded) {
    player.velY = -16;
    player.grounded = false;
  }

  player.velX = gameState.gameSpeed;

  player.x += player.velX;
  player.y += player.velY;
  player.grounded = false;

  const groundY = canvas.height - 50;

  // platforms
  for (const p of platforms) {
    const worldX = p.x - gameState.scrollOffset;
    const platRect = { x: worldX, y: p.y, width: p.width, height: p.height };
    if (collides(player, platRect) && player.velY >= 0 && player.y < p.y) {
      player.y = p.y - player.height;
      player.velY = 0;
      player.grounded = true;
    }
  }

  // potholes vs ground
  let inPothole = false;
  for (const raw of potholes) {
    const worldX = raw.x - gameState.scrollOffset;
    const holeRect = { x: worldX, y: raw.y, width: raw.width, height: raw.height };
    const feetX = player.x + player.width / 2;
    const holeStart = holeRect.x;
    const holeEnd = holeRect.x + holeRect.width;
    if (feetX > holeStart && feetX < holeEnd && player.y + player.height >= groundY - 2) {
      inPothole = true;
      break;
    }
  }

  if (inPothole) {
    player.grounded = false;
    gameState.falling = true;
    player.velY = 5;
  } else {
    if (player.y + player.height > groundY) {
      player.y = groundY - player.height;
      player.velY = 0;
      player.grounded = true;
    }
  }

  // stars
  for (const s of stars) {
    if (s.collected) continue;
    const worldX = s.x - gameState.scrollOffset;
    const starRect = { x: worldX, y: s.y, width: s.width, height: s.height };
    if (collides(player, starRect)) {
      s.collected = true;
      gameState.stars++;
      updateUI();
    }
  }

  if (stars.length > 0 && stars.every(s => s.collected)) {
    nextLevel();
    return;
  }

  if (player.x > canvas.width / 2) {
    gameState.scrollOffset += gameState.gameSpeed;
    player.x = canvas.width / 2;
  }

  if (player.x < 0) player.x = 0;
  if (player.y < -100) player.y = -100;
}

// ---- Drawing ----
function drawBackground() {
  ctx.fillStyle = '#1e7e34';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const grd = ctx.createLinearGradient(0, canvas.height - 90, 0, canvas.height);
  grd.addColorStop(0, '#2ecc71');
  grd.addColorStop(1, '#145a32');
  ctx.fillStyle = grd;
  ctx.fillRect(0, canvas.height - 90, canvas.width, 90);
}

function drawPlatforms() {
  for (const p of platforms) {
    const x = p.x - gameState.scrollOffset;
    if (x + p.width < -50 || x > canvas.width + 50) continue;
    ctx.fillStyle = p.color || '#27ae60';
    ctx.fillRect(x, p.y, p.width, p.height);
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.strokeRect(x, p.y, p.width, p.height);
  }
}

function drawPotholes() {
  const groundY = canvas.height - 50;
  for (const raw of potholes) {
    const x = raw.x - gameState.scrollOffset;
    if (x + raw.width < -80 || x > canvas.width + 80) continue;
    ctx.fillStyle = '#330808';
    ctx.fillRect(x, groundY, raw.width, raw.height);
  }
}

function drawStars() {
  for (const s of stars) {
    if (s.collected) continue;
    const x = s.x - gameState.scrollOffset;
    if (x + s.width < -40 || x > canvas.width + 40) continue;
    ctx.fillStyle = '#ffd700';
    ctx.beginPath();
    ctx.arc(x + 10, s.y + 10, 9, 0, Math.PI * 2);
    ctx.fill();
  }
}

// stylised girl
function drawPlayer() {
  const x = player.x;
  const y = player.y;
  const w = player.width;
  const h = player.height;

  // legs
  ctx.fillStyle = '#2c3e50';
  ctx.fillRect(x + w * 0.2, y + h * 0.65, w * 0.2, h * 0.35);
  ctx.fillRect(x + w * 0.6, y + h * 0.65, w * 0.2, h * 0.35);

  // shoes
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(x + w * 0.18, y + h - 4, w * 0.24, 4);
  ctx.fillRect(x + w * 0.58, y + h - 4, w * 0.24, 4);

  // outfit colour
  let outfitColor = '#ff66b2';
  if (gameState.characterStyle === 'blue') outfitColor = '#3498db';
  if (gameState.characterStyle === 'green') outfitColor = '#2ecc71';
  if (gameState.characterStyle === 'purple') outfitColor = '#9b59b6';
  if (gameState.characterStyle === 'orange') outfitColor = '#e67e22';

  ctx.fillStyle = outfitColor;
  ctx.fillRect(x + w * 0.15, y + h * 0.3, w * 0.7, h * 0.4);

  // head
  ctx.fillStyle = '#f1c27d';
  ctx.beginPath();
  ctx.arc(x + w * 0.5, y + h * 0.18, w * 0.25, 0, Math.PI * 2);
  ctx.fill();

  // hair
  ctx.fillStyle = '#2e3033';
  ctx.beginPath();
  ctx.arc(x + w * 0.5, y + h * 0.12, w * 0.3, Math.PI, 0);
  ctx.fill();
  ctx.fillRect(x + w * 0.2, y + h * 0.18, w * 0.6, h * 0.18);

  // face
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(x + w * 0.43, y + h * 0.18, 2, 0, Math.PI * 2);
  ctx.arc(x + w * 0.57, y + h * 0.18, 2, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = '#e91e63';
  ctx.beginPath();
  ctx.arc(x + w * 0.5, y + h * 0.2, 5, 0, Math.PI);
  ctx.stroke();
}

function draw() {
  drawBackground();
  drawPlatforms();
  drawPotholes();
  drawStars();
  drawPlayer();
}

// main loop
function loop() {
  if (gameState.gameRunning) {
    updatePlayer();
    draw();
  }
  requestAnimationFrame(loop);
}

loop();
