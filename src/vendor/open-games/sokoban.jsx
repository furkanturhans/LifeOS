// Adapted by LifeOS: localized UI, touch controls, gameplay fixes. Apache-2.0.
// Upstream: https://github.com/hajunho/zeli-web-games @ ba9938eb222cb588ae7b0a6056ba6bdda89dcd9c
import { gameText } from './text';
/**
 * 🎮 Game 8: 미니 소코반
 * 상자(📦)를 목표(🎯) 위치로 밀어 넣으세요!
 */
import { useCallback, useEffect, useState } from "react";

// Levels: W=wall, P=player, B=box, G=goal, BG=box on goal, PG=player on goal
const LEVELS = [
    {
        map: [
            "WWWWW",
            "W  GW",
            "W B W",
            "WP  W",
            "WWWWW",
        ],
    },
    {
        map: [
            "WWWWWW",
            "W  G W",
            "W BG W",
            "W B  W",
            "W P  W",
            "WWWWWW",
        ],
    },
    {
        map: [
            "WWWWWW",
            "WP   W",
            "W BB W",
            "W GG W",
            "W    W",
            "WWWWWW",
        ],
    },
];

const parseLevel = (level) => {
    const grid = [];
    let player = null;
    const boxes = [];
    const goals = [];
    level.map.forEach((row, r) => {
        const cells = [];
        for (let c = 0; c < row.length; c++) {
            const ch = row[c];
            if (ch === "W") cells.push("wall");
            else cells.push("floor");
            if (ch === "P" || ch === "p") player = { r, c };
            if (ch === "B") boxes.push({ r, c });
            if (ch === "G") goals.push({ r, c });
            if (ch === "p") { player = { r, c }; goals.push({ r, c }); }
        }
        grid.push(cells);
    });
    return { grid, player, boxes, goals };
};

const Sokoban = ({ onComplete }) => {
    const [levelIdx] = useState(() => Math.floor(Math.random() * LEVELS.length));
    const parsed = parseLevel(LEVELS[levelIdx]);
    const [player, setPlayer] = useState(parsed.player);
    const [boxes, setBoxes] = useState(parsed.boxes);
    const [moves, setMoves] = useState(0);
    const { grid, goals } = parsed;

    const isWall = (r, c) => !grid[r] || !grid[r][c] || grid[r][c] === "wall";
    const boxAt = (r, c) => boxes.findIndex((b) => b.r === r && b.c === c);
    const isGoal = (r, c) => goals.some((g) => g.r === r && g.c === c);

    const checkWin = useCallback(
        (bxs) => goals.every((g) => bxs.some((b) => b.r === g.r && b.c === g.c)),
        [goals]
    );

    const moveDir = useCallback(
        (dr, dc) => {
            const nr = player.r + dr, nc = player.c + dc;
            if (isWall(nr, nc)) return;

            const bi = boxAt(nr, nc);
            if (bi >= 0) {
                const bnr = nr + dr, bnc = nc + dc;
                if (isWall(bnr, bnc) || boxAt(bnr, bnc) >= 0) return;
                const newBoxes = boxes.map((b, i) => (i === bi ? { r: bnr, c: bnc } : b));
                setBoxes(newBoxes);
                setPlayer({ r: nr, c: nc });
                setMoves(moves + 1);
                if (checkWin(newBoxes)) {
                    const score = Math.max(50, 100 - moves * 2);
                    setTimeout(() => onComplete(Math.min(100, score)), 400);
                }
            } else {
                setPlayer({ r: nr, c: nc });
                setMoves(moves + 1);
            }
        },
        [player, boxes, moves, checkWin, onComplete, grid]
    );

    useEffect(() => {
        const handleKey = (e) => {
            const map = { ArrowUp: [-1, 0], ArrowDown: [1, 0], ArrowLeft: [0, -1], ArrowRight: [0, 1] };
            if (map[e.key]) {
                e.preventDefault();
                moveDir(...map[e.key]);
            }
        };
        window.addEventListener("keydown", handleKey);
        return () => window.removeEventListener("keydown", handleKey);
    }, [moveDir]);

    const cellSize = 48;
    const rows = grid.length, cols = grid[0]?.length || 0;

    return (
        <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "12px", color: "white" }}>
            <div style={{ fontSize: "13px" }}>
                {gameText("Hamle:")}<span style={{ color: "#FFD700" }}>{moves}</span>
                <span style={{ marginLeft: 10 }}>📦 <span style={{ color: "#64ffda" }}>{boxes.filter(b => goals.some(g => g.r === b.r && g.c === b.c)).length}/{goals.length}</span></span>
            </div>
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: `repeat(${cols}, ${cellSize}px)`,
                    gap: "2px",
                    padding: "4px",
                    background: "#1a1a2e",
                    borderRadius: "8px",
                    border: checkWin(boxes) ? "3px solid #64ffda" : "2px solid rgba(255,255,255,0.06)",
                }}
            >
                {Array.from({ length: rows * cols }, (_, idx) => {
                    const r = Math.floor(idx / cols), c = idx % cols;
                    const wall = isWall(r, c);
                    const bi = boxAt(r, c);
                    const isP = player.r === r && player.c === c;
                    const isG = isGoal(r, c);
                    const isBoxOnGoal = bi >= 0 && isG;

                    return (
                        <div
                            key={idx}
                            style={{
                                width: cellSize,
                                height: cellSize,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                borderRadius: "4px",
                                fontSize: "22px",
                                background: wall
                                    ? "linear-gradient(135deg, #444, #333)"
                                    : isG
                                        ? "rgba(100,255,218,0.1)"
                                        : "rgba(255,255,255,0.04)",
                            }}
                        >
                            {isP ? "😊" : bi >= 0 ? (isBoxOnGoal ? "✅" : "📦") : isG ? "🎯" : ""}
                        </div>
                    );
                })}
            </div>
            {/* Mobile controls */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 44px)", gap: "4px" }}>
                <div />
                <button onClick={() => moveDir(-1, 0)} style={btnStyle}>↑</button>
                <div />
                <button onClick={() => moveDir(0, -1)} style={btnStyle}>←</button>
                <button onClick={() => moveDir(1, 0)} style={btnStyle}>↓</button>
                <button onClick={() => moveDir(0, 1)} style={btnStyle}>→</button>
            </div>
            <div style={{ fontSize: "12px", color: "#8892b0" }}>
                {gameText("📦 → 🎯")}</div>
        </div>
    );
};

const btnStyle = {
    width: 44,
    height: 44,
    fontSize: "18px",
    background: "rgba(255,255,255,0.1)",
    color: "white",
    border: "1px solid rgba(255,255,255,0.2)",
    borderRadius: "8px",
    cursor: "pointer",
};

export default Sokoban;
