export class Sprite {
  constructor({
    position,
    imageSrc,
    c,
    framesMax = 1,
    offset = { x: 0, y: 0 },
    renderWidth,
    renderHeight,
    cover = false,
  }) {
    this.position = position;
    this.image = new Image();
    this.image.src = imageSrc;
    this.c = c;
    this.framesMax = framesMax;
    this.currentFrame = 0;
    this.framesElapsed = 0;
    this.framesHold = 5;
    this.offset = offset;
    this.renderWidth = renderWidth;
    this.renderHeight = renderHeight;
    this.cover = cover;
    this.loop = true;
    this.flip = false;
  }

  draw() {
    if (!this.image.complete || !this.image.naturalWidth) return;
    const sourceWidth = this.image.naturalWidth / this.framesMax;
    const sourceHeight = this.image.naturalHeight;
    const height = this.renderHeight ?? sourceHeight;
    const width = this.renderWidth ?? sourceWidth * (height / sourceHeight);
    this.c.imageSmoothingEnabled = false;
    if (this.cover) {
      const scale = Math.max(width / sourceWidth, height / sourceHeight);
      const cropWidth = width / scale;
      const cropHeight = height / scale;
      this.c.drawImage(
        this.image,
        (this.image.naturalWidth - cropWidth) / 2,
        (sourceHeight - cropHeight) / 2,
        cropWidth,
        cropHeight,
        this.position.x,
        this.position.y,
        width,
        height,
      );
      return;
    }
    const x = this.position.x - this.offset.x;
    const y = this.position.y - this.offset.y;
    if (this.flip) {
      this.c.save();
      this.c.translate(x + width, y);
      this.c.scale(-1, 1);
      this.c.drawImage(
        this.image,
        this.currentFrame * sourceWidth,
        0,
        sourceWidth,
        sourceHeight,
        0,
        0,
        width,
        height,
      );
      this.c.restore();
    } else {
      this.c.drawImage(
        this.image,
        this.currentFrame * sourceWidth,
        0,
        sourceWidth,
        sourceHeight,
        x,
        y,
        width,
        height,
      );
    }
  }

  animateFrames() {
    this.framesElapsed++;
    if (this.framesElapsed % this.framesHold !== 0) return;
    if (this.currentFrame < this.framesMax - 1) this.currentFrame++;
    else if (this.loop) this.currentFrame = 0;
  }
  update() {
    this.draw();
    this.animateFrames();
  }
}
