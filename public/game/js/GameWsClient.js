class GameWsClient {
  constructor(serverUrl) {
    this.serverUrl = serverUrl;
    this.socket = null;
  }

  connect() {
    this.socket = new WebSocket(this.serverUrl);

    this.socket.onopen = () => {
      console.log("WebSocket 연결됨");

      // WebSocket 연결 후, 일정 시간마다 서버에 요청을 보내기
      this.startAutoRequest();
    };

    this.socket.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.action === "player_connected") {
        console.log("접속");
      }
    };

    this.socket.onclose = () => {
      console.log("WebSocket 연결 종료됨");
    };

    this.socket.onerror = (error) => {
      console.error("WebSocket 에러:", error);
    };
  }

  startAutoRequest() {
    // 일정 시간마다 서버에 요청을 보내는 코드 (예: 5초마다 요청)
    this.autoRequestInterval = setInterval(() => {
      if (this.socket && this.socket.readyState === WebSocket.OPEN) {
        const message = {
          action: "get_game_status", // 서버에 요청할 액션
        };
        this.sendMessage(message);
      }
    }, 5000); // 5초마다 요청
  }

  stopAutoRequest() {
    clearInterval(this.autoRequestInterval); // 요청 중지
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
