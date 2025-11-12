import React, { createElement, useEffect, useRef, useState } from "react";
import WaveSurfer from "wavesurfer.js";

function getAudioSrc(base64) {
    if (!base64 || base64.length < 50) return null;
    if (base64.trim().startsWith("UklGR")) {
        return `data:audio/wav;base64,${base64}`;
    }
    return `data:audio/mp3;base64,${base64}`;
}

export function AudioTextSync({ Base64, jsondata, line }) {
    const waveRef = useRef(null);
    const wavesurfer = useRef(null);
    const transcriptRef = useRef(null);
    const [sentences, setSentences] = useState([]);
    const [currentTime, setCurrentTime] = useState(0);
    console.log("Base64 received:", Base64?.substring(0, 40));
    console.log("JSON received:", jsondata);
    const audioSrc = getAudioSrc(Base64);
    const WORDS_PER_LINE = line; // 👈 change this constant for line size control
    console.log("WORDS_PER_LINE:", WORDS_PER_LINE);

    // Parse JSON data
    useEffect(() => {
        try {
            if (!jsondata) return;
            const raw = typeof jsondata === "string" ? JSON.parse(jsondata) : jsondata;
            if (!raw.segments || !Array.isArray(raw.segments)) {
                console.error("JSON does not contain segments array:", raw);
                return;
            }
            const mapped = raw.segments.map(s => ({
                start: (s.startMs || 0) / 1000,
                end: (s.endMs || 0) / 1000,
                text: s.text || ""
            }));
            setSentences(mapped);
        } catch (err) {
            console.error("JSON parsing failed:", err);
        }
    }, [jsondata]);

    // Initialize WaveSurfer
    useEffect(() => {
        if (!waveRef.current || !audioSrc) return;

        const timeout = setTimeout(() => {
            wavesurfer.current = WaveSurfer.create({
                container: waveRef.current,
                waveColor: "rgba(197, 170, 93, .95)",
                progressColor: "#4a9c2d",
                height: 80,
                responsive: true,
                normalize: true
            });

            // Track audio time
            wavesurfer.current.on("audioprocess", () => {
                const t = wavesurfer.current.getCurrentTime();
                setCurrentTime(t);
            });

            wavesurfer.current.on("ready", () => {
                console.log("WaveSurfer READY");
            });

            wavesurfer.current.load(audioSrc);
        }, 200);

        return () => clearTimeout(timeout);
    }, [audioSrc]);

    useEffect(() => {
        const containers = document.querySelectorAll(".transcript-container");

        containers.forEach((container) => {
            const active = container.querySelector(".word.active");
            if (!active) return;

            const lineHeight = 28; // adjust if your line-height differs
            const linesAbove = 5; // how many lines you want visible above

            // Calculate scroll target with space for 2 lines above
            const offset =
                active.offsetTop -
                linesAbove * lineHeight -
                container.clientHeight / 3; // less aggressive centering

            container.scrollTo({
                top: Math.max(0, offset),
                behavior: "smooth",
            });
        });
    }, [currentTime]);

    return (
        <div className="audio-text-sync" style={{ padding: 20 }}>
            {/* Waveform */}
            <div
                className="Audio-wave"
                ref={waveRef}
                style={{
                    width: "100%",
                    marginBottom: 20,
                    minHeight: 100,
                    border: "1px solid #ddd"
                }}
            />

            {/* Play/Pause */}
            <button
                className="play-pause-btn"
                onClick={() => wavesurfer.current && wavesurfer.current.playPause()}>
                Play / Pause
            </button>

            <div className="Readable-container">
                <div className="English-container">
                    {/* English Transcript */}
                    <div
                        ref={transcriptRef}
                        className="transcript-container"
                        style={{
                            maxHeight: "250px",
                            overflowY: "auto",
                            border: "1px solid #ccc",
                            padding: "10px",
                            borderRadius: 8,
                        }}
                    >
                        <div
                            style={{
                                lineHeight: "1.8",
                            }}
                        >
                            {(() => {
                                // 1️⃣ Group words into lines of fixed length
                                const lines = [];
                                for (let i = 0; i < sentences.length; i += WORDS_PER_LINE) {
                                    lines.push(sentences.slice(i, i + WORDS_PER_LINE));
                                }

                                // 2️⃣ Determine active word & active line index
                                const activeWordIndex = sentences.findIndex(
                                    (w) => currentTime >= w.start && currentTime <= w.end
                                );

                                const activeLineIndex = Math.floor(activeWordIndex / WORDS_PER_LINE);

                                // 3️⃣ Render lines and words with dynamic Spotify-style highlighting
                                return lines.map((line, lineIdx) => {
                                    const isActiveLine = lineIdx === activeLineIndex;

                                    return (
                                        <div
                                            key={lineIdx}
                                            style={{
                                                color: isActiveLine ? "#111" : "#bbb",
                                                fontWeight: isActiveLine ? "600" : "400",
                                                transition: "color 0.3s ease, font-weight 0.3s ease",
                                                margin: "6px 0",
                                            }}
                                        >
                                            {line.map((s, i) => {
                                                const globalIdx = lineIdx * WORDS_PER_LINE + i;
                                                const isActiveWord =
                                                    currentTime >= s.start && currentTime <= s.end;

                                                return (
                                                    <span
                                                        key={globalIdx}
                                                        className={`word ${isActiveWord ? "active" : ""}`}
                                                        style={{
                                                            marginRight: 6,
                                                            display: "inline-block",
                                                            transform: isActiveWord ? "scale(1.1)" : "scale(1)",
                                                            color: isActiveLine ? "#111" : "#bbb",
                                                            transition:
                                                                "transform 0.25s ease, color 0.25s ease",
                                                        }}
                                                    >
                                                        {s.text}
                                                    </span>
                                                );
                                            })}
                                        </div>
                                    );
                                });
                            })()}
                        </div>
                    </div>
                </div>

                <div className="Arabic-container">
                    {/* Arabic Transcript */}
                    <div
                        ref={transcriptRef}
                        className="transcript-container"
                        style={{
                            maxHeight: "250px",
                            overflowY: "auto",
                            border: "1px solid #ccc",
                            padding: "10px",
                            borderRadius: 8,
                        }}
                    >
                        <div
                            style={{
                                lineHeight: "1.8",
                            }}
                        >
                            {(() => {
                                // 1️⃣ Group words into lines of fixed length
                                const lines = [];
                                for (let i = 0; i < sentences.length; i += WORDS_PER_LINE) {
                                    lines.push(sentences.slice(i, i + WORDS_PER_LINE));
                                }

                                // 2️⃣ Determine active word & active line index
                                const activeWordIndex = sentences.findIndex(
                                    (w) => currentTime >= w.start && currentTime <= w.end
                                );

                                const activeLineIndex = Math.floor(activeWordIndex / WORDS_PER_LINE);

                                // 3️⃣ Render lines and words with dynamic Spotify-style highlighting
                                return lines.map((line, lineIdx) => {
                                    const isActiveLine = lineIdx === activeLineIndex;

                                    return (
                                        <div
                                            key={lineIdx}
                                            style={{
                                                color: isActiveLine ? "#111" : "#bbb",
                                                fontWeight: isActiveLine ? "600" : "400",
                                                transition: "color 0.3s ease, font-weight 0.3s ease",
                                                margin: "6px 0",
                                            }}
                                        >
                                            {line.map((s, i) => {
                                                const globalIdx = lineIdx * WORDS_PER_LINE + i;
                                                const isActiveWord =
                                                    currentTime >= s.start && currentTime <= s.end;

                                                return (
                                                    <span
                                                        key={globalIdx}
                                                        className={`word ${isActiveWord ? "active" : ""}`}
                                                        style={{
                                                            marginRight: 6,
                                                            display: "inline-block",
                                                            transform: isActiveWord ? "scale(1.1)" : "scale(1)",
                                                            color: isActiveLine ? "#111" : "#bbb",
                                                            transition:
                                                                "transform 0.25s ease, color 0.25s ease",
                                                        }}
                                                    >
                                                        {s.text}
                                                    </span>
                                                );
                                            })}
                                        </div>
                                    );
                                });
                            })()}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
