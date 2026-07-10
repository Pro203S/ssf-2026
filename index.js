document.addEventListener("DOMContentLoaded", async () => {
    const mainBg = document.querySelector("#mainBg");
    /** @type {HTMLButtonElement} */
    const howToBtn = document.querySelector("#howToBtn");
    /** @type {HTMLLinkElement} */
    const gameBtn = document.querySelector("#gameBtn");

    const steam = new AudioPlayer("/assets/sounds/sfx/steam_short.mp3");
    await steam.load();

    howToBtn.addEventListener("mouseenter", () => {
        steam.play();
    });
    gameBtn.addEventListener("mouseenter", () => {
        steam.play();
    });

    const player = new AudioPlayer("/assets/sounds/bgm/main.mp3", true, 4.324);
    await player.load();
    player.play();
});
