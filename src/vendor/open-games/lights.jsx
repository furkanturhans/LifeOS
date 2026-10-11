// Adapted by LifeOS: localized UI, touch controls, gameplay fixes. Apache-2.0.
// Upstream: https://github.com/hajunho/zeli-web-games @ ba9938eb222cb588ae7b0a6056ba6bdda89dcd9c
import { gameText } from './text';
/**
 * 🎮 Game 3: 라이츠 아웃 — 리플 토글 + 이동 카운터 + 히트맵
 */
import { useCallback, useState } from "react";

const SIZE = 5;

const generateSolvable = () => {
    const grid = Array.from({ length: SIZE }, () => Array(SIZE).fill(false));
    const toggleCount = 5 + Math.floor(Math.random() * 6);
    for (let i = 0; i < toggleCount; i++) {
        const r = Math.floor(Math.random() * SIZE), c = Math.floor(Math.random() * SIZE);
        grid[r][c] = !grid[r][c];
        if (r > 0) grid[r - 1][c] = !grid[r - 1][c];
        if (r < SIZE - 1) grid[r + 1][c] = !grid[r + 1][c];
        if (c > 0) grid[r][c - 1] = !grid[r][c - 1];
        if (c < SIZE - 1) grid[r][c + 1] = !grid[r][c + 1];
    }
    if (grid.flat().every((v) => !v)) grid[2][2] = true;
    return grid;
};

const LightsOut = ({ onComplete }) => {
    const [grid, setGrid] = useState(generateSolvable);
    const [moves, setMoves] = useState(0);
    const [lastToggle, setLastToggle] = useState(null);

    const litCount = grid.flat().filter(Boolean).length;
    const totalCells = SIZE * SIZE;

    const toggle = useCallback((r, c) => {
        const newGrid = grid.map((row) => [...row]);
        const flip = (rr, cc) => {
            if (rr >= 0 && rr < SIZE && cc >= 0 && cc < SIZE) newGrid[rr][cc] = !newGrid[rr][cc];
        };
        flip(r, c); flip(r - 1, c); flip(r + 1, c); flip(r, c - 1); flip(r, c + 1);
        setGrid(newGrid);
        setMoves(moves + 1);
        setLastToggle(`${r},${c}`);

        if (newGrid.flat().every((v) => !v)) {
            const score = Math.max(30, Math.min(100, 110 - moves * 3));
            setTimeout(() => onComplete(score), 500);
        }
    }, [grid, moves, onComplete]);

    return (
        <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "12px", color: "white" }}>
            <style>{`
                @keyframes lightOn { 0% { transform: scale(0.9); box-shadow: 0 0 0 rgba(255,215,0,0); } 100% { transform: scale(1); box-shadow: 0 0 15px rgba(255,215,0,0.4); } }
                @keyframes lightOff { 0% { transform: scale(1.05); } 100% { transform: scale(1); } }
                @keyframes rippleToggle { 0% { box-shadow: 0 0 0 0 rgba(255,255,255,0.3); } 100% { box-shadow: 0 0 0 15px rgba(255,255,255,0); } }
            `}</style>

            <div style={{ display: "flex", gap: "16px", fontSize: "13px" }}>
                <span>{gameText("Hamle:")}<span style={{ color: "#FFD700", fontWeight: "bold" }}>{moves}</span></span>
                <span>{gameText("💡")}<span style={{ color: litCount === 0 ? "#64ffda" : "#FF6B6B" }}>{litCount}/{totalCells}</span></span>
            </div>

            {/* Progress bar */}
            <div style={{ width: 240, height: 6, borderRadius: 3, background: "rgba(255,255,255,0.1)", overflow: "hidden" }}>
                <div style={{
                    width: `${((totalCells - litCount) / totalCells) * 100}%`, height: "100%",
                    background: "linear-gradient(90deg, #64ffda, #22C55E)",
                    borderRadius: 3, transition: "width 0.3s ease",
                }} />
            </div>

            <div style={{
                display: "grid", gridTemplateColumns: `repeat(${SIZE}, 52px)`, gap: "4px",
                padding: "8px", background: "rgba(10,10,30,0.8)",
                borderRadius: "12px", border: "2px solid rgba(255,255,255,0.08)",
            }}>
                {grid.flat().map((on, idx) => {
                    const r = Math.floor(idx / SIZE), c = idx % SIZE;
                    const isLast = lastToggle === `${r},${c}`;
                    return (
                        <div key={idx} onClick={() => toggle(r, c)}
                            style={{
                                width: 52, height: 52, borderRadius: "10px",
                                cursor: "pointer",
                                background: on
                                    ? "linear-gradient(135deg, #FFD700, #FFA500)"
                                    : "rgba(255,255,255,0.06)",
                                boxShadow: on
                                    ? "0 0 18px rgba(255,215,0,0.4), inset 0 1px 3px rgba(255,255,255,0.3)"
                                    : "inset 0 2px 4px rgba(0,0,0,0.3)",
                                display: "flex", alignItems: "center", justifyContent: "center",
                                fontSize: "22px",
                                animation: isLast ? "rippleToggle 0.4s ease" : on ? "lightOn 0.3s ease" : "lightOff 0.2s ease",
                                transition: "all 0.2s ease",
                                border: on ? "1px solid rgba(255,215,0,0.3)" : "1px solid rgba(255,255,255,0.04)",
                            }}
                            onMouseEnter={(e) => { e.currentTarget.style.transform = "scale(1.06)"; }}
                            onMouseLeave={(e) => { e.currentTarget.style.transform = "scale(1)"; }}
                        >
                            {on ? "💡" : ""}
                        </div>
                    );
                })}
            </div>

            <div style={{ fontSize: "11px", color: "#8892b0" }}>
                {gameText("")}</div>
        </div>
    );
};

export default LightsOut;
