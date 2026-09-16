// ============================================
// 카톡 스타일 인트로 대화 스크립트
// who: "me" (나, 오른쪽/노란풍선) | "friend" (친구, 왼쪽/흰풍선)
// ============================================
const CHAT_SCRIPT = [
  { who: "me", text: "야, 우리 제주도 놀러가자" },
  { who: "friend", text: "제주도? 너무 비싸... 저번에 갔다가 깜짝 놀랐잖아 ㅠㅠ" },
  { who: "me", text: "ㅋㅋㅋ 그럴 줄 알았어" },
  { who: "me", text: "근데 나 이번엔 다른 방법 찾았음" },
  { who: "friend", text: "..? 무슨 방법?" },
  { who: "me", text: "제주도, 만원으로도 놀 수 있더라 🍊" },
  { who: "friend", text: "그게 말이 됨?" },
  { who: "me", text: "지도로 보여줄게, 잠깐만 기다려봐" },
];

const TYPING_TIME = 800; // 타이핑 인디케이터가 보이는 시간
const GAP_TIME = 350; // 말풍선이 뜬 후 다음 순서까지 텀
const END_DELAY = 1100; // 마지막 메시지 후 지도로 전환되기까지 대기 시간

const chatBody = document.getElementById("chatBody");
const introOverlay = document.getElementById("introOverlay");
const introSkip = document.getElementById("introSkip");

function nowLabel() {
  const now = new Date();
  const h = now.getHours();
  const m = now.getMinutes();
  const period = h < 12 ? "오전" : "오후";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${period} ${h12}:${String(m).padStart(2, "0")}`;
}

function scrollToBottom() {
  chatBody.scrollTop = chatBody.scrollHeight;
}

function showTyping(who) {
  const row = document.createElement("div");
  row.className = `msg-row ${who}`;
  row.innerHTML = `
    ${who === "friend" ? `<div class="msg-avatar">🙂</div>` : ""}
    <div class="typing-bubble"><span></span><span></span><span></span></div>
  `;
  chatBody.appendChild(row);
  scrollToBottom();
  return row;
}

function appendMessage({ who, text }) {
  const row = document.createElement("div");
  row.className = `msg-row ${who}`;
  const avatar = who === "friend" ? `<div class="msg-avatar">🙂</div>` : "";

  row.innerHTML = `
    ${avatar}
    <div class="msg-col">
      <div class="msg-line">
        <div class="bubble"></div>
        <span class="msg-time">${nowLabel()}</span>
      </div>
    </div>
  `;
  row.querySelector(".bubble").textContent = text;
  chatBody.appendChild(row);
  scrollToBottom();
}

let sequenceRunning = true;

function playSequence(index) {
  if (!sequenceRunning) return;

  if (index >= CHAT_SCRIPT.length) {
    setTimeout(exitIntro, END_DELAY);
    return;
  }

  const msg = CHAT_SCRIPT[index];
  const typingRow = showTyping(msg.who);

  setTimeout(() => {
    typingRow.remove();
    appendMessage(msg);
    setTimeout(() => playSequence(index + 1), GAP_TIME);
  }, TYPING_TIME);
}

function exitIntro() {
  if (!sequenceRunning) return;
  sequenceRunning = false;

  introOverlay.classList.add("exit");
  document.body.classList.remove("intro-active");

  setTimeout(() => {
    introOverlay.classList.add("hidden");
  }, 650);
}

introSkip.addEventListener("click", exitIntro);

// 첫 메시지는 살짝 뒤에 시작 (화면 진입 여유)
setTimeout(() => playSequence(0), 500);
