class AdminWsClient {
  constructor(serverUrl) {
    this.serverUrl = serverUrl;
    this.socket = null;
  }

  connect() {
    this.socket = new WebSocket(this.serverUrl);

    this.socket.onopen = () => {
      console.log("WebSocket 연결됨");
      this.requestPlayerList(); // 연결 시 서버에 플레이어 목록 요청
    };

    this.socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log("받은 메시지:", data);

      if (data.action === "show_player") {
        this.updatePlayerList(data.playerList); // 서버에서 받은 플레이어 목록 업데이트
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

  // 서버에 플레이어 목록 요청
  requestPlayerList() {
    // 서버에 'show_player' 액션 메시지 보내기
    this.sendMessage({ action: "show_player" });
  }

  // 플레이어 목록 업데이트
  updatePlayerList(players) {
    console.log("플레이어 목록 업데이트:", players);

    const playerListElement = document.getElementById("admin-player-list");
    playerListElement.innerHTML = ""; // 기존 목록 비우기

    // players가 배열인지 확인하고 처리
    if (Array.isArray(players)) {
      players.forEach((player) => {
        const li = document.createElement("li");
        li.textContent = player;
        playerListElement.appendChild(li);
      });
    } else {
      console.error("players가 배열이 아닙니다:", players);
    }
  }
}

export default AdminWsClient;
