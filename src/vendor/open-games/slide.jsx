// Adapted by LifeOS: localized UI, touch controls, gameplay fixes. Apache-2.0.
// Upstream: https://github.com/hajunho/zeli-web-games @ ba9938eb222cb588ae7b0a6056ba6bdda89dcd9c
import { gameText } from './text';
/**
 * 🎮 Game 2: 슬라이드 퍼즐 — 슬라이드 애니 + 위치 체크 + 타이머
 */
import { useCallback, useEffect, useState } from "react";

const SIZE = 3;
const GOAL = Array.from({ length: SIZE * SIZE }, (_, i) => (i + 1) % (SIZE * SIZE));

const shuffle = () => {
    const arr = [...GOAL];
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    let inv = 0;
    for (let i = 0; i < arr.length; i++)
        for (let j = i + 1; j < arr.length; j++)
            if (arr[i] && arr[j] && arr[i] > arr[j]) inv++;
    if (inv % 2 !== 0) { const nonzero=arr.map((v,i)=>v ? i : -1).filter(i=>i>=0); const [a,b]=nonzero; [arr[a],arr[b]]=[arr[b],arr[a]]; }
    if (arr.every((v,i)=>v===GOAL[i])) [arr[7],arr[8]]=[arr[8],arr[7]];
    return arr;
};

const SlidePuzzle = ({ onComplete }) => {
    const [tiles, setTiles] = useState(shuffle);
    const [moves, setMoves] = useState(0);
    const [elapsed, setElapsed] = useState(0);
    const [lastIdx, setLastIdx] = useState(null);
    const [done, setDone] = useState(false);

    useEffect(() => {
        if (done) return;
        const t = setInterval(() => setElapsed((e) => e + 1), 1000);
        return () => clearInterval(t);
    }, [done]);

    const blankIdx = tiles.indexOf(0);
    const isComplete = useCallback((t) => t.every((v, i) => v === GOAL[i]), []);

    const canSwap = (idx) => {
        const bRow = Math.floor(blankIdx / SIZE), bCol = blankIdx % SIZE;
        const tRow = Math.floor(idx / SIZE), tCol = idx % SIZE;
        return (Math.abs(bRow - tRow) + Math.abs(bCol - tCol)) === 1;
    };

    const handleClick = (idx) => {
        if (done || !canSwap(idx)) return;
        const newTiles = [...tiles];
        [newTiles[blankIdx], newTiles[idx]] = [newTiles[idx], newTiles[blankIdx]];
        setTiles(newTiles);
        setMoves(moves + 1);
        setLastIdx(blankIdx);

        if (isComplete(newTiles)) {
            setDone(true);
            const moveScore = Math.max(0, 100 - (moves - 10) * 3);
            const timeScore = Math.max(0, 100 - elapsed * 2);
            setTimeout(() => onComplete(Math.min(100, Math.round((moveScore + timeScore) / 2))), 500);
        }
    };

    useEffect(() => {
        const handleKey = (e) => {
            const map = { ArrowUp: SIZE, ArrowDown: -SIZE, ArrowLeft: 1, ArrowRight: -1 };
            const offset = map[e.key];
            if (offset !== undefined) {
                const target = blankIdx + offset;
                if (target >= 0 && target < SIZE * SIZE && canSwap(target)) {
                    e.preventDefault();
                    handleClick(target);
                }
            }
        };
        window.addEventListener("keydown", handleKey);
        return () => window.removeEventListener("keydown", handleKey);
    });

    const correctCount = tiles.filter((v, i) => v !== 0 && v === GOAL[i]).length;

    return (
        <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "12px", color: "white" }}>
            <style>{`@keyframes slideIn { 0% { transform: scale(0.95); opacity: 0.7; } 100% { transform: scale(1); opacity: 1; } }`}</style>

            <div style={{ display: "flex", gap: "16px", fontSize: "13px" }}>
                <span>{gameText("Hamle:")}<span style={{ color: "#FFD700", fontWeight: "bold" }}>{moves}</span></span>
                <span>⏱ <span style={{ color: "#64ffda" }}>{elapsed}s</span></span>
                <span>{gameText("✓")}<span style={{ color: "#A855F7" }}>{correctCount}/8</span></span>
            </div>

            <div style={{
                display: "grid", gridTemplateColumns: `repeat(${SIZE}, 76px)`, gap: "4px",
                padding: "6px", borderRadius: "12px",
                background: "rgba(10,10,30,0.8)",
                border: done ? "3px solid #64ffda" : "2px solid rgba(255,255,255,0.08)",
            }}>
                {tiles.map((val, idx) => {
                    const isCorrect = val !== 0 && val === GOAL[idx];
                    const isLast = lastIdx === idx;
                    return (
                        <div key={idx} onClick={() => handleClick(idx)}
                            style={{
                                width: 76, height: 76, borderRadius: "10px",
                                display: "flex", alignItems: "center", justifyContent: "center",
                                fontSize: "28px", fontWeight: "bold",
                                background: val === 0 ? "rgba(255,255,255,0.02)"
                                    : isCorrect ? "linear-gradient(135deg, rgba(100,255,218,0.2), rgba(100,255,218,0.08))"
                                        : "linear-gradient(135deg, #0cbfff, #7c3aed)",
                                border: val === 0 ? "1px dashed rgba(255,255,255,0.06)"
                                    : isCorrect ? "2px solid rgba(100,255,218,0.3)"
                                        : "1px solid rgba(255,255,255,0.1)",
                                color: "white",
                                cursor: val === 0 || done ? "default" : "pointer",
                                animation: isLast ? "slideIn 0.2s ease" : "none",
                                boxShadow: val !== 0 ? `0 3px 10px rgba(0,0,0,0.2)` : "none",
                                transition: "all 0.15s ease",
                                userSelect: "none",
                            }}
                            onMouseEnter={(e) => { if (val !== 0 && canSwap(idx) && !done) e.currentTarget.style.transform = "scale(1.05)"; }}
                            onMouseLeave={(e) => { e.currentTarget.style.transform = "scale(1)"; }}
                        >{val > 0 ? val : ""}</div>
                    );
                })}
            </div>

            <div style={{ fontSize: "11px", color: "#8892b0" }}>
                {done ? gameText("Kazandın!") : gameText("")}
            </div>
        </div>
    );
};

export default SlidePuzzle;
