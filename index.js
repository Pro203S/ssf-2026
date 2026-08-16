let bgStatus = 0;

document.addEventListener("DOMContentLoaded", async () => {
    const game = document.querySelector("#game");
    const mainBg = document.querySelector("#mainBg");
    const howToBtn = document.querySelector("#howToBtn");
    const gameBtn = document.querySelector("#gameBtn");

    // 게임방법 되돌리기
    game.addEventListener("click", () => {
        if (bgStatus !== 1) return;

        mainBg.src = "/assets/images/backgrounds/main.png";
        howToBtn.style.display = null;
        gameBtn.style.display = null;
        bgStatus = 0;
    });

    // 게임방법
    howToBtn.addEventListener("click", () => {
        mainBg.src = "/assets/images/backgrounds/tutorial.png";
        howToBtn.style.display = "none";
        gameBtn.style.display = "none";
        setTimeout(() => {
            // 바로 바꾸면 안떠서 0.1초 뒤에 바꾸기
            bgStatus = 1;
        }, 100);
    });

    // 증기 소리 재생
    const steam = new AudioPlayer("/assets/sounds/sfx/steam_short.mp3");
    await steam.load();

    howToBtn.addEventListener("mouseenter", () => {
        steam.play();
    });
    gameBtn.addEventListener("mouseenter", () => {
        steam.play();
    });

    // BGM 재생
    const player = new AudioPlayer("/assets/sounds/bgm/main.mp3", true, 4.324);
    await player.load();
    player.play();
});
