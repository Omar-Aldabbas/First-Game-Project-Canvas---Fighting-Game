const canvas = document.querySelector("canvas");
const c = canvas.getContext("2d");

canvas.width = 1024;
canvas.height = 574;

// x, y, topleft then the 3rd and 4th widht and height
// this menas that from the top left and full width and height fill this rec
c.fillRect(0, 0, canvas.width, canvas.height);

const gravity = 0.7;

class Sprite {
  /**
   *
   */
  constructor({ position, velocity, color = "red", offset }) {
    this.position = position;
    this.velocity = velocity;
    this.height = 150;
    this.width = 50;
    this.lastKey;
    this.attackBox = {
      position: {
        x: this.position.x,
        y: this.position.y,
      },
      offset: offset,
      width: 100,
      height: 50,
    };
    this.color = color;
    this.isAttacking = false;
  }

  draw() {
    c.fillStyle = this.color;
    c.fillRect(this.position.x, this.position.y, this.width, this.height);

    //attack
    if (this.isAttacking) {
    c.fillStyle = "green";
    c.fillRect(
      this.attackBox.position.x,
      this.attackBox.position.y,
      this.attackBox.width,
      this.attackBox.height,
    );
    }
  }

  update() {
    this.draw();
    this.attackBox.position.x = this.position.x + this.attackBox.offset.x;
    this.attackBox.position.y = this.position.y;

    this.position.x += this.velocity.x;

    // movement on y
    this.position.y += this.velocity.y;

    if (this.position.y + this.height + this.velocity.y >= canvas.height) {
      this.velocity.y = 0;
    } else {
      this.velocity.y += gravity;
    }
  }

  attack() {
    this.isAttacking = true;

    setTimeout(() => {
      this.isAttacking = false;
    }, 100);
  }
}

// player
const player = new Sprite({
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
});

const enemy = new Sprite({
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

function rectangularCollision( {rect1, rect2} ) {
  return (
    rect1.attackBox.position.x + rect1.attackBox.width >= rect2.position.x && // i understand this its for when we are in the left side of enemy
    rect1.attackBox.position.x <= rect2.position.x + rect2.width && // this when we are in the right side of the enemy
    rect1.attackBox.position.y + rect1.attackBox.height >= rect2.position.y && // this when we are in top of the enemy ?
    rect1.attackBox.position.y <= rect2.position.y + rect2.height
  );
}

function animate() {
  window.requestAnimationFrame(animate);
  c.fillStyle = "black";
  c.fillRect(0, 0, canvas.width, canvas.height);
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
    rectangularCollision( { rect1:player, rect2: enemy }) && // also this idk ?
    player.isAttacking
  ) {
    player.isAttacking = false;
    console.log("PLAYER: attack");
  }

  //enemy
    if (
    rectangularCollision( { rect1:enemy, rect2: player }) && // also this idk ?
    enemy.isAttacking
  ) {
    enemy.isAttacking = false;
    console.log("ENEMY: attack");
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

    case 'ArrowDown':
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
