export class Sprite {
  /**
   *
   */
  constructor({ position, imageSrc, c, width, height, framesMax = 1, offset = { x: 0,y: 0 }}) {
    this.position = position;
    this.image = new Image();

    this.image.src = imageSrc;
    this.c = c;
    this.width = width;
    this.height = height;
    this.framesMax = framesMax;
    this.currentFrame = 0;
    this.framesElapsed = 0;
    this.framesHold = 16;
    this.offset = offset;
  }

  draw() {
    if (this.width && this.height) {
      const frameWidth = Math.floor(this.image.naturalWidth / this.framesMax);

      this.c.imageSmoothingEnabled = false;

      this.c.drawImage(
        this.image,

        // source
        this.currentFrame * frameWidth + 4,
        0,
        frameWidth + 4,
        this.image.naturalHeight,

        // destination
        this.position.x - this.offset.x,
        this.position.y - this.offset.y,
        this.width / this.framesMax,
        this.height,
      );
    } else {
      this.c.drawImage(this.image, this.position.x, this.position.y);
    }
  }

  update() {
    this.draw();

    this.framesElapsed++;

    if (this.framesElapsed % this.framesHold === 0) {
      if (this.currentFrame < this.framesMax - 1) {
        this.currentFrame++;
      } else {
        this.currentFrame = 0;
      }
    }
  }
}
