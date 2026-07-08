// 새벽 4시 18분 심심한 문태영이 작성
// 저는타입스크립트가없으면못사는몸이기때문에모든곳에JSDOC을박아넣었으니알아서코드해석하시길

/**
 * HTML의 요소를 선택자로 가져오는 함수
 *
 * @param {keyof HTMLElementTagNameMap} selector 선택자
 * @returns HTML 요소
 */
export const $ = (selector) => {
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
            a.addEventListener(type, callback);
            return () => a.removeEventListener(type, callback);
        },
    };
};

/**
 * @typedef {Object} DragFollowOptions
 * @property {HTMLElement} [home] 마우스를 뗐을 때 돌아갈 부모 (기본: element.parentElement)
 * @property {(ev: MouseEvent) => HTMLElement | false | null | void} [onDragEnd] 뗄 때 호출. false면 배치 생략
 */

/**
 * 마우스를 누르고 있는 동안만 따라가고, 떼면 원래 자리로 돌아가는 드래그
 *
 * @param {HTMLElement} element
 * @param {DragFollowOptions} [options]
 */
export const createDragFollow = (element, options = {}) => {
    const home =
        options.home instanceof HTMLElement ? options.home : element.parentElement;

    /** @type {{ offsetX: number; offsetY: number } | null} */
    let dragState = null;

    const resetStyles = () => {
        element.style.position = '';
        element.style.zIndex = '';
        element.style.left = '';
        element.style.top = '';
        element.style.width = '';
        element.style.height = '';
        element.style.cursor = 'grab';
    };

    /**
     * @param {HTMLElement} parent
     */
    const placeIn = (parent) => {
        resetStyles();
        parent.appendChild(element);
    };

    const cleanupListeners = () => {
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
    };

    /**
     * @param {MouseEvent} ev
     */
    const onMouseMove = (ev) => {
        if (!dragState) return;

        element.style.left = `${ev.clientX - dragState.offsetX}px`;
        element.style.top = `${ev.clientY - dragState.offsetY}px`;
    };

    /**
     * @param {MouseEvent} ev
     */
    const onMouseUp = (ev) => {
        if (!dragState) return;

        dragState = null;
        cleanupListeners();

        const placement = options.onDragEnd?.(ev);
        if (placement === false) return;

        const target =
            placement instanceof HTMLElement ? placement : home;

        if (target instanceof HTMLElement) {
            placeIn(target);
        }
    };

    /**
     * @param {MouseEvent} e
     */
    const onMouseDown = (e) => {
        e.preventDefault();
        if (dragState) return;

        const rect = element.getBoundingClientRect();

        dragState = {
            offsetX: e.clientX - rect.left,
            offsetY: e.clientY - rect.top,
        };

        element.style.position = 'fixed';
        element.style.zIndex = '1000';
        element.style.cursor = 'grabbing';
        element.style.left = `${rect.left}px`;
        element.style.top = `${rect.top}px`;
        element.style.width = `${rect.width}px`;
        element.style.height = `${rect.height}px`;

        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
    };

    element.style.cursor = 'grab';
    element.addEventListener('mousedown', onMouseDown);

    return {
        element,
        isDragging: () => dragState !== null,
        placeIn,
        detach: () => element.removeEventListener('mousedown', onMouseDown),
    };
};
