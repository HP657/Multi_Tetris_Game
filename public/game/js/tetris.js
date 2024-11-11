import BLOCKS from "./blocks.js";
import GameWsClient from "./GameWsClient.js";

// WebSocket 객체 생성 시, startGame 콜백 전달
const ws = new GameWsClient("ws://localhost:3000", startGame);
ws.connect();

// 기존 게임 로직
const playground = document.querySelector(".playground > ul");
const gameText = document.querySelector(".game-text");
const scoreDisplay = document.querySelector(".score");
const nameInputDiv = document.querySelector(".name-input");
const playerNameInput = document.querySelector("#player-name");
const finishNameInput = document.querySelector("#fin-name-input");
const waitingDiv = document.querySelector(".waiting");

const GAME_ROWS = 20;
const GAME_COLS = 10;

let score = 0;
let playerName = "";
let duration = 500;
let downInterval;
let tempMovingItem;

const movingItem = {
  type: "",
  direction: 0,
  top: 0,
  left: 4,
};

function init() {
  scoreDisplay.innerText = score;
  tempMovingItem = { ...movingItem };

  playground.innerHTML = ""; // 플레이그라운드 초기화
  for (let i = 0; i < GAME_ROWS; i++) {
    prependNewLine();
  }
  generateNewBlock();
}

function prependNewLine() {
  const li = document.createElement("li");
  const ul = document.createElement("ul");
  for (let j = 0; j < GAME_COLS; j++) {
    const metrix = document.createElement("li");
    ul.prepend(metrix);
  }
  li.prepend(ul);
  playground.prepend(li);
}

function renderBlocks(moveType = "") {
  const { type, direction, top, left } = tempMovingItem;
  const movingBlocks = document.querySelectorAll(".moving");

  movingBlocks.forEach((moving) => {
    moving.classList.remove(type, "moving");
  });

  BLOCKS[type][direction].some((block) => {
    const x = block[0] + left;
    const y = block[1] + top;
    const target = playground.childNodes[y]
      ? playground.childNodes[y].childNodes[0].childNodes[x]
      : null;

    if (checkEmpty(target)) {
      target.classList.add(type, "moving");
    } else {
      tempMovingItem = { ...movingItem };
      if (moveType === "retry") {
        clearInterval(downInterval);
        showGameoverText();
      }
      setTimeout(() => {
        renderBlocks("retry");
        if (moveType === "top") seizeBlock();
      }, 0);
      return true;
    }
  });
  movingItem.left = left;
  movingItem.top = top;
  movingItem.direction = direction;

  // WebSocket을 통해 서버로 블록 이동 정보 전송
  if (moveType !== "retry") {
    ws.sendMessage({
      action: "move_block",
      playerName,
      block: { ...movingItem },
    });
  }
}

function seizeBlock() {
  const movingBlocks = document.querySelectorAll(".moving");
  movingBlocks.forEach((moving) => {
    moving.classList.remove("moving");
    moving.classList.add("seized");
  });
  checkMatch();
}

function checkMatch() {
  const childNodes = playground.childNodes;
  childNodes.forEach((child) => {
    let matched = true;
    child.children[0].childNodes.forEach((li) => {
      if (!li.classList.contains("seized")) {
        matched = false;
      }
    });
    if (matched) {
      child.remove();
      prependNewLine();
      score++;
      scoreDisplay.innerText = score;
    }
  });
  generateNewBlock();
}

function generateNewBlock() {
  clearInterval(downInterval);
  downInterval = setInterval(() => {
    moveBlock("top", 1);
  }, duration);

  const blockArray = Object.entries(BLOCKS);
  const randomIndex = Math.floor(Math.random() * blockArray.length);
  Object.assign(movingItem, {
    type: blockArray[randomIndex][0],
    top: 0,
    left: 3,
    direction: 0,
  });
  tempMovingItem = { ...movingItem };
  renderBlocks();
}

function checkEmpty(target) {
  return target && !target.classList.contains("seized");
}

function moveBlock(moveType, amount) {
  tempMovingItem[moveType] += amount;
  renderBlocks(moveType);
}

function changeDirection() {
  tempMovingItem.direction = (tempMovingItem.direction + 1) % 4;
  renderBlocks();
}

function dropBlock() {
  clearInterval(downInterval);
  downInterval = setInterval(() => {
    moveBlock("top", 1);
  }, 25);
}

function showGameoverText() {
  gameText.style.display = "flex";
}

function showWaitingPage() {
  nameInputDiv.style.display = "none";
  waitingDiv.style.display = "flex";
}

document.addEventListener("keydown", (event) => {
  switch (event.keyCode) {
    case 39:
      moveBlock("left", 1);
      break;
    case 37:
      moveBlock("left", -1);
      break;
    case 40:
      moveBlock("top", 1);
      break;
    case 38:
      changeDirection();
      break;
    case 32:
      dropBlock();
      break;
    default:
      break;
  }
});

// 게임 시작 시 호출되는 함수
function startGame() {
  if (playerName) {
    console.log("게임이 시작됩니다!");
    waitingDiv.style.display = "none";
    playground.innerHTML = "";
    gameText.style.display = "none";
    init();
  }
}

// 이름 입력 후 서버에 전달
finishNameInput.addEventListener("click", () => {
  playerName = playerNameInput.value;
  if (playerName) {
    ws.add_player(playerName);
    showWaitingPage();
  } else {
    alert("Please enter your name.");
  }
});
