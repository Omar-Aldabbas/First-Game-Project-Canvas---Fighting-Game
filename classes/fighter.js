import { Sprite } from "./sprite.js";

export class Fighter extends Sprite {
  constructor({
    position,
    velocity,
    color = "red",
    gravity = 0.7,
    c,
    canvas,
    imageSrc,
    framesMax = 1,
    offset = { x: 0, y: 0 },
    sprites,

    renderHeight = 200,

    attackOffset = { x: 0, y: 0 },
    nativeFacing = 1,
    hitPalette = ["#b3202a", "#ffb36b"],
  }) {
    super({
      position,
      imageSrc,
      framesMax,
      offset,
      c,
      renderHeight,
    });

    this.velocity = velocity;

    this.width = 54;
    this.height = 132;

    this.lastKey = undefined;
    this.facing = nativeFacing;
    this.nativeFacing = nativeFacing;
    this.hitPalette = hitPalette;

    this.attackBox = {
      position: {
        x: this.position.x,
        y: this.position.y,
      },

      offset: attackOffset,

      width: 100,
      height: 50,
    };

    this.color = color;

    this.isAttacking = false;
    this.attackHasLanded = false;
    this.attackDamageFrame = 0;
    this.attackStartedAt = 0;
    this.attackHitDelay = 0;
    this.attackHitEndAt = 0;
    this.dead = false;
    this.stateLockUntil = 0;
    this.isTakingHit = false;
    this.jumpsUsed = 0;
    this.airAttackUsed = false;
    this.isCharging = false;
    this.chargePower = 0;

    this.health = 100;

    this.gravity = gravity;

    this.canvas = canvas;

    this.sprites = sprites;

    for (const sprite in this.sprites) {
      this.sprites[sprite].image = new Image();

      this.sprites[sprite].image.src = this.sprites[sprite].imageSrc;
    }
  }

  update() {
    super.update();

    this.attackBox.position.x =
      this.facing === 1
        ? this.position.x + this.width - 4
        : this.position.x - this.attackBox.width + 4;

    this.attackBox.position.y = this.position.y + this.attackBox.offset.y;

    this.position.x = Math.max(
      0,
      Math.min(
        this.canvas.width - this.width,
        this.position.x + this.velocity.x,
      ),
    );

    this.position.y += this.velocity.y;

    const groundY = this.canvas.height - 120;

    if (this.position.y + this.height + this.velocity.y >= groundY) {
      this.velocity.y = 0;
      this.jumpsUsed = 0;
      this.airAttackUsed = false;

      this.position.y = groundY - this.height;
    } else {
      this.velocity.y += this.gravity;
    }
  }

  attack(spriteName = "attack1", lungeVelocity = 0) {
    const airborne = !this.isGrounded();
    if (
      this.dead ||
      this.isCharging ||
      this.isAttacking ||
      (airborne && this.airAttackUsed)
    )
      return;
    if (airborne) {
      spriteName = "attack2";
      this.airAttackUsed = true;
    }
    this.isAttacking = true;
    this.attackHasLanded = false;
    const attackSprite = this.sprites[spriteName];
    this.attackDamageFrame = Math.max(
      1,
      Math.floor(attackSprite.framesMax * 0.55),
    );
    this.velocity.x = lungeVelocity;
    this.switchSprite(spriteName);
    const duration =
      attackSprite.framesMax * (attackSprite.framesHold ?? 5) * (1000 / 60);
    this.attackStartedAt = performance.now();
    this.attackHitDelay = duration * 0.58;
    this.attackHitEndAt =
      this.attackStartedAt +
      (this.attackDamageFrame + 1) *
        (attackSprite.framesHold ?? 5) *
        (1000 / 60);
    setTimeout(() => {
      this.isAttacking = false;
    }, duration);
  }

  canDealDamage() {
    return (
      this.isAttacking &&
      !this.attackHasLanded &&
      this.currentFrame >= this.attackDamageFrame &&
      performance.now() - this.attackStartedAt >= this.attackHitDelay &&
      performance.now() <= this.attackHitEndAt
    );
  }

  jump() {
    if (this.dead || this.isTakingHit || this.jumpsUsed >= 2) return;
    this.velocity.y = -12;
    this.jumpsUsed++;
  }

  isGrounded() {
    const groundY = this.canvas.height - 120;
    return (
      this.velocity.y === 0 && this.position.y + this.height >= groundY - 1
    );
  }

  switchSprite(name) {
    const sprite = this.sprites[name];

    if (!sprite) return;

    if (this.image === sprite.image) return;

    this.image = sprite.image;
    this.framesMax = sprite.framesMax;
    this.framesHold = sprite.framesHold ?? 5;
    this.loop = sprite.loop ?? true;

    this.currentFrame = 0;
    this.framesElapsed = 0;
  }

  setFacing(direction) {
    if (!direction) return;
    this.facing = direction;
    this.flip = this.facing !== this.nativeFacing;
  }

  takeHit(damage) {
    if (this.dead) return;
    this.isAttacking = false;
    this.isCharging = false;
    this.chargePower = 0;
    this.health = Math.max(0, this.health - damage);
    if (this.health === 0) {
      this.dead = true;
      this.switchSprite("death");
    } else {
      const hitSprite = this.sprites.takeHit;
      const hitDuration =
        (hitSprite.framesMax + 1) * (hitSprite.framesHold ?? 5) * (1000 / 60);
      this.isTakingHit = true;
      this.stateLockUntil = Date.now() + hitDuration;
      this.switchSprite("takeHit");
      setTimeout(() => {
        this.isTakingHit = false;
      }, hitDuration);
    }
  }
}
