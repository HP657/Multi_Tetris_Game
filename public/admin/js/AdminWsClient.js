class AdminWsClient {
  constructor(serverUrl) {
    this.serverUrl = serverUrl;
    this.socket = null;
  }

  connect() {
    this.socket = new WebSocket(this.serverUrl);

    this.socket.onopen = () => {
      console.log("WebSocket 연결됨");
      // 서버에 초기 show_player 요청을 보냅니다.
      this.socket.send(
        JSON.stringify({
          action: "show_player",
        })
      );
    };

    this.socket.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.action === "show_player") {
        this.updatePlayerList(data.players);
      }
    };

    this.socket.onclose = () => {
      console.log("Admin WebSocket 연결 종료됨");
    };

    this.socket.onerror = (error) => {
      console.error("Admin WebSocket 에러:", error);
    };
  }

  // 서버로 메시지 보내기
  sendMessage(message) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(message));
    } else {
      console.error("WebSocket이 열려 있지 않음");
    }
  }

  // 플레이어 목록 업데이트
  updatePlayerList(players) {
    const playerListElement = document.getElementById("admin-player-list");
    playerListElement.innerHTML = ""; // 기존 목록 비우기

    players.forEach((player) => {
      const li = document.createElement("li");
      li.textContent = player;
      playerListElement.appendChild(li);
    });
  }
}

export default AdminWsClient;
