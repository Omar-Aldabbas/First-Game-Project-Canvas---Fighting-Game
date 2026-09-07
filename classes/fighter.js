 export class Fighter {
  /**
   *
   */
  constructor({ position, velocity, color = "red", offset , gravity = 0.7, c, canvas }) {
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
    this.health = 100;
    this.c = c;
    this.gravity = gravity;
    this.canvas = canvas;
  }

  draw() {
    this.c.fillStyle = this.color;
    this.c.fillRect(this.position.x, this.position.y, this.width, this.height);

    //attack
    if (this.isAttacking) {
      this.c.fillStyle = "green";
      this.c.fillRect(
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