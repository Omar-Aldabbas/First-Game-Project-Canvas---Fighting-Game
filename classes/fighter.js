 import { Sprite } from "./sprite.js";
 export class Fighter extends Sprite {
  /**
   *
   */
  constructor({ position, velocity, color = "red" , gravity = 0.7, c, canvas ,imageSrc, framesMax = 1, offset = { x:0, y:0 }}) {
    super({position, imageSrc, framesMax, offset})
    this.velocity = velocity;
    this.height = 300;
    this.width = 400;
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
    this.health = 100;
    this.c = c;
    this.gravity = gravity;
    this.canvas = canvas;
        this.currentFrame = 0;
    this.framesElapsed = 0;
    this.framesHold = 12;
  }


  update() {
    super.update();

        this.framesElapsed++;

    if (this.framesElapsed % this.framesHold === 0) {
      if (this.currentFrame < this.framesMax - 1) {
        this.currentFrame++;
      } else {
        this.currentFrame = 0;
      }
    }
    this.attackBox.position.x = this.position.x + this.attackBox.offset.x;
    this.attackBox.position.y = this.position.y;

    this.position.x += this.velocity.x;

    // movement on y
    this.position.y += this.velocity.y;

    if (this.position.y + this.height + this.velocity.y >= this.canvas.height - 118) {
      this.velocity.y = 0;
    } else {
      this.velocity.y += this.gravity;
    }
  }

  attack() {
    this.isAttacking = true;

    setTimeout(() => {
      this.isAttacking = false;
    }, 100);
  }
}