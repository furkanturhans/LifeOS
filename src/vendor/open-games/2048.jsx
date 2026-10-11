// Adapted by LifeOS: localized UI, touch controls, gameplay fixes. Apache-2.0.
// Upstream: https://github.com/hajunho/zeli-web-games @ ba9938eb222cb588ae7b0a6056ba6bdda89dcd9c
import { gameText } from './text';
/**
 * 🎮 Game 1: 2048
 * 타일을 합쳐서 최대한 높은 숫자를 만드세요!
 * 스코어 = min(100, (maxTile / 2048) * 100)
 */

import { useCallback, useEffect, useRef, useState } from "react";

const SIZE = 4;
const COLORS = {
    0: "#cdc1b4", 2: "#eee4da", 4: "#ede0c8", 8: "#f2b179",
    16: "#f59563", 32: "#f67c5f", 64: "#f65e3b", 128: "#edcf72",
    256: "#edcc61", 512: "#edc850", 1024: "#edc53f", 2048: "#edc22e",
};
const TEXT_COLORS = { 2: "#776e65", 4: "#776e65" };

const emptyGrid = () => Array.from({ length: SIZE }, () => Array(SIZE).fill(0));

const addRandom = (grid) => {
    const empty = [];
    for (let r = 0; r < SIZE; r++)
        for (let c = 0; c < SIZE; c++)
            if (grid[r][c] === 0) empty.push([r, c]);
    if (empty.length === 0) return false;
    const [r, c] = empty[Math.floor(Math.random() * empty.length)];
    grid[r][c] = Math.random() < 0.9 ? 2 : 4;
    return true;
};

const compress = (row) => row.filter((v) => v !== 0);

const mergeRow = (row) => {
    const filtered = compress(row);
    let score = 0;
    for (let i = 0; i < filtered.length - 1; i++) {
        if (filtered[i] === filtered[i + 1]) {
            filtered[i] *= 2;
            score += filtered[i];
            filtered.splice(i + 1, 1);
        }
    }
    while (filtered.length < SIZE) filtered.push(0);
    return { row: filtered, score };
};

const rotateGrid = (grid) => {
    const n = grid.length;
    return Array.from({ length: n }, (_, r) =>
        Array.from({ length: n }, (_, c) => grid[n - 1 - c][r])
    );
};

// ═══════════════════════════════════════════════════
// 📖 튜토리얼 컴포넌트
// ═══════════════════════════════════════════════════
const TUTORIAL_STEPS = [
    {
        icon: "👆",
        title: gameText("2048"),
        content: gameText("↑ ↓ ← →"),
        visual: (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "16px", margin: "12px 0" }}>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 32px)", gap: "4px" }}>
                    <div />
                    <div style={{ background: "rgba(255,255,255,0.15)", borderRadius: "6px", display: "flex", alignItems: "center", justifyContent: "center", width: 32, height: 32, fontSize: "16px" }}>↑</div>
                    <div />
                    <div style={{ background: "rgba(255,255,255,0.15)", borderRadius: "6px", display: "flex", alignItems: "center", justifyContent: "center", width: 32, height: 32, fontSize: "16px" }}>←</div>
                    <div style={{ background: "rgba(255,255,255,0.15)", borderRadius: "6px", display: "flex", alignItems: "center", justifyContent: "center", width: 32, height: 32, fontSize: "16px" }}>↓</div>
                    <div style={{ background: "rgba(255,255,255,0.15)", borderRadius: "6px", display: "flex", alignItems: "center", justifyContent: "center", width: 32, height: 32, fontSize: "16px" }}>→</div>
                </div>
                <div style={{ fontSize: "13px", color: "#8892b0", textAlign: "left", lineHeight: 1.6 }}>
                    {gameText("← →")}<br/>
                    {gameText("↑ ↓ ← →")}</div>
            </div>
        ),
    },
    {
        icon: "🔢",
        title: gameText("2048"),
        content: gameText("2 + 2 = 4 · 4 + 4 = 8"),
        visual: (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", margin: "12px 0" }}>
                {/* 합치기 예시 */}
                <div style={{ width: 44, height: 44, background: "#eee4da", borderRadius: "6px", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", color: "#776e65", fontSize: "18px" }}>2</div>
                <div style={{ fontSize: "18px", color: "#8892b0" }}>+</div>
                <div style={{ width: 44, height: 44, background: "#eee4da", borderRadius: "6px", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", color: "#776e65", fontSize: "18px" }}>2</div>
                <div style={{ fontSize: "18px", color: "#8892b0" }}>=</div>
                <div style={{ width: 44, height: 44, background: "#ede0c8", borderRadius: "6px", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", color: "#776e65", fontSize: "18px", boxShadow: "0 0 10px rgba(237,224,200,0.5)" }}>4</div>
                <div style={{ fontSize: "20px", marginLeft: "4px" }}>✨</div>
            </div>
        ),
    },
    {
        icon: "🏆",
        title: gameText("2048"),
        content: gameText("2048"),
        visual: (
            <div style={{ margin: "12px 0" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", marginBottom: "10px" }}>
                    <div style={{ width: 40, height: 40, background: "#edc22e", borderRadius: "6px", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", color: "#f9f6f2", fontSize: "11px", boxShadow: "0 0 12px rgba(237,194,46,0.6)" }}>2048</div>
                    <span style={{ fontSize: "13px", color: "#FFD700" }}>{gameText("← 2048")}</span>
                </div>
                <div style={{ display: "flex", gap: "10px", justifyContent: "center", fontSize: "12px", color: "#8892b0" }}>
                    <span>{gameText("↙")}</span>
                    <span>{gameText("←")}</span>
                </div>
            </div>
        ),
    },
];

const TutorialOverlay = ({ onClose }) => {
    const [step, setStep] = useState(0);
    const current = TUTORIAL_STEPS[step];
    const isLast = step === TUTORIAL_STEPS.length - 1;

    return (
        <div
            style={{
                position: "absolute",
                inset: 0,
                zIndex: 100,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "rgba(0,0,0,0.65)",
                backdropFilter: "blur(4px)",
                borderRadius: "8px",
            }}
            onClick={(e) => e.stopPropagation()}
        >
            <div
                style={{
                    width: "min(320px, 90%)",
                    background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)",
                    borderRadius: "16px",
                    border: "1px solid rgba(255,255,255,0.15)",
                    padding: "24px 20px 20px",
                    boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
                    color: "white",
                    textAlign: "center",
                    animation: "tutorialFadeIn 0.3s ease",
                }}
            >
                {/* 단계 인디케이터 */}
                <div style={{ display: "flex", justifyContent: "center", gap: "6px", marginBottom: "16px" }}>
                    {TUTORIAL_STEPS.map((_, i) => (
                        <div
                            key={i}
                            style={{
                                width: i === step ? "24px" : "8px",
                                height: "8px",
                                borderRadius: "4px",
                                background: i === step ? "linear-gradient(135deg, #0cbfff, #7c3aed)" : "rgba(255,255,255,0.2)",
                                transition: "all 0.3s",
                            }}
                        />
                    ))}
                </div>

                {/* 아이콘 */}
                <div style={{ fontSize: "40px", marginBottom: "8px" }}>{current.icon}</div>

                {/* 제목 */}
                <h3 style={{
                    fontSize: "18px",
                    fontWeight: "bold",
                    margin: "0 0 8px",
                    background: "linear-gradient(135deg, #0cbfff, #7c3aed)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                }}>
                    {current.title}
                </h3>

                {/* 설명 */}
                <p style={{ fontSize: "14px", color: "#ccd6f6", margin: 0, lineHeight: 1.7, whiteSpace: "pre-line" }}>
                    {current.content}
                </p>

                {/* 시각적 가이드 */}
                {current.visual}

                {/* 버튼 영역 */}
                <div style={{ display: "flex", gap: "10px", marginTop: "16px", justifyContent: "center" }}>
                    {!isLast && (
                        <button
                            onClick={onClose}
                            style={{
                                padding: "10px 20px",
                                background: "rgba(255,255,255,0.08)",
                                color: "#8892b0",
                                border: "1px solid rgba(255,255,255,0.1)",
                                borderRadius: "10px",
                                cursor: "pointer",
                                fontSize: "13px",
                                transition: "background 0.2s",
                            }}
                            onMouseOver={(e) => (e.target.style.background = "rgba(255,255,255,0.15)")}
                            onMouseOut={(e) => (e.target.style.background = "rgba(255,255,255,0.08)")}
                        >
                            {gameText("Atla")}</button>
                    )}
                    <button
                        onClick={() => isLast ? onClose() : setStep(step + 1)}
                        style={{
                            padding: "10px 28px",
                            background: "linear-gradient(135deg, #0cbfff, #7c3aed)",
                            color: "white",
                            border: "none",
                            borderRadius: "10px",
                            cursor: "pointer",
                            fontSize: "14px",
                            fontWeight: "bold",
                            transition: "transform 0.2s, box-shadow 0.2s",
                            boxShadow: "0 4px 12px rgba(12,191,255,0.3)",
                        }}
                        onMouseOver={(e) => {
                            e.target.style.transform = "scale(1.05)";
                            e.target.style.boxShadow = "0 6px 16px rgba(12,191,255,0.5)";
                        }}
                        onMouseOut={(e) => {
                            e.target.style.transform = "scale(1)";
                            e.target.style.boxShadow = "0 4px 12px rgba(12,191,255,0.3)";
                        }}
                    >
                        {isLast ? gameText("Başla") : gameText(`Sonraki (${step + 1}/${TUTORIAL_STEPS.length})`)}
                    </button>
                </div>
            </div>

            <style>{`
                @keyframes tutorialFadeIn {
                    from { opacity: 0; transform: scale(0.92) translateY(10px); }
                    to { opacity: 1; transform: scale(1) translateY(0); }
                }
            `}</style>
        </div>
    );
};

const Game2048 = ({ onComplete }) => {
    const [grid, setGrid] = useState(() => {
        const g = emptyGrid();
        addRandom(g);
        addRandom(g);
        return g;
    });
    const [score, setScore] = useState(0);
    const [gameOver, setGameOver] = useState(false);
    const [showTutorial, setShowTutorial] = useState(false);
    const containerRef = useRef(null);

    const getMaxTile = useCallback((g) => Math.max(...g.flat()), []);

    const canMove = useCallback((g) => {
        for (let r = 0; r < SIZE; r++)
            for (let c = 0; c < SIZE; c++) {
                if (g[r][c] === 0) return true;
                if (c < SIZE - 1 && g[r][c] === g[r][c + 1]) return true;
                if (r < SIZE - 1 && g[r][c] === g[r + 1][c]) return true;
            }
        return false;
    }, []);

    const moveLeft = useCallback((g) => {
        let moved = false;
        let gained = 0;
        const newG = g.map((row) => {
            const { row: merged, score: s } = mergeRow(row);
            gained += s;
            if (merged.some((v, i) => v !== row[i])) moved = true;
            return merged;
        });
        return { grid: newG, moved, gained };
    }, []);

    const move = useCallback(
        (dir) => {
            if (gameOver || showTutorial) return;
            let g = grid.map((r) => [...r]);

            // Rotate so all moves become "left"
            const rotations = { left: 0, up: 3, right: 2, down: 1 };
            for (let i = 0; i < rotations[dir]; i++) g = rotateGrid(g);

            const { grid: newG, moved, gained } = moveLeft(g);
            if (!moved) return;

            g = newG;
            for (let i = 0; i < (4 - rotations[dir]) % 4; i++) g = rotateGrid(g);

            addRandom(g);
            const newScore = score + gained;
            setScore(newScore);
            setGrid(g);

            if (!canMove(g)) {
                setGameOver(true);
                const maxTile = getMaxTile(g);
                const finalScore = Math.min(100, Math.round((maxTile / 2048) * 100));
                setTimeout(() => onComplete(finalScore), 600);
            }
        },
        [grid, score, gameOver, showTutorial, moveLeft, canMove, getMaxTile, onComplete]
    );

    useEffect(() => {
        const handleKey = (e) => {
            const map = { ArrowLeft: "left", ArrowRight: "right", ArrowUp: "up", ArrowDown: "down" };
            if (map[e.key]) {
                e.preventDefault();
                move(map[e.key]);
            }
        };
        window.addEventListener("keydown", handleKey);
        return () => window.removeEventListener("keydown", handleKey);
    }, [move]);

    // Touch/swipe support
    const touchRef = useRef(null);
    const handleTouchStart = (e) => {
        touchRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    };
    const handleTouchEnd = (e) => {
        if (!touchRef.current) return;
        const dx = e.changedTouches[0].clientX - touchRef.current.x;
        const dy = e.changedTouches[0].clientY - touchRef.current.y;
        const absDx = Math.abs(dx), absDy = Math.abs(dy);
        if (Math.max(absDx, absDy) < 30) return;
        if (absDx > absDy) move(dx > 0 ? "right" : "left");
        else move(dy > 0 ? "down" : "up");
    };

    const tileSize = 68;
    const gap = 6;

    return (
        <div
            ref={containerRef}
            style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "12px", color: "white", outline: "none" }}
            tabIndex={0}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
        >
            <div style={{ fontSize: "16px", fontWeight: "bold", display: "flex", alignItems: "center", gap: "8px" }}>
                <span>{gameText("Puan:")}<span style={{ color: "#FFD700" }}>{score}</span></span>
                <span style={{ fontSize: "12px", color: "#8892b0" }}>{gameText("En iyi:")}{getMaxTile(grid)}</span>
                {/* 도움말 버튼 */}
                <button
                    onClick={() => setShowTutorial(true)}
                    title={gameText("Nasıl Oynanır?")}
                    style={{
                        width: "24px",
                        height: "24px",
                        borderRadius: "50%",
                        border: "1px solid rgba(255,255,255,0.25)",
                        background: "rgba(255,255,255,0.08)",
                        color: "#8892b0",
                        fontSize: "13px",
                        fontWeight: "bold",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        transition: "all 0.2s",
                        marginLeft: "4px",
                        padding: 0,
                        lineHeight: 1,
                    }}
                    onMouseOver={(e) => {
                        e.currentTarget.style.background = "rgba(12,191,255,0.2)";
                        e.currentTarget.style.borderColor = "#0cbfff";
                        e.currentTarget.style.color = "#0cbfff";
                    }}
                    onMouseOut={(e) => {
                        e.currentTarget.style.background = "rgba(255,255,255,0.08)";
                        e.currentTarget.style.borderColor = "rgba(255,255,255,0.25)";
                        e.currentTarget.style.color = "#8892b0";
                    }}
                >
                    ?
                </button>
            </div>
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: `repeat(${SIZE}, ${tileSize}px)`,
                    gap: `${gap}px`,
                    padding: `${gap}px`,
                    background: "#bbada0",
                    borderRadius: "8px",
                    boxShadow: "0 4px 16px rgba(0,0,0,0.3)",
                    border: gameOver ? "3px solid #FF6B6B" : "2px solid transparent",
                    position: "relative",
                }}
            >
                {grid.flat().map((val, idx) => (
                    <div
                        key={idx}
                        style={{
                            width: tileSize,
                            height: tileSize,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            background: COLORS[val] || "#3c3a32",
                            borderRadius: "4px",
                            fontSize: val >= 1024 ? "18px" : val >= 128 ? "22px" : "26px",
                            fontWeight: "bold",
                            color: TEXT_COLORS[val] || "#f9f6f2",
                            transition: "all 0.15s",
                            boxShadow: val >= 128 ? `0 0 10px ${(COLORS[val] || '#3c3a32')}88` : "none",
                        }}
                    >
                        {val > 0 ? val : ""}
                    </div>
                ))}
                {gameOver && (
                    <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.4)", borderRadius: "8px" }}>
                        <div style={{ fontSize: "18px", fontWeight: "bold", color: "#FF6B6B" }}>{gameText("Oyun Bitti")}{getMaxTile(grid)}</div>
                    </div>
                )}
                {showTutorial && (
                    <TutorialOverlay onClose={() => setShowTutorial(false)} />
                )}
            </div>
            <div style={{display:'flex',gap:8}}>
                {[['left','←'],['up','↑'],['down','↓'],['right','→']].map(([direction,label])=><button key={direction} onClick={()=>move(direction)} disabled={gameOver||showTutorial} style={{width:48,height:44,borderRadius:12,border:'1px solid #64ffda',background:'#182a3e',color:'white',fontSize:22}}>{label}</button>)}
            </div>
            <div style={{ fontSize: "12px", color: "#8892b0", textAlign: "center", lineHeight: 1.6 }}>
                {gameOver
                    ? gameText("Oyun Bitti")
                    : gameText("↑ ↓ ← →")
                }
            </div>
        </div>
    );
};

export default Game2048;
