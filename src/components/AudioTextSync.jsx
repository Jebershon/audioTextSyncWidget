import React, { createElement, useEffect, useRef, useState } from "react";
import WaveSurfer from "wavesurfer.js";

// Play / Pause Icons
const PLAY_ICON = "https://image2url.com/images/1763104709864-48218e45-5029-416e-9125-19454c629e2b.png";
const PAUSE_ICON = "https://image2url.com/images/1763104608200-b1605ff1-b8a5-441d-a2c7-72816da79cee.png";

function getAudioSrc(base64) {
    if (!base64 || base64.length < 50) return null;
    if (base64.trim().startsWith("UklGR")) {
        return `data:audio/wav;base64,${base64}`;
    }
    return `data:audio/mp3;base64,${base64}`;
}

export function AudioTextSync({ Base64, jsondata, line, isArabic }) {
    const waveRef = useRef(null);
    const wavesurfer = useRef(null);
    const playPauseImgRef = useRef(null);

    const [sentences, setSentences] = useState([]);
    const [currentTime, setCurrentTime] = useState(0);
    // const [showTranscribe, setShowTranscribe] = useState(false);

    const audioSrc = getAudioSrc(Base64);
    const WORDS_PER_LINE = line;
    let isArabicFlag = false; // Placeholder, update as needed
    if (isArabic === 'false') {
        isArabicFlag = false;
    }
    if (isArabic === 'true') {
        isArabicFlag = true;
    }

    // Parse JSON
    useEffect(() => {
        if (!jsondata) return;
        try {
            const raw = typeof jsondata === "string" ? JSON.parse(jsondata) : jsondata;
            if (!raw.segments) return;

            setSentences(
                raw.segments.map(s => ({
                    start: (s.startMs || 0) / 1000,
                    end: (s.endMs || 0) / 1000,
                    text_en: s.text_en || "",
                    text_ar: s.text_ar || ""
                }))
            );
        } catch (e) {
            console.error("JSON parse failed:", e);
        }
    }, [jsondata]);

    // Initialize WaveSurfer
    useEffect(() => {
        if (!waveRef.current || !audioSrc) return;

        // Generate gradient
        const ctx = document.createElement("canvas").getContext("2d");
        const gradient_before = ctx.createLinearGradient(0, 0, 0, 150);
        gradient_before.addColorStop(0, "#ffedc8ff");
        gradient_before.addColorStop(0.7, "#ffd780ff");
        gradient_before.addColorStop(1, "#ffc531ff");

        const gradient_after = ctx.createLinearGradient(0, 0, 0, 150);
        gradient_after.addColorStop(0, "#fad074ff");
        gradient_after.addColorStop(0.7, "#ab8c49ff");
        gradient_after.addColorStop(1, "#000000ff");

        wavesurfer.current = WaveSurfer.create({
            container: waveRef.current,
            waveColor: gradient_before,
            progressColor: gradient_after,
            barWidth: 2,
            height: 80,
            responsive: true,
            normalize: true
        });

        wavesurfer.current.load(audioSrc);

        wavesurfer.current.on("audioprocess", () => {
            setCurrentTime(wavesurfer.current.getCurrentTime());
        });

        // Reset icon when audio finishes
        wavesurfer.current.on("finish", () => {
            if (playPauseImgRef.current) {
                playPauseImgRef.current.src = PLAY_ICON;
            }
        });

        return () => wavesurfer.current?.destroy();
    }, [audioSrc]);

    // Smooth scroll active line
    useEffect(() => {
        const containers = document.querySelectorAll(".transcript-container");

        containers.forEach((container) => {
            const active = container.querySelector(".word.active");
            if (!active) return;

            const lineHeight = 28;
            const linesAbove = 5;

            const offset =
                active.offsetTop -
                linesAbove * lineHeight -
                container.clientHeight / 3;

            container.scrollTo({
                top: Math.max(0, offset),
                behavior: "smooth"
            });
        });
    }, [currentTime]);

    return (
        <div className="audio-wrapper">
            <div className="audio-player-outer">

                {/* ROW FOR BUTTON + WAVE + DROPDOWN */}
                <div className="audio-content-row">
                    <div>
                        {/* Play / Pause */}
                        <button
                            className="big-play-btn"
                            onClick={() => {
                                if (!wavesurfer.current) return;

                                const willPlay = !wavesurfer.current.isPlaying();
                                wavesurfer.current.playPause();

                                if (playPauseImgRef.current) {
                                    playPauseImgRef.current.src =
                                        willPlay ? PAUSE_ICON : PLAY_ICON;
                                }
                            }}
                        >
                            <img ref={playPauseImgRef} src={PLAY_ICON} />
                        </button>
                    </div>
                    
                    {/* Waveform */}
                    <div className="waveform-large" ref={waveRef}></div>

                    {/* Dropdown */}
                    {/* {sentences.length > 0 && (
                        <button
                            className="dropdown-circle"
                            onClick={() => setShowTranscribe(!showTranscribe)}
                        >
                            <img
                                className={`arrow-icon ${showTranscribe ? "" : "rotated"}`}
                                src="https://image2url.com/images/1763106025867-a516cc5e-2618-44ec-a959-257dfed36342.png"
                                alt="Toggle"
                                style={{ width: 42, height: 42 }}
                            />
                        </button>
                    )} */}

                </div>

                {/* TRANSCRIPTION SECTION */}
                {sentences.length > 0 && (
                    // <div className={`transcribe-wrapper ${showTranscribe ? "open" : "closed"}`}>
                    <div className="Readable-container">

                        {/* English */}
                        {!isArabicFlag && (
                            <div className="English-container transcript-container">
                                {renderTranscript(sentences, currentTime, WORDS_PER_LINE, "text_en")}
                            </div>
                        )}

                        {/* Arabic */}
                        {isArabicFlag && (
                            <div className="Arabic-container transcript-container">
                                {renderTranscript(sentences, currentTime, WORDS_PER_LINE, "text_ar")}
                            </div>
                        )}

                    </div>
                    // </div>
                )}
            </div>
        </div>
    );
}

/** Renders grouped transcript lines */
function renderTranscript(sentences, currentTime, WORDS_PER_LINE, field) {
    const lines = [];
    for (let i = 0; i < sentences.length; i += WORDS_PER_LINE) {
        lines.push(sentences.slice(i, i + WORDS_PER_LINE));
    }

    const activeWordIndex = sentences.findIndex(
        w => currentTime >= w.start && currentTime <= w.end
    );
    const activeLineIndex = Math.floor(activeWordIndex / WORDS_PER_LINE);

    return lines.map((line, lineIdx) => {
        const isActiveLine = lineIdx === activeLineIndex;

        return (
            <div
                key={lineIdx}
                className="transcript-line"
                style={{
                    color: isActiveLine ? "#111" : "#bbb",
                    fontWeight: isActiveLine ? "600" : "400"
                }}
            >
                {line.map((w, i) => {
                    const globalIdx = lineIdx * WORDS_PER_LINE + i;
                    const isActiveWord = currentTime >= w.start && currentTime <= w.end;

                    return (
                        <span
                            key={globalIdx}
                            className={`word ${isActiveWord ? "active" : ""}`}
                        >
                            {w[field]}
                        </span>
                    );
                })}
            </div>
        );
    });
}
