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
document.addEventListener('keydown', (e) => keys[e.code] = true);
document.addEventListener('keyup', (e) => keys[e.code] = false);

// Stars array
let stars = [];
let potholes = [];
let platforms = [];

// Initialize level
function initLevel() {
  stars = [];
  potholes = [];
  platforms = [];
  
  // Ground platform
  platforms.push({x: 0, y: 350, width: 2000, height: 50, color: '#27ae60'});
  
  // Generate level content based on difficulty
  const levelStars = 5 + gameState.level * 2;
  const levelPotholes = 3 + gameState.level;
  
  for (let i = 0; i < levelStars; i++) {
    stars.push({
      x: 300 + Math.random() * 1200 + i * 200,
      y: 200 + Math.random() * 100,
      width: 20,
      height: 20,
      collected: false
    });
  }
  
  for (let i = 0; i < levelPotholes; i++) {
    potholes.push({
      x: 400 + Math.random() * 1000 + i * 300,
      y: 350,
      width: 60 + gameState.level * 10,
      height: 50
    });
  }
  
  // Floating platforms
  for (let i = 0; i < 3 + gameState.level; i++) {
    platforms.push({
      x: 500 + i * 300 + Math.random() * 200,
      y: 250 + Math.sin(i) * 50,
      width: 120 + Math.random() * 60,
      height: 20,
      color: '#ff9ad5'
    });
  }
}

// Collision detection
function checkCollision(rect1, rect2) {
  return rect1.x < rect2.x + rect2.width &&
         rect1.x + rect1.width > rect2.x &&
         rect1.y < rect2.y + rect2.height &&
         rect1.y + rect1.height > rect2.y;
}

// Update player
function updatePlayer() {
  // Gravity
  if (!player.grounded) {
    player.velY += 0.8;
  }
  
  // Jump (SPACE)
  if (keys['Space'] && player.grounded) {
    player.velY = -16;
    player.grounded = false;
    player.jumping = true;
  }
  
  // Horizontal movement (auto-run)
  player.velX = gameState.gameSpeed;
  
  // Update position
  player.x += player.velX;
  player.y += player.velY;
  
  // Platform collision
  player.grounded = false;
  for (let platform of platforms) {
    if (checkCollision(player, platform)) {
      // Landing on top
      if (player.velY > 0 && player.y < platform.y) {
        player.y = platform.y - player.height;
        player.velY = 0;
        player.grounded = true;
        player.jumping = false;
      }
    }
  }
  
  // Ground collision
  if (player.y + player.height > canvas.height - 50) {
    player.y = canvas.height - 50 - player.height;
    player.velY = 0;
    player.grounded = true;
    player.jumping = false;
  }
  
  // Pothole death
  for (let pothole of potholes) {
    const potholeWorldX = pothole.x - gameState.scrollOffset;
    if (potholeWorldX > -100 && checkCollision(player, {...pothole, x: potholeWorldX})) {
      gameState.lives--;
      if (gameState.lives <= 0) {
        gameOver();
      } else {
        resetPlayer();
      }
      return;
    }
  }
  
  // Star collection
  for (let star of stars) {
    if (!star.collected) {
      const starWorldX = star.x - gameState.scrollOffset;
      if (checkCollision(player, {...star, x: starWorldX})) {
        star.collected = true;
        gameState.stars++;
        updateUI();
        
        // Level complete check
        if (gameState.stars >= (5 + gameState.level * 2)) {
          nextLevel();
        }
      }
    }
  }
  
  // Screen boundaries
  if (player.x > canvas.width / 2) {
    gameState.scrollOffset += gameState.gameSpeed;
    player.x = canvas.width / 2;
  }
}

// Reset player position
function resetPlayer() {
  player.x = 100;
  player.y = 300;
  player.velY = 0;
  gameState.scrollOffset = 0;
}

// Next level
function nextLevel() {
  gameState.level++;
  gameState.gameSpeed += 0.3;
  resetPlayer();
  initLevel();
  updateUI();
}

// Game over
function gameOver() {
  gameState.gameRunning = false;
  document.getElementById('finalScore').textContent = gameState.stars;
  document.getElementById('gameOver').classList.remove('hidden');
}

// Update UI
function updateUI() {
  document.getElementById('starCount').textContent = gameState.stars;
  document.getElementById('levelNum').textContent = gameState.level;
  document.getElementById('lives').textContent = gameState.lives;
}

// Draw everything
function draw() {
  // Clear canvas
  ctx.fillStyle = '#1e7e34';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Draw platforms
  for (let platform of platforms) {
    const screenX = platform.x - gameState.scrollOffset;
    if (screenX > -200 && screenX < canvas.width + 200) {
      ctx.fillStyle = platform.color || '#27ae60';
      ctx.fillRect(screenX, platform.y, platform.width, platform.height);
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.strokeRect(screenX, platform.y, platform.width, platform.height);
    }
  }
  
  // Draw potholes
  ctx.fillStyle = '#4a0f0f';
  for (let pothole of potholes) {
    const screenX = pothole.x - gameState.scrollOffset;
    if (screenX > -100 && screenX < canvas.width + 100) {
      ctx.fillRect(screenX, pothole.y, pothole.width, pothole.height);
      // Crack lines
      ctx.strokeStyle = '#8b0000';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(screenX + 10, pothole.y + 10);
      ctx.lineTo(screenX + pothole.width - 10, pothole.y + pothole.height - 10);
      ctx.stroke();
    }
  }
  
  // Draw stars
  for (let star of stars) {
    if (!star.collected) {
      const screenX = star.x - gameState.scrollOffset;
      if (screenX > -50 && screenX < canvas.width + 50) {
        ctx.fillStyle = '#ffd700';
        ctx.shadowColor = '#ffd700';
        ctx.shadowBlur = 15;
        ctx.beginPath();
        ctx.arc(screenX + 10, star.y + 10, 10, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      }
    }
  }
  
  // Draw player (jumping animation)
  ctx.fillStyle = player.color;
  ctx.shadowColor = player.color;
  ctx.shadowBlur = 10;
  
  // Body
  ctx.fillRect(player.x + 5, player.y + 10, 20, 25);
  // Head
  ctx.beginPath();
  ctx.arc(player.x + 15, player.y + 5, 8, 0, Math.PI * 2);
  ctx.fill();
  // Eyes
  ctx.fillStyle = 'white';
  ctx.beginPath();
  ctx.arc(player.x + 12, player.y + 3, 2, 0, Math.PI * 2);
  ctx.arc(player.x + 18, player.y + 3, 2, 0, Math.PI * 2);
  ctx.fill();
  
  ctx.shadowBlur = 0;
}

// Game loop
function gameLoop() {
  if (gameState.gameRunning) {
    updatePlayer();
    draw();
  }
  requestAnimationFrame(gameLoop);
}

// Event listeners
document.getElementById('restartBtn').addEventListener('click', () => {
  gameState = {stars: 0, level: 1, lives: 3, gameRunning: true, gameSpeed: 2, scrollOffset: 0};
  resetPlayer();
  initLevel();
  updateUI();
  document.getElementById('gameOver').classList.add('hidden');
});

// Start game
initLevel();
updateUI();
gameLoop();
