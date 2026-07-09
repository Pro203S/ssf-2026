const contentElement = document.querySelector("canvas");
const gameContainer = document.querySelector(".game-container");

const cursorImage = document.getElementById("cursorImage");
const pot = document.getElementById("pot");
const scoreDisplay = document.getElementById("scoreDisplay");
const hudIncome = document.getElementById("hudIncome");
const hudTimer = document.getElementById("hudTimer");
const timerFill = document.getElementById("timerFill");
const heldCookingPot = document.getElementById("heldCookingPot");

// 현재 마우스로 들고 있는 재료/도구의 clickZones id.
// null이면 아무것도 들고 있지 않은 상태다.
let activeZoneId = null;
let heldCookingPotIndex = null;
let balance = 0;
const TOTAL_TIME = 60;
let timeLeft = TOTAL_TIME;
let gameActive = true;

const RAMEN_PRICE = 1000;
const WIN_THRESHOLD = 10000;
const MIN_BOIL_TIME = 5;

// 냄비별 조리 상태.
// 바깥 배열: 냄비 4개, 안쪽 배열: [달걀, 면, 수프, 파, 물, 끓이는 시간]
let cookingPotStatus = [
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

// clickZones id 0~4에 대응하는 커서 이미지.
const imageMap = [
    "egg.png",
    "noodles.png",
    "soup.png",
    "green_onion.png",
    "pot_handle.png",
];

// 재료를 냄비에 넣었을 때 냄비 위에 표시할 이미지.
// activeZoneId 0~3과 같은 순서다.
const ingredientInCookingPotImageMap = [
    "egg_in_cooking_pot.png",
    "noodles_in_cooking_pot.png",
    "soup_in_cooking_pot.png",
    "green_onion_in_cooking_pot.png",
];

// 캔버스 기준 클릭 영역.
// x, y는 캔버스의 왼쪽 위를 (0, 0)으로 잡은 좌표다.
// id 0~4는 선택 가능한 재료/도구, id 5~8은 냄비 영역이다.
const clickZones = [
    { id: 0, x: 125, y: 80, width: 100, height: 50 },   // 계란
    { id: 1, x: 10, y: 80, width: 100, height: 50 },    // 면
    { id: 2, x: 10, y: 20, width: 100, height: 50 },    // 스프
    { id: 3, x: 125, y: 20, width: 100, height: 50 },   // 파
    { id: 4, x: 290, y: 200, width: 100, height: 150 }, // 주전자
    { id: 8, x: 177, y: 195, width: 90, height: 70 },   // 4번 냄비, 오른쪽 위
    { id: 5, x: 40, y: 195, width: 90, height: 70 },    // 1번 냄비, 왼쪽 위
    { id: 7, x: 145, y: 270, width: 90, height: 70 },   // 3번 냄비, 오른쪽 아래
    { id: 6, x: 5, y: 270, width: 90, height: 70 },     // 2번 냄비, 왼쪽 아래
    { id: 9, x: 470, y: 200, width: 100, height: 120 }, // 트레이
];

const pourPositions = [
    { bottom: "205px", left: "20px" },
    { bottom: "130px", left: "-20px" },
    { bottom: "130px", left: "120px" },
    { bottom: "205px", left: "155px" },
];

// 넣는 순서와 관계없이 면 -> 계란 -> 파 -> 스프 순으로 보여줌
const INGREDIENT_ORDER = [1, 0, 3, 2];

const INCOME_BOX = {
    game: { left: 483, top: 81, width: 95, height: 22, baseFont: 22 },
    end: { left: 440, top: 170, width: 76, height: 22, baseFont: 20 },
};

function applyIncomeBoxLayout(mode) {
    const box = INCOME_BOX[mode];
    hudIncome.style.left = `${box.left}px`;
    hudIncome.style.top = `${box.top}px`;
    hudIncome.style.width = `${box.width}px`;
    hudIncome.style.height = `${box.height}px`;
    hudIncome.dataset.incomeMode = mode;
    hudIncome.dataset.baseFont = String(box.baseFont);
}

function updateTimerDisplay() {
    const percent = Math.max(0, (timeLeft / TOTAL_TIME) * 100);
    timerFill.style.width = `${percent}%`;
}

function updateScoreDisplay() {
    const text = balance.toLocaleString();
    scoreDisplay.textContent = text;

    const mode = hudIncome.dataset.incomeMode || "game";
    const box = INCOME_BOX[mode];
    let size = box.baseFont;
    const minSize = 11;
    const maxWidth = hudIncome.clientWidth - 2;

    scoreDisplay.style.lineHeight = `${box.height}px`;
    scoreDisplay.style.fontSize = `${size}px`;

    while (scoreDisplay.scrollWidth > maxWidth && size > minSize) {
        size -= 1;
        scoreDisplay.style.fontSize = `${size}px`;
    }
}

function getCookingPotParts(cookingPotIndex) {
    const cookingPotNumber = cookingPotIndex + 1;
    return {
        pot: document.querySelector(`.cooking-pot.pot${cookingPotNumber}`),
        clip: document.querySelector(`.pot${cookingPotNumber}-clip`),
        water: document.querySelector(`.pot${cookingPotNumber}-water`),
        guard: document.querySelector(`.cooking-pot-guard.pot${cookingPotNumber}`),
    };
}

function positionHeldCookingPot(mouseX, mouseY) {
    heldCookingPot.style.left = `${mouseX}px`;
    heldCookingPot.style.top = `${mouseY}px`;
}

function pickUpCookingPot(cookingPotIndex, mouseX, mouseY) {
    heldCookingPotIndex = cookingPotIndex;
    const parts = getCookingPotParts(cookingPotIndex);

    heldCookingPot.append(parts.pot, parts.clip, parts.water, parts.guard);
    heldCookingPot.style.display = "block";
    positionHeldCookingPot(mouseX, mouseY);
    updateWaterLayer(cookingPotIndex);
    cursorImage.style.display = "none";
}

function putDownCookingPot(cookingPotIndex) {
    const parts = getCookingPotParts(cookingPotIndex);
    const insertBefore = heldCookingPot;

    gameContainer.insertBefore(parts.pot, insertBefore);
    gameContainer.insertBefore(parts.clip, insertBefore);
    gameContainer.insertBefore(parts.water, insertBefore);
    gameContainer.insertBefore(parts.guard, insertBefore);

    parts.pot.style.cssText = "";
    parts.clip.style.cssText = "";
    parts.water.style.cssText = "";
    parts.guard.style.cssText = "";

    heldCookingPot.style.display = "none";
    updateWaterLayer(cookingPotIndex);
}

function resetCookingPotSlot(cookingPotIndex) {
    cookingPotStatus[cookingPotIndex] = [0, 0, 0, 0, 0, 0];
    refreshCookingPot(cookingPotIndex);
}

function canServeRamen(cookingPotIndex) {
    const potStatus = cookingPotStatus[cookingPotIndex];
    return (
        potStatus[0] &&
        potStatus[1] &&
        potStatus[2] &&
        potStatus[3] &&
        potStatus[4] &&
        potStatus[5] >= MIN_BOIL_TIME
    );
}

function serveCookingPot(cookingPotIndex) {
    if (canServeRamen(cookingPotIndex)) {
        balance += RAMEN_PRICE;
        updateScoreDisplay();
    }

    putDownCookingPot(cookingPotIndex);
    resetCookingPotSlot(cookingPotIndex);
}

function endGame() {
    gameActive = false;

    if (heldCookingPotIndex !== null) {
        putDownCookingPot(heldCookingPotIndex);
        heldCookingPotIndex = null;
    }

    gameContainer.classList.add("game-ended");
    hudTimer.style.display = "none";
    hudIncome.classList.add("hud-income--end");
    applyIncomeBoxLayout("end");

    status = balance > WIN_THRESHOLD ? "success" : "failed";
    updateBackground(status);
    updateScoreDisplay();
    cursorImage.style.display = "none";
    pot.style.display = "none";
    activeZoneId = null;
    heldCookingPotIndex = null;
}

function startGameTimers() {
    setInterval(() => {
        if (!gameActive) return;

        for (let i = 0; i < 4; i++) {
            if (cookingPotStatus[i][4] && heldCookingPotIndex !== i) {
                cookingPotStatus[i][5]++;
            }
        }
    }, 1000);

    setInterval(() => {
        if (!gameActive) return;

        timeLeft--;
        updateTimerDisplay();

        if (timeLeft <= 0) {
            endGame();
        }
    }, 1000);
}

applyIncomeBoxLayout("game");
updateScoreDisplay();
updateTimerDisplay();
startGameTimers();

function getTargetZone(mouseX, mouseY) {
    return clickZones.find(
        (zone) =>
            mouseX >= zone.x &&
            mouseX <= zone.x + zone.width &&
            mouseY >= zone.y &&
            mouseY <= zone.y + zone.height,
    );
}

function updateWaterLayer(cookingPotIndex) {
    const cookingPotNumber = cookingPotIndex + 1;
    const water = document.querySelector(`.pot${cookingPotNumber}-water`);
    if (!water) return;

    if (!cookingPotStatus[cookingPotIndex][4]) {
        water.style.display = "none";
        return;
    }

    water.style.display = "block";
    water.classList.toggle("has-soup", !!cookingPotStatus[cookingPotIndex][2]);
}

function createSoupDots(cookingPotIndex) {
    const dots = document.createElement("div");
    dots.className = "soup-dots cooking-pot-item";
    dots.dataset.cookingPot = cookingPotIndex;

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

function refreshCookingPot(cookingPotIndex) {
    const cookingPotNumber = cookingPotIndex + 1;
    const clip = document.querySelector(`.pot${cookingPotNumber}-clip`);
    clip
        .querySelectorAll(`.cooking-pot-item[data-cooking-pot="${cookingPotIndex}"]`)
        .forEach((el) => el.remove());

    for (const ingredientId of INGREDIENT_ORDER) {
        if (!cookingPotStatus[cookingPotIndex][ingredientId]) continue;

        if (ingredientId === 2) {
            clip.appendChild(createSoupDots(cookingPotIndex));
            continue;
        }

        const cookingPotIndicator = document.createElement("img");
        cookingPotIndicator.className = "indicator cooking-pot-item";
        cookingPotIndicator.dataset.cookingPot = cookingPotIndex;
        cookingPotIndicator.src = `assets/images/game_assets/${ingredientInCookingPotImageMap[ingredientId]}`;
        clip.appendChild(cookingPotIndicator);
    }

    updateWaterLayer(cookingPotIndex);
}

function resetCursor() {
    activeZoneId = null;
    pot.style.display = "block";
    cursorImage.style.display = "none";
}

function pourWater(cookingPotIndex) {
    const pourEl = document.createElement("img");
    pourEl.className = "pour-animation";
    pourEl.src = "assets/images/game_assets/pot_pouring.png";
    const pos = pourPositions[cookingPotIndex];
    pourEl.style.bottom = pos.bottom;
    pourEl.style.left = pos.left;
    gameContainer.appendChild(pourEl);

    setTimeout(() => {
        pourEl.remove();
        refreshCookingPot(cookingPotIndex);
    }, 600);
}

contentElement.addEventListener("click", function (event) {
    if (!gameActive) return;

    const rect = contentElement.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

    const clickedZone = getTargetZone(mouseX, mouseY);

    // 허공을 클릭하면 들고 있는 재료/주전자/냄비를 원래 자리로 되돌린다.
    if (clickedZone === undefined) {
        if (heldCookingPotIndex !== null) {
            putDownCookingPot(heldCookingPotIndex);
            heldCookingPotIndex = null;
        } else if (activeZoneId !== null) {
            resetCursor();
        }
        return;
    }

    if (clickedZone !== undefined) {
        const cookingPotIndex = clickedZone.id - 5;

        if (clickedZone.id === 9) {
            if (heldCookingPotIndex !== null) {
                const servedPotIndex = heldCookingPotIndex;
                heldCookingPotIndex = null;
                serveCookingPot(servedPotIndex);
            }
            return;
        }

        // 주전자를 든 채로 주전자 자리를 다시 클릭하면 내려놓는다.
        if (activeZoneId === 4 && clickedZone.id === 4) {
            resetCursor();
            return;
        }

        // 재료(id 0~3)를 들고 냄비(id 5~8)를 클릭한 경우.
        if (
            0 <= activeZoneId &&
            3 >= activeZoneId &&
            5 <= clickedZone.id &&
            8 >= clickedZone.id &&
            activeZoneId != null
        ) {
            if (!cookingPotStatus[cookingPotIndex][activeZoneId]) {
                cookingPotStatus[cookingPotIndex][activeZoneId] = 1;
                refreshCookingPot(cookingPotIndex);
                activeZoneId = null;
            }
        } else if (
            activeZoneId === 4 &&
            5 <= clickedZone.id &&
            8 >= clickedZone.id
        ) {
            // 주전자를 들고 냄비를 클릭한 경우.
            if (!cookingPotStatus[cookingPotIndex][4]) {
                cookingPotStatus[cookingPotIndex][4] = 1;
                pourWater(cookingPotIndex);
                resetCursor();
            }
        } else if (5 <= clickedZone.id && 8 >= clickedZone.id) {
            if (heldCookingPotIndex === cookingPotIndex) {
                heldCookingPotIndex = null;
                putDownCookingPot(cookingPotIndex);
            } else if (activeZoneId === null && heldCookingPotIndex === null) {
                pickUpCookingPot(cookingPotIndex, mouseX, mouseY);
            }
        } else {
            // 재료나 주전자를 클릭하면 해당 아이템을 커서에 붙인다.
            activeZoneId = clickedZone.id;

            if (activeZoneId == 4) {
                pot.style.display = "none";
                cursorImage.style.maxWidth = "none";
            } else {
                pot.style.display = "block";
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
    if (!gameActive) return;

    const rect = contentElement.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

    const hoveredZone = getTargetZone(mouseX, mouseY);

    contentElement.style.cursor =
        hoveredZone !== undefined ? "pointer" : "default";

    if (heldCookingPotIndex !== null) {
        positionHeldCookingPot(mouseX, mouseY);
    } else if (activeZoneId !== null) {
        cursorImage.style.left = mouseX + "px";
        cursorImage.style.top = mouseY + "px";
    } else {
        cursorImage.style.display = "none";
    }
});
