import BLOCKS from "./blocks.js";
import GameWsClient from "./GameWsClient.js";

// DOM elements
const playground = document.querySelector(".playground > ul");
const gameText = document.querySelector(".game-text");
const scoreDisplay = document.querySelector(".score");
const restartButton = document.querySelector(".game-text > button");
const nameInputDiv = document.querySelector(".name-input");
const playerNameInput = document.querySelector("#player-name");
const startGameButton = document.querySelector("#start-game");

// Game settings
const GAME_ROWS = 20;
const GAME_COLS = 10;

// Variables
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

// Initialize WebSocket client
const ws = new GameWsClient("ws://localhost:3000");
ws.connect();

// Functions
function init() {
  score = 0; // Reset score
  scoreDisplay.innerText = score; // Display the score

  tempMovingItem = { ...movingItem };

  // Create the playground grid
  for (let i = 0; i < GAME_ROWS; i++) {
    prependNewLine();
  }

  // Generate the first block
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

  // 현재 이동 중인 블록들에 대한 처리를 제거
  movingBlocks.forEach((moving) => {
    moving.classList.remove(type, "moving");
  });

  // 새로운 블록을 그리드에 렌더링
  BLOCKS[type][direction].some((block) => {
    const x = block[0] + left;
    const y = block[1] + top;
    const target = playground.childNodes[y]
      ? playground.childNodes[y].childNodes[0].childNodes[x]
      : null;

    const isAvailable = checkEmpty(target);

    if (isAvailable) {
      target.classList.add(type, "moving");
    } else {
      tempMovingItem = { ...movingItem };
      if (moveType === "retry") {
        clearInterval(downInterval);
        showGameoverText();
      }
      setTimeout(() => {
        renderBlocks("retry");
        if (moveType === "top") {
          seizeBlock();
        }
      }, 0);
      return true;
    }
  });

  movingItem.left = left;
  movingItem.top = top;
  movingItem.direction = direction;

  // WebSocket을 통해 블록 이동 정보를 다른 클라이언트로 전송
  if (ws.socket && ws.socket.readyState === WebSocket.OPEN) {
    const message = {
      action: "move_block",
      playerName,
      block: {
        type: movingItem.type,
        direction: movingItem.direction,
        top: movingItem.top,
        left: movingItem.left,
      },
    };
    ws.sendMessage(message);
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
  movingItem.type = blockArray[randomIndex][0];
  movingItem.top = 0;
  movingItem.left = 3;
  movingItem.direction = 0;
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
  const direction = tempMovingItem.direction;
  tempMovingItem.direction = direction === 3 ? 0 : direction + 1;
  renderBlocks();
}

function dropBlock() {
  clearInterval(downInterval);
  downInterval = setInterval(() => {
    moveBlock("top", 1);
  }, 10);
}

function showGameoverText() {
  gameText.style.display = "flex";
}

// Event handling
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

restartButton.addEventListener("click", () => {
  playground.innerHTML = "";
  gameText.style.display = "none";
  init();
});

startGameButton.addEventListener("click", () => {
  playerName = playerNameInput.value;
  if (playerName) {
    ws.add_player(playerName);
    nameInputDiv.style.display = "none";
    playground.innerHTML = "";
    gameText.style.display = "none";
    init();
  } else {
    alert("Please enter your name.");
  }
});
