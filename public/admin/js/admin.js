import AdminWsClient from "./AdminWsClient.js";

const ws = new AdminWsClient("ws://localhost:3000");
ws.connect();

const startGameButton = document.getElementById("start-game");
startGameButton.addEventListener("click", () => {
  ws.sendMessage({
    action: "start_game",
  });
  console.log("게임 시작 메시지를 서버로 보냄");
});
