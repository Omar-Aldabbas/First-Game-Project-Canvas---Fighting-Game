import { Fighter } from "./classes/fighter.js";
import { Sprite } from "./classes/sprite.js";
import { decreaseTimer, rectangularCollision, determineWinner } from "./utils/utils.js";

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
  imageSrc: './assets/background.png',
  c,
  width: canvas.width,
  height: canvas.height,
})


const shop = new Sprite({
  position: {
    x: 700,
    y: 20,
  },
  imageSrc: './assets/store.png',
  c,
  width: 1200,
  height: 650,
  framesMax: 8,
})

// player
const player = new Fighter({
  position: {
    x: 0,
    y: 0,
  },
  velocity: {
    x: 0,
    y: 10,
  },
  offset: {
    x: 0,
    y: 0,
  },
  c,
  canvas,
  width: canvas.width,
  height: canvas.height,
});

const enemy = new Fighter({
  position: {
    x: 400,
    y: 50,
  },
  velocity: {
    x: 10,
    y: 10,
  },
  offset: {
    x: -50,
    y: 0,
  },
  color: "blue",
  c,
  canvas
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

decreaseTimer();

function animate() {
  window.requestAnimationFrame(animate);
  c.fillStyle = "black";
  c.fillRect(0, 0, canvas.width, canvas.height);
  background.update();
  shop.update();
  player.update();
  enemy.update();

  // why?  to stop the sprite from moving

  // player movement
  player.velocity.x = 0;

  if (keys.a.pressed && player.lastKey == "a") {
    player.velocity.x = -5;
  } else if (keys.d.pressed && player.lastKey == "d") {
    player.velocity.x = 5;
  }

  // enemy movement
  enemy.velocity.x = 0;

  if (keys.ArrowLeft.pressed && enemy.lastKey == "ArrowLeft") {
    enemy.velocity.x = -5;
  } else if (keys.ArrowRight.pressed && enemy.lastKey == "ArrowRight") {
    enemy.velocity.x = 5;
  }

  //detect for collision
  //player
  if (
    rectangularCollision({ rect1: player, rect2: enemy }) && // also this idk ?
    player.isAttacking
  ) {
    player.isAttacking = false;
    console.log("PLAYER: attack");
    enemy.health -= 20;
    document.querySelector(".enemy-health-fill").style.width =
      enemy.health + "%";

    console.log(document.querySelector(".enemy-health-fill").style.width);
  }

  //enemy
  if (
    rectangularCollision({ rect1: enemy, rect2: player }) && // also this idk ?
    enemy.isAttacking
  ) {
    enemy.isAttacking = false;
    console.log("ENEMY: attack");
    player.health -= 20;
    document.querySelector(".player-health-fill").style.width =
      player.health + "%";
  }

  //game end based on health
  if (enemy.health <= 0 || player.health <= 0) {
    determineWinner({ player, enemy, timerId });
  }
}

animate();

//event listener

window.addEventListener("keydown", (event) => {
  switch (event.key) {
    case "d":
      keys.d.pressed = true;
      player.lastKey = "d";
      break;

    case "a":
      keys.a.pressed = true;
      player.lastKey = "a";
      break;

    case "w":
      player.velocity.y = -10;
      break;

    case "ArrowRight":
      keys.ArrowRight.pressed = true;
      enemy.lastKey = "ArrowRight";
      break;

    case "ArrowLeft":
      keys.ArrowLeft.pressed = true;
      enemy.lastKey = "ArrowLeft";
      break;

    case "ArrowUp":
      enemy.velocity.y = -10;
      break;

    case " ":
      player.attack();
      break;

    case "ArrowDown":
      enemy.attack();
      break;

    default:
      console.log(event.key);
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

    case "ArrowRight":
      keys.ArrowRight.pressed = false;
      break;

    case "ArrowLeft":
      keys.ArrowLeft.pressed = false;
      break;

    case "ArrowUp":
      keys.ArrowUp.pressed = false;
      break;

    default:
      console.log(event.key);
      break;
  }
});
