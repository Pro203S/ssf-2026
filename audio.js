// ==================
//
// audio.js - 오디오 관련 라이브러리
// 2026/07/10
// Created by 문태영
//
// ==================

const DEFAULT_VOLUME = 0.5;

class AudioPlayer {
    _src = "";
    _loop = false;
    _duration = 0;

    /** @type {HTMLAudioElement} */
    _audio1 = null;
    /** @type {HTMLAudioElement} */
    _audio2 = null;

    /** @type {number} */
    _interval = -1;

    /**
     * AudioPlayer의 새 인스턴스를 생성합니다.
     * 
     * @param {string} src 오디오 소스
     * @param {boolean} [loop = false] 반복 여부
     * @param {number} [duration = 0] 반복 길이
     */
    constructor(
        src,
        loop = false,
        duration = 0
    ) {
        this._src = src;
        this._loop = loop;
        this._duration = duration;
    }

    /**
     * 오디오 파일을 로드합니다.
     */
    load() {
        if (this._loop) return new Promise(resolve => {
            const audio1 = document.createElement("audio");
            const audio2 = document.createElement("audio");

            audio1.addEventListener("canplay", () => {
                audio2.addEventListener("canplay", () => {
                    this._audio1 = audio1;
                    this._audio2 = audio2;

                    resolve();
                });

                audio2.src = this._src;
            });

            audio1.src = this._src;
        });

        return new Promise(resolve => {
            const audio = document.createElement("audio");

            audio.addEventListener("ended", () => audio.currentTime = 0);

            audio.addEventListener("canplay", () => {
                this._audio1 = audio;
                resolve();
            });

            audio.src = this._src;
        });
    }

    /**
     * 오디오를 재생합니다.
     */
    async play() {
        if (!this._loop) return await this._audio1.play();

        if (!this._duration || this._duration <= 0) throw new Error("duration이 없거나 0보다 작습니다.");

        const switchTime = Math.max(0, (this._duration - 0.06) * 1000);
        let currentAudio = this._audio1;
        let nextAudio = this._audio2;

        const playNext = async () => {
            const audio = nextAudio;
            nextAudio = currentAudio;
            currentAudio = audio;

            audio.currentTime = 0;
            await audio.play();
            this._interval = setTimeout(playNext, switchTime);
        };

        await currentAudio.play();
        this._interval = setTimeout(playNext, switchTime);
    }

    /**
     * 사용된 리소스를 모두 해제합니다.
     */
    async dispose() {
        this._audio1 = null;
        this._audio2 = null;
    }
}
