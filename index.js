const express = require("express");
const path = require("path");
const WebSocket = require("ws");
const app = express();
const port = 3000;

const wss = new WebSocket.Server({ noServer: true });
let playerList = []; // 플레이어 이름만 관리

wss.on("connection", (ws) => {
  console.log("새로운 클라이언트 연결됨");

  ws.on("message", (message) => {
    try {
      const data = JSON.parse(message);

      if (data.action === "add_player" && data.playerName) {
        ws.playerName = data.playerName; // 플레이어 이름 저장
        playerList.push(data.playerName); // 이름만 저장
        broadcastPlayerList();
        ws.send(
          JSON.stringify({
            action: "player_connected",
            playerName: data.playerName,
          })
        );
      } else if (data.action === "show_player") {
        // 'show_player' 요청 시 현재 접속한 플레이어 목록을 응답
        ws.send(
          JSON.stringify({
            action: "show_player",
            playerList: playerList,
          })
        );
      }
    } catch (err) {
      console.error("메시지 처리 오류:", err);
      ws.send(
        JSON.stringify({
          action: "error",
          message: "잘못된 메시지 형식입니다.",
        })
      );
    }
  });

  ws.on("close", () => {
    console.log("클라이언트 연결 종료");
    playerList = playerList.filter((player) => player !== ws.playerName); // 종료된 플레이어 제거
    broadcastPlayerList();
  });
});

function broadcastPlayerList() {
  const playerNames = playerList;
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(
        JSON.stringify({
          action: "show_player",
          players: playerNames,
        })
      );
    }
  });
}

app.use(express.static(path.join(__dirname, "public")));
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "game", "index.html"));
});

app.get("/admin", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "admin", "index.html"));
});

app.server = app.listen(port, () => {
  console.log(`서버가 http://localhost:${port}에서 실행 중`);
});

app.server.on("upgrade", (request, socket, head) => {
  wss.handleUpgrade(request, socket, head, (ws) => {
    wss.emit("connection", ws, request);
  });
});
