const contentElement = document.querySelector("canvas");
const gameContainer = document.querySelector(".game-container");

const cursorImage = document.getElementById("cursorImage");
const pot = document.getElementById("pot");

// 현재 마우스로 들고 있는 재료/도구의 clickZones id.
// null이면 아무것도 들고 있지 않은 상태다.
let activeZoneId = null;

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
];

function getTargetZone(mouseX, mouseY) {
    return clickZones.find(
        (zone) =>
            mouseX >= zone.x &&
            mouseX <= zone.x + zone.width &&
            mouseY >= zone.y &&
            mouseY <= zone.y + zone.height,
    );
}

contentElement.addEventListener("click", function (event) {
    const rect = contentElement.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

    const clickedZone = getTargetZone(mouseX, mouseY);

    if (clickedZone !== undefined) {
        // 재료(id 0~3)를 들고 냄비(id 5~8)를 클릭한 경우.
        // 현재 조건에서는 스프(id 2)는 냄비에 바로 추가하지 않는다.
        if (
            0 <= activeZoneId &&
            3 >= activeZoneId &&
            5 <= clickedZone.id &&
            8 >= clickedZone.id &&
            activeZoneId != null &&
            activeZoneId != 2
        ) {
            // clickedZone.id - 5는 cookingPotStatus에서의 냄비 인덱스다.
            if (!cookingPotStatus[clickedZone.id - 5][activeZoneId]) {
                cookingPotStatus[clickedZone.id - 5][activeZoneId] = 1;
                const cookingPotIndicator = document.createElement("img");

                // clickedZone.id - 4는 CSS의 pot1-indicator ~ pot4-indicator 번호와 맞춘다.
                cookingPotIndicator.className = `indicator pot${clickedZone.id - 4}-indicator`;
                cookingPotIndicator.src = `assets/images/game_assets/${ingredientInCookingPotImageMap[activeZoneId]}`;

                gameContainer.appendChild(cookingPotIndicator);

                activeZoneId = null;
            }
        } else if (5 <= clickedZone.id && 8 >= clickedZone.id) {
            // 냄비만 클릭한 경우. 추후 조리 상태 확인/완성 처리 등을 넣을 자리.
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
