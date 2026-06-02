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
