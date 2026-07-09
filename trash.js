const contentElement = document.querySelector("canvas");

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

const cursorImage = document.getElementById("cursorImage");
let activeZoneId = null;

const imageMap = ["egg.png", "myeon.png", "soup.png", "fah.png"];

const clickZones = [
  { id: 0, x: 125, y: 80, width: 100, height: 50 },
  { id: 1, x: 10, y: 80, width: 100, height: 50 },
  { id: 2, x: 10, y: 20, width: 100, height: 50 },
  { id: 3, x: 125, y: 20, width: 100, height: 50 },
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
    activeZoneId = clickedZone.id;

    const imageFile = imageMap[clickedZone.id];
    cursorImage.src = `assets/images/game_assets/${imageFile}`;

    cursorImage.style.display = "block";

    cursorImage.style.left = mouseX + "px";
    cursorImage.style.top = mouseY + "px";
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
  }
});
