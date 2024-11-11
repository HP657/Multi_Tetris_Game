class GameWsClient {
  constructor(serverUrl, onGameStartCallback) {
    this.serverUrl = serverUrl;
    this.socket = null;
    this.onGameStartCallback = onGameStartCallback;
  }

  connect() {
    this.socket = new WebSocket(this.serverUrl);

    this.socket.onopen = () => {
      console.log("WebSocket 연결됨");
    };

    this.socket.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.action === "player_connected") {
        console.log("접속");
      } else if (data.action === "start_game") {
        console.log("게임 시작 메시지 수신");

        // 게임 시작 콜백 호출
        if (this.onGameStartCallback) {
          this.onGameStartCallback();
        }
      }
    };

    this.socket.onclose = () => {
      console.log("WebSocket 연결 종료됨");
    };

    this.socket.onerror = (error) => {
      console.error("WebSocket 에러:", error);
    };
  }

  add_player(name) {
    const message = {
      action: "add_player",
      playerName: name,
    };
    this.sendMessage(message);
  }

  sendMessage(message) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(message));
    } else {
      console.error("WebSocket이 열려 있지 않음");
    }
  }
}

export default GameWsClient;
