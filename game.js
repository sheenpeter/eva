const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

canvas.width = 800;
canvas.height = 400;

// Game state
let gameState = {
  stars: 0,
  level: 1,
  lives: 3,
  gameRunning: true,
  gameSpeed: 2,
  scrollOffset: 0
};

// Player
const player = {
  x: 100,
  y: 300,
  width: 30,
  height: 40,
  velX: 0,
  velY: 0,
  jumping: false,
  grounded: false,
  color: '#ff66b2'
};

// Input
let keys = {};
document.addEventListener('keydown', (e) => {
  keys[e.code] = true;
});
document.addEventListener('keyup', (e) => {
  keys[e.code] = false;
});

// Stars, potholes, platforms
let stars = [];
let potholes = [];
let platforms = [];

// Init one level
function initLevel() {
  stars = [];
  potholes = [];
  platforms = [];

  // Ground
  platforms.push({
    x: 0,
    y: canvas.height - 50,
    width: 2000,
    height: 50,
    color: '#27ae60'
  });

  const levelStars = 5 + gameState.level * 2;
  const levelPotholes = 3 + gameState.level;

  for (let i = 0; i < levelStars; i++) {
    stars.push({
      x: 300 + i * 200,
      y: 200 + Math.random() * 80,
      width: 20,
      height: 20,
      collected: false
    });
  }

  for (let i = 0; i < levelPotholes; i++) {
    potholes.push({
      x: 400 + i * 250,
      y: canvas.height - 50,
      width: 60 + gameState.level * 10,
      height: 50
    });
  }

  for (let i = 0; i < 3 + gameState.level; i++) {
    platforms.push({
      x: 450 + i * 250,
      y: 260 + Math.sin(i) * 30,
      width: 130,
      height: 20,
      color: '#ff9ad5'
    });
  }
}

// AABB collision
function collides(a, b) {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}

function resetPlayer() {
  player.x = 100;
  player.y = 300;
  player.velX = 0;
  player.velY = 0;
  player.grounded = false;
  gameState.scrollOffset = 0;
}

function nextLevel() {
  gameState.level++;
  gameState.gameSpeed += 0.4;
  resetPlayer();
  initLevel();
  updateUI();
}

function gameOver() {
  gameState.gameRunning = false;
  document.getElementById('finalScore').textContent = gameState.stars;
  document.getElementById('gameOver').classList.remove('hidden');
}

function updateUI() {
  document.getElementById('starCount').textContent = gameState.stars;
  document.getElementById('levelNum').textContent = gameState.level;
  document.getElementById('lives').textContent = gameState.lives;
}

// Physics + logic
function updatePlayer() {
  // gravity
  if (!player.grounded) {
    player.velY += 0.8;
  }

  // jump
  if (keys['Space'] && player.grounded) {
    player.velY = -16;
    player.grounded = false;
    player.jumping = true;
  }

  // auto run
  player.velX = gameState.gameSpeed;

  player.x += player.velX;
  player.y += player.velY;

  player.grounded = false;

  // platform collisions
  for (const p of platforms) {
    const px = p.x - gameState.scrollOffset;
    const platRect = { x: px, y: p.y, width: p.width, height: p.height };
    if (collides(player, platRect) && player.velY > 0 && player.y < p.y) {
      player.y = p.y - player.height;
      player.velY = 0;
      player.grounded = true;
      player.jumping = false;
    }
  }

  // ground clamp
  const groundY = canvas.height - 50;
  if (player.y + player.height > groundY) {
    player.y = groundY - player.height;
    player.velY = 0;
    player.grounded = true;
    player.jumping = false;
  }

  // potholes
  for (const raw of potholes) {
    const ph = {
      x: raw.x - gameState.scrollOffset,
      y: raw.y,
      width: raw.width,
      height: raw.height
    };
    if (collides(player, ph)) {
      gameState.lives--;
      if (gameState.lives <= 0) {
        gameOver();
      } else {
        resetPlayer();
      }
      return;
    }
  }

  // stars
  for (const s of stars) {
    if (s.collected) continue;
    const sr = {
      x: s.x - gameState.scrollOffset,
      y: s.y,
      width: s.width,
      height: s.height
    };
    if (collides(player, sr)) {
      s.collected = true;
      gameState.stars++;
      updateUI();
    }
  }

  // finished level (all collected)
  if (stars.every((s) => s.collected)) {
    nextLevel();
  }

  // scrolling world
  if (player.x > canvas.width / 2) {
    gameState.scrollOffset += gameState.gameSpeed;
    player.x = canvas.width / 2;
  }

  // don't let player leave left/top
  if (player.x < 0) player.x = 0;
  if (player.y < 0) player.y = 0;
}

// Draw
function draw() {
  // background
  ctx.fillStyle = '#1e7e34';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // ground gradient strip
  const grd = ctx.createLinearGradient(0, canvas.height - 80, 0, canvas.height);
  grd.addColorStop(0, '#2ecc71');
  grd.addColorStop(1, '#145a32');
  ctx.fillStyle = grd;
  ctx.fillRect(0, canvas.height - 80, canvas.width, 80);

  // platforms
  for (const p of platforms) {
    const x = p.x - gameState.scrollOffset;
    if (x + p.width < -50 || x > canvas.width + 50) continue;
    ctx.fillStyle = p.color || '#27ae60';
    ctx.fillRect(x, p.y, p.width, p.height);
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.strokeRect(x, p.y, p.width, p.height);
  }

  // potholes
  ctx.fillStyle = '#4a0f0f';
  for (const raw of potholes) {
    const x = raw.x - gameState.scrollOffset;
    if (x + raw.width < -50 || x > canvas.width + 50) continue;
    ctx.fillRect(x, raw.y, raw.width, raw.height);
  }

  // stars
  for (const s of stars) {
    if (s.collected) continue;
    const x = s.x - gameState.scrollOffset;
    if (x + s.width < -30 || x > canvas.width + 30) continue;
    ctx.fillStyle = '#ffd700';
    ctx.beginPath();
    ctx.arc(x + 10, s.y + 10, 9, 0, Math.PI * 2);
    ctx.fill();
  }

  // player
  ctx.fillStyle = player.color;
  ctx.fillRect(player.x, player.y, player.width, player.height);
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(player.x + 10, player.y + 8, 10, 6);
}

// loop
function loop() {
  if (gameState.gameRunning) {
    updatePlayer();
    draw();
  }
  requestAnimationFrame(loop);
}

// restart button
document.getElementById('restartBtn').addEventListener('click', () => {
  gameState = {
    stars: 0,
    level: 1,
    lives: 3,
    gameRunning: true,
    gameSpeed: 2,
    scrollOffset: 0
  };
  resetPlayer();
  initLevel();
  updateUI();
  document.getElementById('gameOver').classList.add('hidden');
});

// start
resetPlayer();
initLevel();
updateUI();
loop();
