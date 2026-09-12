import { Fighter } from "./classes/fighter.js";
import { Sprite } from "./classes/sprite.js";
import {
  decreaseTimer,
  rectangularCollision,
  determineWinner,
  setTimerPaused,
} from "./utils/utils.js";
import { timerId } from "./utils/utils.js";

const canvas = document.querySelector("canvas");
const c = canvas.getContext("2d");

canvas.width = 1024;
canvas.height = 574;

// x, y, topleft then the 3rd and 4th widht and height
// this menas that from the top left and full width and height fill this rec
c.fillRect(0, 0, canvas.width, canvas.height);

// let gravity = 0.7;

const background = new Sprite({
  position: {
    x: 0,
    y: 0,
  },
  imageSrc: "./assets/background.png",
  c,
  renderWidth: canvas.width,
  renderHeight: canvas.height,
  cover: true,
});

const shop = new Sprite({
  position: {
    x: 770,
    y: 260,
  },
  imageSrc: "./assets/store.png",
  c,
  framesMax: 8,
  renderWidth: 150,
  renderHeight: 300,
});
shop.framesHold = 18;

// player
export const player = new Fighter({
  position: {
    x: 100,
    y: 0,
  },

  velocity: {
    x: 0,
    y: 0,
  },

  c,
  canvas,

  imageSrc: "./assets/characters/khaled/idle.png",

  framesMax: 8,

  renderHeight: 280,

  offset: {
    x: 40,
    y: 38,
  },

  attackOffset: {
    x: 50,
    y: 50,
  },
  nativeFacing: 1,
  hitPalette: ["#a91d36", "#ffbf7a"],

  sprites: {
    idle: {
      imageSrc: "./assets/characters/khaled/idle.png",

      framesMax: 8,
    },

    run: {
      imageSrc: "./assets/characters/khaled/Run.png",

      framesMax: 8,
    },
    jump: { imageSrc: "./assets/characters/khaled/Jump.png", framesMax: 2 },
    fall: { imageSrc: "./assets/characters/khaled/Fall.png", framesMax: 2 },
    attack1: { imageSrc: "./assets/characters/khaled/Attack1.png", framesMax: 6, framesHold: 5 },
    attack2: { imageSrc: "./assets/characters/khaled/Attack2.png", framesMax: 6, framesHold: 5 },
    takeHit: { imageSrc: "./assets/characters/khaled/Take Hit.png", framesMax: 4, loop: false },
    death: { imageSrc: "./assets/characters/khaled/Death.png", framesMax: 6, framesHold: 10, loop: false },
  },
});

export const enemy = new Fighter({
  position: {
    x: 700,
    y: 0,
  },

  velocity: {
    x: 0,
    y: 0,
  },

  c,
  canvas,

  imageSrc: "./assets/characters/faris/idle.png",

  framesMax: 4,

  renderHeight: 280,

  offset: {
    x: 40,
    y: 38,
  },

  attackOffset: {
    x: -100,
    y: 50,
  },
  nativeFacing: -1,
  hitPalette: ["#1769c2", "#80d9ff"],

  sprites: {
    idle: {
      imageSrc: "./assets/characters/faris/idle.png",

      framesMax: 4,
    },

    run: {
      imageSrc: "./assets/characters/faris/Run.png",

      framesMax: 8,
    },
    jump: { imageSrc: "./assets/characters/faris/Jump.png", framesMax: 2 },
    fall: { imageSrc: "./assets/characters/faris/Fall.png", framesMax: 2 },
    attack1: { imageSrc: "./assets/characters/faris/Attack1.png", framesMax: 4, framesHold: 8 },
    attack2: { imageSrc: "./assets/characters/faris/Attack2.png", framesMax: 4, framesHold: 8 },
    takeHit: { imageSrc: "./assets/characters/faris/Take hit.png", framesMax: 3, loop: false },
    death: { imageSrc: "./assets/characters/faris/Death.png", framesMax: 7, framesHold: 10, loop: false },
  },
});

// physics : you need to vcreate animation loop
const keys = {
  a: {
    pressed: false,
  },
  d: {
    pressed: false,
  },
  w: {
    pressed: false,
  },
  ArrowRight: {
    pressed: false,
  },
  ArrowLeft: {
    pressed: false,
  },
  ArrowUp: {
    pressed: false,
  },
};

let gameOver = false;
let paused = false;
let aiThinkAt = 0;
let aiAttackAt = 0;
let aiPlan = "approach";
const hitParticles = [];
const projectiles = [];
const maxMana = 4;
let mana = maxMana;
let manaRegenAt = performance.now();
let enemyMana = maxMana;
let enemyManaRegenAt = performance.now();
let aiSpecialAt = 0;
const minChargeTime = 350;
const maxChargeTime = 1600;
let chargeStartedAt = 0;
const playerHealth = document.querySelector(".player-health-fill");
const enemyHealth = document.querySelector(".enemy-health-fill");
const overlay = document.querySelector(".screen-overlay");
const result = document.querySelector(".result");
const pauseButton = document.querySelector(".pause-button");
const rematchButton = document.querySelector(".rematch-button");
const manaCells = [...document.querySelectorAll(".mana-cell")];
pauseButton.textContent = "Pause";
// document.querySelector(".controls").textContent = "A/D move - W double jump - Space: attack - Hold S: sword special";
function updateMana(now) {
  if (mana < maxMana && now >= manaRegenAt) {
    mana++;
    manaRegenAt = now + 3500;
  }
  manaCells.forEach((cell, index) => cell.classList.toggle("filled", index < mana));
  if (enemyMana < maxMana && now >= enemyManaRegenAt) {
    enemyMana++;
    enemyManaRegenAt = now + 4000;
  }
}
function createSlashProjectile(owner, target, colors, { scale = 1, damage = 15 } = {}) {
  const direction = owner.facing;
  projectiles.push({
    x: owner.position.x + (direction === 1 ? 170 : -64),
    y: owner.position.y + 104,
    vx: direction * (8 + scale * 2),
    life: 76,
    target,
    direction,
    colors,
    scale,
    damage,
  });
}
function launchSpecial(chargePower) {
  if (mana < 1 || player.dead) return;
  mana--;
  manaRegenAt = performance.now() + 3500;
  createSlashProjectile(player, enemy, ["#d6f9ff", "#207dff"], {
    scale: 1 + chargePower * 1.6,
    damage: 14 + Math.round(chargePower * 24),
  });
}
function launchEnemySpecial() {
  if (enemyMana < 1 || enemy.dead) return;
  enemyMana--;
  enemyManaRegenAt = performance.now() + 4000;
  createSlashProjectile(enemy, player, ["#ffd49b", "#df562d"]);
}
function updateCharge(now) {
  if (!player.isCharging) return;
  player.chargePower = Math.min(1, Math.max(0, (now - chargeStartedAt - minChargeTime) / (maxChargeTime - minChargeTime)));
}
function drawChargeEffect() {
  if (!player.isCharging) return;
  const pulse = 8 + player.chargePower * 18 + Math.sin(performance.now() / 70) * 3;
  const x = player.position.x + (player.facing === 1 ? 145 : -14);
  const y = player.position.y + 104;
  c.fillStyle = "#5de1ff";
  for (let index = 0; index < 6; index++) {
    const angle = (Math.PI * 2 * index) / 6 + performance.now() / 280;
    const size = 3 + Math.round(player.chargePower * 3);
    c.fillRect(Math.round(x + Math.cos(angle) * pulse), Math.round(y + Math.sin(angle) * pulse), size, size);
  }
}
function updateProjectiles() {
  for (let index = projectiles.length - 1; index >= 0; index--) {
    const projectile = projectiles[index];
    projectile.x += projectile.vx;
    projectile.life--;
    c.fillStyle = projectile.colors[0];
    const length = Math.round(27 * projectile.scale);
    const thickness = Math.round(8 * projectile.scale);
    c.fillRect(Math.round(projectile.x - projectile.direction * (length * .68)), Math.round(projectile.y - thickness / 2), length, thickness);
    c.fillStyle = projectile.colors[1];
    c.fillRect(Math.round(projectile.x - projectile.direction * (length * .22)), Math.round(projectile.y - thickness * .22), Math.round(length * .52), Math.max(3, Math.round(thickness * .45)));
    const target = projectile.target;
    const bladeLength = 27 * projectile.scale;
    const bladeThickness = 8 * projectile.scale;
    const hitTarget = projectile.x + bladeLength / 2 >= target.position.x - 12 && projectile.x - bladeLength / 2 <= target.position.x + target.width + 12 && projectile.y + bladeThickness / 2 >= target.position.y + 10 && projectile.y - bladeThickness / 2 <= target.position.y + target.height;
    if (hitTarget && !target.dead) {
      target.takeHit(projectile.damage);
      if (target === enemy) enemyHealth.style.width = enemy.health + "%";
      else playerHealth.style.width = player.health + "%";
      spawnHitParticles(target, projectile.colors, 12 + Math.round(projectile.scale * 5), projectile.scale);
      projectiles.splice(index, 1);
    } else if (projectile.life <= 0 || projectile.x < -20 || projectile.x > canvas.width + 20) {
      projectiles.splice(index, 1);
    }
  }
}
function updateFighterState(fighter, left, right) {
  if (fighter.dead || fighter.isAttacking || fighter.isTakingHit || fighter.isCharging || Date.now() < fighter.stateLockUntil) return;
  if (fighter.velocity.y < 0) fighter.switchSprite("jump");
  else if (fighter.velocity.y > 0) fighter.switchSprite("fall");
  else if (left || right) fighter.switchSprite("run");
  else fighter.switchSprite("idle");
}
function endGame() {
  if (gameOver) return;
  gameOver = true;
  determineWinner({ player, enemy, timerId });
}
function setPaused(value) {
  if (gameOver) return;
  paused = value;
  setTimerPaused(value);
  overlay.classList.toggle("visible", value);
  result.textContent = "Paused";
  pauseButton.textContent = value ? "Resume" : "Pause";
  pauseButton.setAttribute("aria-label", value ? "Resume game" : "Pause game");
}
function updateEnemyAI() {
  if (enemy.dead || enemy.isAttacking || enemy.isTakingHit) return;
  const distance = player.position.x - enemy.position.x;
  const gap = Math.abs(distance);
  const now = performance.now();
  if (now > aiThinkAt) {
    aiThinkAt = now + 260 + Math.random() * 260;
    if (gap > 190) aiPlan = "approach";
    else if (gap > 125 && gap < 390 && enemy.isGrounded() && enemyMana > 0 && now >= aiSpecialAt && Math.random() < .6) aiPlan = "jumpSpecial";
    else if (gap > 95 && gap < 185 && enemy.isGrounded() && Math.random() < .32) aiPlan = "jumpAttack";
    else if (gap < 125 && now >= aiAttackAt && Math.random() < .7) aiPlan = "attack";
    else aiPlan = Math.random() < .55 ? "retreat" : "approach";
  }
  enemy.velocity.x = 0;
  if (aiPlan === "approach" && gap > 82) {
    enemy.velocity.x = distance > 0 ? 3.1 : -3.1;
    enemy.setFacing(enemy.velocity.x > 0 ? 1 : -1);
  }
  if (aiPlan === "retreat" && gap < 190) {
    enemy.velocity.x = distance > 0 ? -2.2 : 2.2;
  }
  if (aiPlan === "jumpAttack") {
    enemy.setFacing(distance > 0 ? 1 : -1);
    if (enemy.isGrounded()) enemy.jump();
    enemy.velocity.x = enemy.facing * 2.7;
    if (!enemy.isGrounded() && gap < 145 && now >= aiAttackAt) {
      enemy.attack("attack2", enemy.facing * 3.2);
      aiAttackAt = now + 850;
      aiPlan = "approach";
    }
  }
  if (aiPlan === "jumpSpecial") {
    enemy.setFacing(distance > 0 ? 1 : -1);
    if (enemy.isGrounded()) enemy.jump();
    enemy.velocity.x = enemy.facing * 2.4;
    if (!enemy.isGrounded() && now >= aiSpecialAt) {
      launchEnemySpecial();
      aiSpecialAt = now + 1800;
      aiPlan = "approach";
    }
  }
  if (aiPlan === "attack" && gap < 130 && now >= aiAttackAt) {
    const movingAttack = gap > 82 && Math.random() < 0.65;
    enemy.setFacing(distance > 0 ? 1 : -1);
    enemy.attack(movingAttack ? "attack2" : "attack1", movingAttack ? enemy.facing * 3.2 : 0);
    aiAttackAt = now + 720;
    aiPlan = "retreat";
  }
}
function spawnHitParticles(target, palette = target.hitPalette, count = 9, scale = 1) {
  if (hitParticles.length >= 48) return;
  // Anchor the burst on the character's rendered torso, not the collision box.
  const x = target.position.x + target.width / 2 + (target.facing === 1 ? 12 : -12);
  const y = target.position.y + 84;
  for (let particleIndex = 0; particleIndex < count; particleIndex++) {
    hitParticles.push({
      x, y,
      vx: (Math.random() - .5) * 5.5 * scale,
      vy: (-Math.random() * 4.5 - .8) * scale,
      size: (Math.random() < .25 ? 5 : 3) * scale,
      life: 18 + Math.floor(Math.random() * 10),
      color: palette[Math.random() < .35 ? 1 : 0],
    });
  }
}
function drawHitParticles() {
  for (let index = hitParticles.length - 1; index >= 0; index--) {
    const particle = hitParticles[index];
    particle.x += particle.vx;
    particle.y += particle.vy;
    particle.vy += .23;
    particle.life--;
    if (particle.life <= 0) { hitParticles.splice(index, 1); continue; }
    c.fillStyle = particle.color;
    c.fillRect(Math.round(particle.x), Math.round(particle.y), particle.size, particle.size);
  }
}
window.addEventListener("gameover", () => {
  gameOver = true;
  paused = false;
  setTimerPaused(true);
  result.textContent = player.health === enemy.health ? "Draw" : player.health > enemy.health ? "You win!" : "Enemy wins";
  overlay.classList.add("visible");
});
pauseButton.addEventListener("click", () => setPaused(!paused));
rematchButton.addEventListener("click", () => window.location.reload());

decreaseTimer();

function animate() {
  window.requestAnimationFrame(animate);
  c.fillStyle = "black";
  c.fillRect(0, 0, canvas.width, canvas.height);
  background.update();
  shop.update();
  if (gameOver || paused) {
    player.draw();
    enemy.draw();
    return;
  }
  updateMana(performance.now());
  updateCharge(performance.now());
  player.update();
  enemy.update();
  drawChargeEffect();
  updateProjectiles();
  drawHitParticles();

  // player movement
  player.velocity.x = 0;

  if (keys.a.pressed && player.lastKey == "a") {
    player.velocity.x = -5;
  } else if (keys.d.pressed && player.lastKey == "d") {
    player.velocity.x = 5;
  }

  updateEnemyAI();

  updateFighterState(player, keys.a.pressed, keys.d.pressed);
  updateFighterState(enemy, enemy.velocity.x < 0, enemy.velocity.x > 0);

  //detect for collision
  //player
  if (
    rectangularCollision({ rect1: player, rect2: enemy }) && // also this idk ?
    player.canDealDamage()
  ) {
    player.attackHasLanded = true;
    enemy.takeHit(20);
    spawnHitParticles(enemy);
    enemyHealth.style.width = enemy.health + "%";
  }

  //enemy
  if (
    rectangularCollision({ rect1: enemy, rect2: player }) && // also this idk ?
    enemy.canDealDamage()
  ) {
    enemy.attackHasLanded = true;
    player.takeHit(20);
    spawnHitParticles(player);
    playerHealth.style.width = player.health + "%";
  }

  //game end based on health
  if (enemy.health <= 0 || player.health <= 0) {
    endGame();
  }
}

animate();

//event listener

window.addEventListener("keydown", (event) => {
  if ([" ", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(event.key)) event.preventDefault();
  if (event.key === "Escape" || event.key.toLowerCase() === "p") {
    setPaused(!paused);
    return;
  }
  if (gameOver && event.key.toLowerCase() === "r") {
    window.location.reload();
    return;
  }
  if (gameOver || paused) return;
  if (event.repeat) return;
  switch (event.key) {
    case "d":
      keys.d.pressed = true;
      player.lastKey = "d";
      player.setFacing(1);
      break;

    case "a":
      keys.a.pressed = true;
      player.lastKey = "a";
      player.setFacing(-1);
      break;

    case "w":
      player.jump();
      break;

    case " ":
      player.attack(keys.a.pressed || keys.d.pressed ? "attack2" : "attack1");
      break;

    case "s":
      if (mana > 0 && !player.dead && !player.isAttacking) {
        chargeStartedAt = performance.now();
        player.chargePower = 0;
        player.isCharging = true;
        player.switchSprite("idle");
      }
      break;

    default:
      break;
  }
});

window.addEventListener("keyup", (event) => {
  switch (event.key) {
    case "d":
      keys.d.pressed = false;
      break;

    case "a":
      keys.a.pressed = false;
      break;

    case "w":
      keys.w.pressed = false;
      break;

    case " ": {
      break;
    }

    case "s": {
      if (!player.isCharging) break;
      const chargeTime = performance.now() - chargeStartedAt;
      const chargePower = Math.min(1, Math.max(0, (chargeTime - minChargeTime) / (maxChargeTime - minChargeTime)));
      player.isCharging = false;
      player.chargePower = 0;
      if (chargeTime >= minChargeTime && mana > 0) launchSpecial(chargePower);
      break;
    }

    default:
      break;
  }
});

window.addEventListener("blur", () => {
  keys.a.pressed = false;
  keys.d.pressed = false;
  keys.w.pressed = false;
  player.isCharging = false;
  player.chargePower = 0;
});
