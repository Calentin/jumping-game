const dino = document.getElementById("icon");
const container = document.querySelector(".container");
let jumpingTime = 600;
// Nothing moves until the first jump, and everything freezes again on game over.
let gameStarted = false;
let gameOver = false;

setInterval(() => {
  if (gameStarted && !gameOver) dino.classList.toggle("run-2");
}, 120);

function cloud() {
  if (gameOver) return;
  // Creates a new empty HTML element, assigns it the class .cloud,
  // and inserts it into the game.
  const cloudEl = document.createElement("div");
  cloudEl.classList.add("cloud");
  container.appendChild(cloudEl);

  //Calculates the actual width of the game screen at that moment,
  // and positions the cloud just beyond that boundary (i.e. off-screen, to the right).
  // It also selects a random height between 20 and 170px.
  let cloudPosition = container.offsetWidth;
  const randomTop = Math.floor(Math.random() * 150) + 20;
  cloudEl.style.top = randomTop + "px";

  //Every 20 ms, move the position back by 2 px. As long as the cloud hasn’t moved completely
  //to the left (< -85, its own width), we continue to move it.
  // Once it has moved off the screen, the loop is stopped (using `clearInterval`,
  // otherwise it would run indefinitely for no reason) and the element is removed from
  // the DOM (using `removeChild`, to avoid accumulating hundreds of invisible 'div's).
  const moveCloud = setInterval(() => {
    if (gameOver) return;
    if (cloudPosition < -85) {
      // 85 = width of the cloud
      clearInterval(moveCloud);
      container.removeChild(cloudEl);
    } else {
      cloudPosition -= 2;
      cloudEl.style.transform = `translateX(${cloudPosition}px)`;
    }
  }, 15);

  setTimeout(cloud, Math.random() * 10000);
}

const jump = (duration = 600) => {
  // Like the Chrome dino game, the first jump starts the run.
  if (!gameStarted) startGame();
  if (!dino.classList.contains("isJumping")) {
    dino.style.animationDuration = `${duration}ms`;
    dino.classList.add("isJumping");

    setTimeout(() => {
      // After a game over the dino stays frozen mid-air.
      if (!gameOver) dino.classList.remove("isJumping");
    }, duration);
  }
};

addEventListener("keydown", (event) => {
  if (
    event.code === "Space" ||
    event.code === "ArrowUp" ||
    event.code === "KeyW"
  ) {
    jump(jumpingTime);
  }
});

// Obstacles, collisions, score, and game-over handling.
// All teammate code above this section is preserved unchanged.
// Reuse the existing dino and container references declared by our teammates.
const obstacleContainer = document.querySelector(".obstacles-container");
const scoreDisplay = document.getElementById("score-value");
const bestScoreDisplay = document.getElementById("best-score-value");
const bestScoreKey = "jumpingGame.bestScore";
const restartButton = document.getElementById("restart-button");
const baseSpeed = 480; // Pixels per second.
// Inset boxes follow solid parts of the sprites, leaving empty corners and edge grazes safe.
// Each box is [left, top, width, height] relative to its sprite.
const dinoBodyHitboxes = [
  [44, 6, 38, 24], // Head.
  [36, 30, 32, 16], // Neck.
  [18, 44, 36, 32], // Body.
  [4, 38, 8, 18], // Tail.
];
const dinoFeetHitboxes = [
  [[23, 76, 7, 14], [44, 76, 7, 5]],
  [[25, 76, 7, 7], [44, 80, 7, 10]],
];
const obstacleTypes = [
  {
    className: "cactus", unlockScore: 0,
    hitboxes: [[16, 6, 11, 82], [3, 28, 6, 27], [8, 55, 12, 6], [35, 24, 6, 27], [25, 52, 13, 5]],
  },
  {
    className: "small-cactus", unlockScore: 10,
    hitboxes: [[13, 6, 7, 57], [3, 22, 5, 15], [6, 36, 10, 5], [27, 14, 4, 13], [19, 27, 10, 5]],
  },
  {
    className: "paired-cacti", unlockScore: 20,
    hitboxes: [
      [13, 6, 7, 57], [3, 22, 5, 15], [6, 36, 10, 5], [27, 14, 4, 13], [19, 27, 10, 5],
      [47, 6, 7, 57], [37, 14, 5, 14], [40, 27, 10, 5], [61, 22, 4, 14], [52, 35, 11, 5],
    ],
  },
  {
    className: "bird", unlockScore: 30,
    // The head and body stay solid in both frames; flapping wing tips are forgiving.
    hitboxes: [[20, 20, 8, 12], [36, 38, 44, 12], [48, 50, 24, 5]],
  },
];
const spawnInterval = 2200; // Milliseconds between obstacles.
let obstacleSpeed = baseSpeed;
let nextObstacleIndex = 0;
let unlockedTypeCount = 1;
let obstacles = [];
let score = 0;
let bestScore = loadBestScore();
let previousFrameTime = null;
let animationFrame;
let obstacleTimer;
let scoreTimer;

function createObstacle() {
  if (gameOver) return;
  const unlockedTypes = obstacleTypes.filter((type) => score >= type.unlockScore);
  // Introduce sprites at their fixed unlock scores, keeping the early-game order.
  const newTypeUnlocked = unlockedTypes.length > unlockedTypeCount;
  if (newTypeUnlocked) {
    nextObstacleIndex = unlockedTypes.length - 1;
    unlockedTypeCount = unlockedTypes.length;
  }
  // Once every sprite has been introduced, choose independently on every spawn.
  const allTypesUnlocked = unlockedTypes.length === obstacleTypes.length;
  const index = allTypesUnlocked && !newTypeUnlocked
    ? Math.floor(Math.random() * unlockedTypes.length)
    : nextObstacleIndex % unlockedTypes.length;
  const type = unlockedTypes[index];
  nextObstacleIndex += 1;
  const element = document.createElement("div");
  element.className = `obstacle ${type.className}`;
  const x = container.clientWidth;
  element.style.transform = `translateX(${x}px)`;
  obstacleContainer.appendChild(element);
  obstacles.push({ element, x, hitboxes: type.hitboxes });
}

function loadBestScore() {
  try {
    const savedScore = Number(localStorage.getItem(bestScoreKey));
    return Number.isSafeInteger(savedScore) && savedScore >= 0 ? savedScore : 0;
  } catch {
    // Storage can be blocked; the game can still keep a record for this round.
    return 0;
  }
}

function updateBestScore() {
  if (score <= bestScore) return;
  // Keep a higher record that may have been saved by another tab.
  bestScore = Math.max(score, loadBestScore());
  bestScoreDisplay.textContent = String(bestScore).padStart(5, "0");
  try {
    localStorage.setItem(bestScoreKey, String(bestScore));
  } catch {
    // Keep showing the record even when the browser cannot save it.
  }
}

function updateScore() {
  if (gameOver) return;
  score += 1;
  scoreDisplay.textContent = String(score).padStart(5, "0");
  updateBestScore();
  // One point equals one second: compound the current speed by 7% every ten seconds.
  if (score % 10 === 0) obstacleSpeed *= 1.07;
}

function isColliding(player, obstacle) {
  return (
    player.left < obstacle.right &&
    player.right > obstacle.left &&
    player.top < obstacle.bottom &&
    player.bottom > obstacle.top
  );
}

function getCollisionBoxes(rect, hitboxes) {
  return hitboxes.map(([left, top, width, height]) => ({
    left: rect.left + left,
    top: rect.top + top,
    right: rect.left + left + width,
    bottom: rect.top + top + height,
  }));
}

function touchesObstacle(playerBoxes, obstacleRect, hitboxes) {
  const obstacleBoxes = getCollisionBoxes(obstacleRect, hitboxes);
  return playerBoxes.some((playerBox) =>
    obstacleBoxes.some((obstacleBox) => isColliding(playerBox, obstacleBox)),
  );
}

function endGame() {
  gameOver = true;
  clearInterval(obstacleTimer);
  clearInterval(scoreTimer);
  cancelAnimationFrame(animationFrame);
  // The existing score display now shows the final result.
  scoreDisplay.previousSibling.textContent = "Final score: ";
  container.classList.add("is-game-over");
  restartButton.focus({ preventScroll: true });
}

function updateGame(timestamp) {
  if (gameOver) return;
  // Cap delayed frames to avoid skipping through a cactus after a long pause.
  const elapsed =
    previousFrameTime === null
      ? 0
      : Math.min((timestamp - previousFrameTime) / 1000, 0.05);
  previousFrameTime = timestamp;
  // This includes Person 2's CSS jump transform without changing jump().
  const playerRect = dino.getBoundingClientRect();
  // Match the feet to the running frame selected by our teammate's animation.
  const feet = dinoFeetHitboxes[dino.classList.contains("run-2") ? 1 : 0];
  const playerBoxes = getCollisionBoxes(playerRect, [...dinoBodyHitboxes, ...feet]);

  for (const obstacle of obstacles) {
    obstacle.x -= obstacleSpeed * elapsed;
    obstacle.element.style.transform = `translateX(${obstacle.x}px)`;
    const obstacleRect = obstacle.element.getBoundingClientRect();
    // Full rectangles are a quick filter; only solid inner shapes can end the game.
    if (isColliding(playerRect, obstacleRect) &&
        touchesObstacle(playerBoxes, obstacleRect, obstacle.hitboxes)) {
      endGame();
      return;
    }
  }

  obstacles = obstacles.filter((obstacle) => {
    if (obstacle.x + obstacle.element.offsetWidth < 0) {
      obstacle.element.remove();
      return false;
    }
    return true;
  });
  animationFrame = requestAnimationFrame(updateGame);
}

// Block gameplay input after a collision; leave Person 2's controls unchanged during play.
window.addEventListener(
  "keydown",
  (event) => {
    if (gameOver && ["Space", "ArrowUp", "KeyW"].includes(event.code)) {
      event.stopImmediatePropagation();
      // A fresh Space press may still activate the focused Restart button.
      if (event.repeat || event.target !== restartButton)
        event.preventDefault();
    }
  },
  true,
);

// Reloading resets every round without editing the teammates' private timers.
restartButton.addEventListener("click", () => window.location.reload());
scoreDisplay.textContent = "00000";
bestScoreDisplay.textContent = String(bestScore).padStart(5, "0");

// Called by the first jump: releases every paused animation and starts the round.
function startGame() {
  gameStarted = true;
  container.classList.remove("is-idle");
  cloud();
  createObstacle();
  obstacleTimer = setInterval(createObstacle, spawnInterval);
  scoreTimer = setInterval(updateScore, 1000);
  animationFrame = requestAnimationFrame(updateGame);
}
