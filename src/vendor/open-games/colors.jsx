// Adapted by LifeOS: localized UI, touch controls, gameplay fixes. Apache-2.0.
// Upstream: https://github.com/hajunho/zeli-web-games @ ba9938eb222cb588ae7b0a6056ba6bdda89dcd9c
import { gameText } from './text';
/**
 * 🎮 Game 9: 컬러 소팅
 * 같은 색 물약을 하나의 병으로 모아주세요!
 */
import { useCallback, useState } from "react";

const COLORS_MAP = {
    R: "#FF6B6B",
    G: "#64ffda",
    B: "#0cbfff",
    Y: "#FFD700",
};
const COLOR_NAMES = { R: gameText("Kırmızı"), G: gameText("Yeşil"), B: gameText("Mavi"), Y: gameText("Sarı") };

const MAX_HEIGHT = 4;

const generatePuzzle = () => {
    // 4 colors, 4 segments each, shuffled into 4 tubes + 1 empty
    const colors = Object.keys(COLORS_MAP);
    const allSegments = [];
    colors.forEach((c) => { for (let i = 0; i < MAX_HEIGHT; i++) allSegments.push(c); });
    // Shuffle
    for (let i = allSegments.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [allSegments[i], allSegments[j]] = [allSegments[j], allSegments[i]];
    }
    const tubes = [];
    for (let i = 0; i < 4; i++) {
        tubes.push(allSegments.slice(i * MAX_HEIGHT, (i + 1) * MAX_HEIGHT));
    }
    tubes.push([]); // Empty tube
    tubes.push([]); // Extra empty tube
    return tubes;
};

const ColorSort = ({ onComplete }) => {
    const [tubes, setTubes] = useState(generatePuzzle);
    const [selected, setSelected] = useState(null);
    const [moves, setMoves] = useState(0);

    const isSorted = useCallback(
        (t) =>
            t.every(
                (tube) =>
                    tube.length === 0 || (tube.length === MAX_HEIGHT && tube.every((c) => c === tube[0]))
            ),
        []
    );

    const handleClick = useCallback(
        (idx) => {
            if (selected === null) {
                if (tubes[idx].length > 0) setSelected(idx);
                return;
            }

            if (selected === idx) {
                setSelected(null);
                return;
            }

            const from = tubes[selected];
            const to = tubes[idx];

            if (to.length >= MAX_HEIGHT) {
                setSelected(null);
                return;
            }

            const topFrom = from[from.length - 1];
            const topTo = to.length > 0 ? to[to.length - 1] : null;

            if (topTo !== null && topTo !== topFrom) {
                setSelected(null);
                return;
            }

            const newTubes = tubes.map((t) => [...t]);
            newTubes[selected].pop();
            newTubes[idx].push(topFrom);
            setTubes(newTubes);
            setSelected(null);
            setMoves(moves + 1);

            if (isSorted(newTubes)) {
                const score = Math.max(50, 100 - (moves - 8) * 3);
                setTimeout(() => onComplete(Math.min(100, score)), 400);
            }
        },
        [tubes, selected, moves, isSorted, onComplete]
    );

    const tubeW = 44;
    const segH = 28;

    return (
        <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "16px", color: "white" }}>
            <div style={{ fontSize: "13px" }}>
                {gameText("Hamle:")}<span style={{ color: "#FFD700" }}>{moves}</span>
            </div>
            <div style={{ display: "flex", gap: "12px", alignItems: "flex-end" }}>
                {tubes.map((tube, idx) => (
                    <div
                        key={idx}
                        onClick={() => handleClick(idx)}
                        style={{
                            width: tubeW,
                            minHeight: segH * MAX_HEIGHT + 16,
                            border: selected === idx ? "2px solid #FFD700" : (tube.length === MAX_HEIGHT && tube.every(c => c === tube[0])) ? "2px solid #64ffda" : "2px solid rgba(255,255,255,0.15)",
                            borderRadius: "0 0 12px 12px",
                            borderTop: "none",
                            padding: "4px",
                            display: "flex",
                            flexDirection: "column-reverse",
                            alignItems: "center",
                            gap: "2px",
                            cursor: "pointer",
                            transition: "all 0.2s",
                            background: (tube.length === MAX_HEIGHT && tube.every(c => c === tube[0])) ? "rgba(100,255,218,0.05)" : "rgba(255,255,255,0.02)",
                        }}
                    >
                        {tube.map((color, si) => (
                            <div
                                key={si}
                                style={{
                                    width: tubeW - 12,
                                    height: segH,
                                    borderRadius: "4px",
                                    background: `linear-gradient(135deg, ${COLORS_MAP[color]}, ${COLORS_MAP[color]}cc)`,
                                    boxShadow: `0 1px 3px ${COLORS_MAP[color]}33, inset 0 1px 2px rgba(255,255,255,0.2)`,
                                    transition: "all 0.2s",
                                }}
                            />
                        ))}
                    </div>
                ))}
            </div>
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", justifyContent: "center" }}>
                {Object.entries(COLOR_NAMES).map(([k, v]) => (
                    <span key={k} style={{ fontSize: "11px", color: COLORS_MAP[k] }}>
                        ● {v}
                    </span>
                ))}
            </div>
            <div style={{ fontSize: "12px", color: "#8892b0" }}>
                {gameText("")}</div>
        </div>
    );
};

export default ColorSort;
