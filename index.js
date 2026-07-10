const MAIN_BG = "/assets/images/backgrounds/main.png";
const TUTORIAL_BG = "/assets/images/backgrounds/tutorial.png";

const game = document.getElementById("game");
const mainBg = document.getElementById("mainBg");
const howtoBtn = document.getElementById("howtoBtn");

function showTutorial() {
    game.classList.add("is-tutorial");
    mainBg.src = TUTORIAL_BG;
    mainBg.alt = "게임 설명";
}

function showMain() {
    game.classList.remove("is-tutorial");
    mainBg.src = MAIN_BG;
    mainBg.alt = "슈의 라면집";
}

howtoBtn.addEventListener("click", function (event) {
    event.preventDefault();
    showTutorial();
});

mainBg.addEventListener("click", function () {
    if (game.classList.contains("is-tutorial")) {
        showMain();
    }
});
