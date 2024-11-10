const ws = new WebSocket("ws://localhost:3000");

ws.onopen = () => {
  console.log("WebSocket 서버에 연결됨");

  ws.send(
    JSON.stringify({
      action: "show_player",
    })
  );
};

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log("받은 메시지:", data);

  if (data.action === "show_player") {
    // data.players가 정의되어 있고, 배열인지 확인
    const players = Array.isArray(data.players) ? data.players : [];
    updatePlayerList(players); // 배열이 아니거나 없으면 빈 배열로 처리
  }
};

function updatePlayerList(players) {
  console.log("플레이어 목록 업데이트:", players);

  const playerListElement = document.getElementById("admin-player-list");
  playerListElement.innerHTML = ""; // 기존 목록 비우기

  // players가 배열인지 확인
  if (Array.isArray(players)) {
    players.forEach((player) => {
      const li = document.createElement("li");
      li.textContent = player; // 플레이어 이름을 리스트 항목에 추가
      playerListElement.appendChild(li);
    });
  } else {
    console.error("players가 배열이 아닙니다:", players);
  }
}
