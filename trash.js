const contentElement = document.querySelector("canvas");
const gameContainer = document.querySelector(".game-container");

const cursorImage = document.getElementById("cursorImage");
const jujeonja = document.getElementById("jujeonja");
let activeZoneId = null;

// 코드 짜기 개귀찮으니
// 이것의 의미는 달걀, 면, 수프, 파, 물, 끓이는 시간
let nambiStatus = [
  [0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0],
];

let status = "game";

const bgImages = {
  success: 'url("assets/images/backgrounds/good_end.png")',
  failed: 'url("assets/images/backgrounds/bad_end.png")',
  default: 'url("assets/images/backgrounds/main.png")',
  tutorial: 'url("assets/images/backgrounds/tutorial.png")',
  game: 'url("assets/images/backgrounds/game.png")',
};

function updateBackground(currentStatus) {
  const imageUrl = bgImages[currentStatus] || bgImages.default;
  contentElement.style.backgroundImage = imageUrl;
}

updateBackground(status);

const imageMap = [
  "egg.png",
  "myeon.png",
  "soup.png",
  "fah.png",
  "jujeonja_handle.png",
];

const nambiImageMap = [
  "egg_in_nambi.png",
  "myeon_in_nambi.png",
  "soup_in_nambi.png",
  "fah_in_nambi.png",
];

const clickZones = [
  { id: 0, x: 125, y: 80, width: 100, height: 50 },
  { id: 1, x: 10, y: 80, width: 100, height: 50 },
  { id: 2, x: 10, y: 20, width: 100, height: 50 },
  { id: 3, x: 125, y: 20, width: 100, height: 50 },
  { id: 4, x: 290, y: 200, width: 100, height: 150 },
  { id: 8, x: 177, y: 195, width: 90, height: 70 },
  { id: 5, x: 40, y: 195, width: 90, height: 70 },
  { id: 7, x: 145, y: 270, width: 90, height: 70 },
  { id: 6, x: 5, y: 270, width: 90, height: 70 },
];

const pourPositions = [
  { bottom: "205px", left: "20px" },
  { bottom: "130px", left: "-20px" },
  { bottom: "130px", left: "120px" },
  { bottom: "205px", left: "155px" },
];

// 넣는 순서와 관계없이 면 -> 계란 -> 파 -> 스프 순으로 보여줌
const INGREDIENT_ORDER = [1, 0, 3, 2];

function getTargetZone(mouseX, mouseY) {
  return clickZones.find(
    (zone) =>
      mouseX >= zone.x &&
      mouseX <= zone.x + zone.width &&
      mouseY >= zone.y &&
      mouseY <= zone.y + zone.height,
  );
}

function updateWaterLayer(potIndex) {
  const water = document.querySelector(`.n${potIndex + 1}-water`);
  if (!water) return;

  if (!nambiStatus[potIndex][4]) {
    water.style.display = "none";
    return;
  }

  water.style.display = "block";
  water.classList.toggle("has-soup", !!nambiStatus[potIndex][2]);
}

function createSoupDots(potIndex) {
  const dots = document.createElement("div");
  dots.className = "soup-dots pot-item";
  dots.dataset.pot = potIndex;

  const positions = [
    [22, 38],
    [38, 32],
    [52, 40],
    [30, 52],
    [46, 48],
    [58, 52],
    [34, 62],
    [50, 58],
    [42, 42],
    [56, 44],
  ];

  for (const [left, top] of positions) {
    const dot = document.createElement("span");
    dot.className = "soup-dot";
    dot.style.left = `${left}%`;
    dot.style.top = `${top}%`;
    dots.appendChild(dot);
  }

  return dots;
}

function refreshPot(potIndex) {
  const clip = document.querySelector(`.n${potIndex + 1}-clip`);
  clip
    .querySelectorAll(`.pot-item[data-pot="${potIndex}"]`)
    .forEach((el) => el.remove());

  for (const ingId of INGREDIENT_ORDER) {
    if (!nambiStatus[potIndex][ingId]) continue;

    if (ingId === 2) {
      clip.appendChild(createSoupDots(potIndex));
      continue;
    }

    const nambiIndi = document.createElement("img");
    nambiIndi.className = "indi pot-item";
    nambiIndi.dataset.pot = potIndex;
    nambiIndi.src = `assets/images/game_assets/${nambiImageMap[ingId]}`;
    clip.appendChild(nambiIndi);
  }

  updateWaterLayer(potIndex);
}

function resetCursor() {
  activeZoneId = null;
  jujeonja.style.display = "block";
  cursorImage.style.display = "none";
}

function pourWater(potIndex) {
  const pourEl = document.createElement("img");
  pourEl.className = "pour-animation";
  pourEl.src = "assets/images/game_assets/jujeonja_ddara.png";
  const pos = pourPositions[potIndex];
  pourEl.style.bottom = pos.bottom;
  pourEl.style.left = pos.left;
  gameContainer.appendChild(pourEl);

  setTimeout(() => {
    pourEl.remove();
    refreshPot(potIndex);
  }, 600);
}

contentElement.addEventListener("click", function (event) {
  const rect = contentElement.getBoundingClientRect();
  const mouseX = event.clientX - rect.left;
  const mouseY = event.clientY - rect.top;

  const clickedZone = getTargetZone(mouseX, mouseY);

  if (clickedZone !== undefined) {
    if (
      0 <= activeZoneId &&
      3 >= activeZoneId &&
      5 <= clickedZone.id &&
      8 >= clickedZone.id &&
      activeZoneId != null
    ) {
      // 아이템 -> 냄비 때
      const potIndex = clickedZone.id - 5;
      if (!nambiStatus[potIndex][activeZoneId]) {
        nambiStatus[potIndex][activeZoneId] = 1;
        refreshPot(potIndex);
        activeZoneId = null;
      }
    } else if (
      activeZoneId === 4 &&
      5 <= clickedZone.id &&
      8 >= clickedZone.id
    ) {
      // 주전자 -> 냄비 때
      const potIndex = clickedZone.id - 5;
      if (!nambiStatus[potIndex][4]) {
        nambiStatus[potIndex][4] = 1;
        pourWater(potIndex);
        resetCursor();
      }
    } else if (5 <= clickedZone.id && 8 >= clickedZone.id) {
      //레전드 빈 코드
    } else {
      activeZoneId = clickedZone.id;

      if (activeZoneId == 4) {
        jujeonja.style.display = "none";
        cursorImage.style.maxWidth = "none";
      } else {
        jujeonja.style.display = "block";
        cursorImage.style.maxWidth = "130px";
      }

      const imageFile = imageMap[clickedZone.id];
      cursorImage.src = `assets/images/game_assets/${imageFile}`;

      cursorImage.style.display = "block";

      cursorImage.style.left = mouseX + "px";
      cursorImage.style.top = mouseY + "px";
    }
  }
});

contentElement.addEventListener("mousemove", function (event) {
  const rect = contentElement.getBoundingClientRect();
  const mouseX = event.clientX - rect.left;
  const mouseY = event.clientY - rect.top;

  const hoveredZone = getTargetZone(mouseX, mouseY);

  contentElement.style.cursor =
    hoveredZone !== undefined ? "pointer" : "default";

  if (activeZoneId !== null) {
    cursorImage.style.left = mouseX + "px";
    cursorImage.style.top = mouseY + "px";
  } else {
    cursorImage.style.display = "none";
  }
});
