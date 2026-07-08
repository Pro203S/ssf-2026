// 새벽 4시 18분 심심한 문태영이 작성
// 저는타입스크립트가없으면못사는몸이기때문에모든곳에JSDOC을박아넣었으니알아서코드해석하시길

/**
 * HTML의 요소를 선택자로 가져오는 함수
 * 
 * @param {keyof HTMLElementTagNameMap} selector 선택자
 * @returns HTML 요소
 */
const $ = (selector) => {
    /** @type {HTMLElement} */
    const a = document.querySelector(selector);

    return {
        ...a,
        /**
         * 요소에 이벤트 리스너를 추가하는 함수
         * 
         * @param {keyof HTMLElementEventMap} type
         * @param {(ev: Event) => any} callback
         * 
         * @return {() => any} 이벤트 리스너 삭제
         */
        addEventListener: (type, callback) => {
            // 아주잘알고있는이벤트리스너
            a.addEventListener(type, callback);

            // 이벤트 리스너 삭제하는 함수 return
            return () => a.removeEventListener(type, callback);
        }
    };  
}

/**
 * 주전자를 클릭하면 마우스를 따라가고, 냄비를 클릭하면 물을 채우는 기능
 */
const initKettlePour = () => {
    /** @type {HTMLImageElement | null} */
    const kettle = document.querySelector('.kettle');
    if (!kettle) {
        return {
            isPouring: () => false,
            fillPot: () => {},
        };
    }

    const homeBurner = kettle.parentElement;
    if (!(homeBurner instanceof HTMLElement)) {
        return {
            isPouring: () => false,
            fillPot: () => {},
        };
    }

    /** @type {{ offsetX: number; offsetY: number } | null} */
    let dragState = null;

    const resetKettleStyles = () => {
        kettle.style.position = '';
        kettle.style.zIndex = '';
        kettle.style.left = '';
        kettle.style.top = '';
        kettle.style.width = '';
        kettle.style.height = '';
        kettle.style.cursor = 'grab';
    };

    const returnKettleHome = () => {
        resetKettleStyles();
        homeBurner.appendChild(kettle);
    };

    /**
     * @param {MouseEvent} ev
     */
    const onMouseMove = (ev) => {
        if (!dragState) return;

        kettle.style.left = `${ev.clientX - dragState.offsetX}px`;
        kettle.style.top = `${ev.clientY - dragState.offsetY}px`;
    };

    const stopDrag = () => {
        if (!dragState) return;

        dragState = null;
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('click', onClickAway, true);
    };

    /**
     * @param {MouseEvent} ev
     */
    const onClickAway = (ev) => {
        if (!dragState) return;
        if (ev.target === kettle) return;

        const target = ev.target instanceof Element ? ev.target : null;
        if (target?.closest('.burner') === homeBurner) {
            returnKettleHome();
            stopDrag();
        }
    };

    kettle.style.cursor = 'grab';

    kettle.addEventListener('click', (e) => {
        e.stopPropagation();

        if (dragState) return;

        const rect = kettle.getBoundingClientRect();

        dragState = {
            offsetX: e.clientX - rect.left,
            offsetY: e.clientY - rect.top,
        };

        kettle.style.position = 'fixed';
        kettle.style.zIndex = '1000';
        kettle.style.cursor = 'grabbing';
        kettle.style.left = `${rect.left}px`;
        kettle.style.top = `${rect.top}px`;
        kettle.style.width = `${rect.width}px`;
        kettle.style.height = `${rect.height}px`;

        document.addEventListener('mousemove', onMouseMove);
        setTimeout(() => {
            document.addEventListener('click', onClickAway, true);
        }, 0);
    });

    return {
        isPouring: () => dragState !== null,
        /**
         * @param {HTMLImageElement} pot
         */
        fillPot: (pot) => {
            pot.classList.add('has-water');
        },
    };
};

/**
 * 냄비를 클릭하면 마우스 커서를 계속 따라가게 하는 기능
 * @param {{ isPouring: () => boolean; fillPot: (pot: HTMLImageElement) => void }} kettlePour
 */
const initPotDrag = (kettlePour) => {
    /** @type {NodeListOf<HTMLImageElement>} */
    const pots = document.querySelectorAll('.pot');

    /** @type {WeakMap<HTMLImageElement, HTMLElement>} */
    const potHomeBurners = new WeakMap();

    /** @type {{ pot: HTMLImageElement; offsetX: number; offsetY: number } | null} */
    let dragState = null;

    /**
     * @param {HTMLImageElement} pot
     */
    const resetPotStyles = (pot) => {
        pot.style.position = '';
        pot.style.zIndex = '';
        pot.style.left = '';
        pot.style.top = '';
        pot.style.width = '';
        pot.style.height = '';
        pot.style.cursor = 'grab';
    };

    /**
     * @param {HTMLImageElement} pot
     * @param {HTMLElement} homeBurner
     */
    const returnPotHome = (pot, homeBurner) => {
        resetPotStyles(pot);
        homeBurner.appendChild(pot);
    };

    /**
     * @param {HTMLImageElement} pot
     * @param {HTMLElement} serving
     */
    const placePotOnServing = (pot, serving) => {
        resetPotStyles(pot);
        const tray = serving.querySelector('.tray');
        (tray ?? serving).appendChild(pot);
    };

    /**
     * @param {MouseEvent} ev
     */
    const onMouseMove = (ev) => {
        if (!dragState) return;

        const { pot, offsetX, offsetY } = dragState;
        pot.style.left = `${ev.clientX - offsetX}px`;
        pot.style.top = `${ev.clientY - offsetY}px`;
    };

    const stopDrag = () => {
        if (!dragState) return;

        dragState = null;
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('click', onClickAway, true);
    };

    /**
     * @param {MouseEvent} ev
     */
    const onClickAway = (ev) => {
        if (!dragState) return;
        if (ev.target === dragState.pot) return;

        const target = ev.target instanceof Element ? ev.target : null;
        const serving = target?.closest('.serving');
        const burner = target?.closest('.burner');

        if (serving instanceof HTMLElement) {
            placePotOnServing(dragState.pot, serving);
            stopDrag();
            return;
        }

        if (burner instanceof HTMLElement) {
            const homeBurner = potHomeBurners.get(dragState.pot);
            if (homeBurner) returnPotHome(dragState.pot, homeBurner);
            stopDrag();
        }
    };

    pots.forEach((pot) => {
        const parent = pot.parentElement;
        if (parent instanceof HTMLElement && parent.classList.contains('burner')) {
            potHomeBurners.set(pot, parent);
        }

        pot.style.cursor = 'grab';

        pot.addEventListener('click', (e) => {
            e.stopPropagation();

            if (kettlePour.isPouring()) {
                kettlePour.fillPot(pot);
                return;
            }

            if (dragState?.pot === pot) return;

            if (dragState) stopDrag();

            const rect = pot.getBoundingClientRect();

            dragState = {
                pot,
                offsetX: e.clientX - rect.left,
                offsetY: e.clientY - rect.top,
            };

            pot.style.position = 'fixed';
            pot.style.zIndex = '1000';
            pot.style.cursor = 'grabbing';
            pot.style.left = `${rect.left}px`;
            pot.style.top = `${rect.top}px`;
            pot.style.width = `${rect.width}px`;
            pot.style.height = `${rect.height}px`;

            document.addEventListener('mousemove', onMouseMove);
            setTimeout(() => {
                document.addEventListener('click', onClickAway, true);
            }, 0);
        });
    });
};

document.addEventListener('DOMContentLoaded', () => {
    const kettlePour = initKettlePour();
    initPotDrag(kettlePour);
});
