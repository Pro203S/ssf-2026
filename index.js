import { createDragFollow } from './library.js';

const POT_SRC = 'https://placehold.co/80x70/f1c40f/333?text=냄비';

document.addEventListener('DOMContentLoaded', () => {
    /** @type {HTMLImageElement | null} */
    const kettleEl = document.querySelector('.kettle');
    if (!kettleEl || !(kettleEl.parentElement instanceof HTMLElement)) return;

    const kettleHome = kettleEl.parentElement;

    /** @type {HTMLElement | null} */
    const scoreDisplay = document.querySelector('.score-display');
    let score = Number.parseInt(scoreDisplay?.textContent ?? '0', 10) || 0;

    const updateScore = () => {
        if (scoreDisplay) scoreDisplay.textContent = String(score);
    };

    const addScore = (amount) => {
        score += amount;
        updateScore();
    };

    /**
     * @param {number} x
     * @param {number} y
     * @returns {HTMLImageElement | null}
     */
    const findPotAtPoint = (x, y) => {
        for (const el of document.elementsFromPoint(x, y)) {
            if (!(el instanceof Element)) continue;
            if (el.closest('.kettle')) continue;
            const pot = el.closest('.pot');
            if (pot instanceof HTMLImageElement) return pot;
        }
        return null;
    };

    /**
     * @param {HTMLImageElement} pot
     */
    const fillPot = (pot) => {
        if (pot.classList.contains('has-water')) return;

        pot.classList.add('has-water');
        console.log('냄비에 물을 채웠어요');
    };

    /**
     * @param {number} x
     * @param {number} y
     * @returns {HTMLElement | null}
     */
    const findTrayAtPoint = (x, y) => {
        for (const el of document.elementsFromPoint(x, y)) {
            if (!(el instanceof Element)) continue;
            const tray = el.closest('.tray');
            if (tray instanceof HTMLElement) return tray;
        }
        return null;
    };

    /** @type {WeakMap<HTMLImageElement, HTMLElement>} */
    const potHomes = new WeakMap();

    /**
     * @param {HTMLElement} home
     * @returns {HTMLImageElement}
     */
    const createPot = (home) => {
        const pot = document.createElement('img');
        pot.className = 'pot';
        pot.src = POT_SRC;
        pot.alt = '냄비';
        home.appendChild(pot);
        setupPot(pot, home);
        return pot;
    };

    /**
     * @param {HTMLImageElement} pot
     */
    const servePot = (pot) => {
        const home = potHomes.get(pot);
        pot.remove();
        addScore(1000);

        if (home instanceof HTMLElement) {
            createPot(home);
        }

        console.log('라면 서빙 완료! +1,000원');
    };

    /**
     * @param {HTMLImageElement} pot
     * @param {HTMLElement} home
     */
    const setupPot = (pot, home) => {
        potHomes.set(pot, home);

        createDragFollow(pot, {
            home,
            onDragEnd(ev) {
                if (findTrayAtPoint(ev.clientX, ev.clientY)) {
                    servePot(pot);
                    return false;
                }

                console.log('냄비를 원래 자리에 놨어요');
            },
        });
    };

    createDragFollow(kettleEl, {
        home: kettleHome,
        onDragEnd(ev) {
            const pot = findPotAtPoint(ev.clientX, ev.clientY);
            if (pot) fillPot(pot);
            console.log('주전자를 원래 자리에 놨어요');
        },
    });

    document.querySelectorAll('.pot').forEach((pot) => {
        if (!(pot instanceof HTMLImageElement)) return;

        const parent = pot.parentElement;
        if (!(parent instanceof HTMLElement)) return;

        setupPot(pot, parent);
    });
});
