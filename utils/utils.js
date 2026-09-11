import { player, enemy } from "../index.js";

export function rectangularCollision({ rect1, rect2 }) {
  return (
    rect1.attackBox.position.x + rect1.attackBox.width >= rect2.position.x && // i understand this its for when we are in the left side of enemy
    rect1.attackBox.position.x <= rect2.position.x + rect2.width && // this when we are in the right side of the enemy
    rect1.attackBox.position.y + rect1.attackBox.height >= rect2.position.y && // this when we are in top of the enemy ?
    rect1.attackBox.position.y <= rect2.position.y + rect2.height
  );
}

export function determineWinner({ player, enemy, timerId }) {
  clearTimeout(timerId);
  const resultBlock = document.querySelector(".result");

  if (player.health === enemy.health) {
    resultBlock.textContent = "Tie";
  } else if (player.health > enemy.health) {
    resultBlock.textContent = "Player 1 Win";
  } else {
    resultBlock.textContent = "Player 2 Win";
  }

  resultBlock.style.display = "flex";
}

let timer = 60;
export let timerId;
export function decreaseTimer() {
  if (timer > 0) {
    timerId = setTimeout(decreaseTimer, 1000);
    timer--;

    document.querySelector(".timer").innerHTML = timer;
  }

  if (timer === 0) {
    determineWinner({ player, enemy, timerId });
  }
}
