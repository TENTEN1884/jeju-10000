// ============================================
// 상태
// ============================================
const activeCategories = new Set(); // 현재 켜져 있는 카테고리들
const markersByCategory = {}; // category -> [L.Marker, ...]

// ============================================
// 지도 초기화 (제주도 중심)
// ============================================
const map = L.map("map", {
  scrollWheelZoom: true,
}).setView([33.38, 126.55], 10);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "&copy; OpenStreetMap contributors",
  maxZoom: 18,
}).addTo(map);

// ============================================
// 커스텀 핀 아이콘 생성
// ============================================
function makeIcon(category) {
  const cat = CATEGORIES[category];
  return L.divIcon({
    className: "",
    html: `<div class="spot-marker" style="background:${cat.color}"><span>${cat.emoji}</span></div>`,
    iconSize: [34, 34],
    iconAnchor: [17, 34],
    popupAnchor: [0, -30],
  });
}

// ============================================
// 필터 버튼 자동 생성
// ============================================
const filterBar = document.getElementById("filterBar");

Object.entries(CATEGORIES).forEach(([key, cat]) => {
  const btn = document.createElement("button");
  btn.className = "cat-item";
  btn.style.setProperty("--cat-color", cat.color);
  btn.dataset.category = key;
  btn.innerHTML = `
    <span class="cat-circle">
      <span class="cat-emoji">${cat.emoji}</span>
      <span class="cat-check">✓</span>
    </span>
    <span class="cat-label">${cat.label}</span>
  `;
  btn.addEventListener("click", () => toggleCategory(key, btn));
  filterBar.appendChild(btn);
});

// ============================================
// 카테고리 토글
// ============================================
function toggleCategory(key, btn) {
  if (activeCategories.has(key)) {
    activeCategories.delete(key);
    btn.classList.remove("active");
    removeMarkers(key);
  } else {
    activeCategories.add(key);
    btn.classList.add("active");
    addMarkers(key);
  }
  updateHint();
}

function updateHint() {
  const hint = document.getElementById("mapHint");
  hint.classList.toggle("hide", activeCategories.size > 0);
}

// ============================================
// 마커 추가/제거
// ============================================
function addMarkers(category) {
  const spots = SPOTS.filter((s) => s.category === category);
  const markers = spots.map((spot) => {
    const marker = L.marker([spot.lat, spot.lng], {
      icon: makeIcon(category),
    });

    marker.bindTooltip(
      `<div class="popup-title">${CATEGORIES[category].emoji} ${spot.name}</div><div class="popup-hint">클릭해서 자세히 보기</div>`,
      { direction: "top", offset: [0, -30] }
    );

    marker.on("click", () => showDetail(spot));
    marker.addTo(map);
    return marker;
  });
  markersByCategory[category] = markers;
}

function removeMarkers(category) {
  (markersByCategory[category] || []).forEach((m) => map.removeLayer(m));
  delete markersByCategory[category];
}

// ============================================
// 상세 정보 패널
// ============================================
const detailPanel = document.getElementById("detailPanel");
const detailEmpty = document.getElementById("detailEmpty");
const detailContent = document.getElementById("detailContent");
const detailBadge = document.getElementById("detailBadge");
const detailName = document.getElementById("detailName");
const detailPrice = document.getElementById("detailPrice");
const detailDesc = document.getElementById("detailDesc");
const detailClose = document.getElementById("detailClose");

function showDetail(spot) {
  const cat = CATEGORIES[spot.category];

  detailEmpty.hidden = true;
  detailContent.hidden = false;

  detailBadge.textContent = `${cat.emoji} ${cat.label}`;
  detailBadge.style.background = cat.color;

  detailName.textContent = spot.name;
  detailPrice.textContent = `💰 ${spot.price}`;
  detailDesc.textContent = spot.desc;

  detailPanel.scrollIntoView({ behavior: "smooth", block: "start" });
}

detailClose.addEventListener("click", () => {
  detailContent.hidden = true;
  detailEmpty.hidden = false;
});
