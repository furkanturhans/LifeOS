// Adapted by LifeOS: localized UI, touch controls, gameplay fixes. Apache-2.0.
// Upstream: https://github.com/hajunho/zeli-web-games @ ba9938eb222cb588ae7b0a6056ba6bdda89dcd9c
import { gameText } from './text';
/**
 * 🎮 Game 33: 스네이크 — 몸통 그라데이션 + 먹기 이펙트 + 방향 패드
 */
import { useCallback, useEffect, useRef, useState } from "react";

const GRID = 15, CELL = 20, SPEED = 120;

const Snake = ({ onComplete }) => {
    const [snake, setSnake] = useState([{ x: 7, y: 7 }]);
    const [food, setFood] = useState({ x: 10, y: 10 });
    const [dir, setDir] = useState({ x: 1, y: 0 });
    const [gameActive, setGameActive] = useState(true);
    const [started,setStarted]=useState(false);
    const [score, setScore] = useState(0);
    const [ateFood, setAteFood] = useState(false);
    const dirRef = useRef({ x: 1, y: 0 });
    const movedDirRef = useRef({ x: 1, y: 0 });
    const scoreRef = useRef(0);

    const spawnFood = useCallback((s) => {
        const free=[];
        for(let y=0;y<GRID;y++)for(let x=0;x<GRID;x++)if(!s.some(seg=>seg.x===x&&seg.y===y))free.push({x,y});
        return free.length ? free[Math.floor(Math.random()*free.length)] : null;
    }, []);

    useEffect(() => {
        const kd = (e) => {
            if(!e.key.startsWith('Arrow'))return;
            setStarted(true);
            const d = movedDirRef.current;
            if (e.key === "ArrowUp" && d.y !== 1) dirRef.current = { x: 0, y: -1 };
            if (e.key === "ArrowDown" && d.y !== -1) dirRef.current = { x: 0, y: 1 };
            if (e.key === "ArrowLeft" && d.x !== 1) dirRef.current = { x: -1, y: 0 };
            if (e.key === "ArrowRight" && d.x !== -1) dirRef.current = { x: 1, y: 0 };
            e.preventDefault();
        };
        window.addEventListener("keydown", kd);
        return () => window.removeEventListener("keydown", kd);
    }, []);

    useEffect(() => {
        if (!gameActive || !started) return;
        const loop = setInterval(() => {
            setSnake((prev) => {
                const d = dirRef.current;
                movedDirRef.current=d;
                setDir(d);
                const head = { x: prev[0].x + d.x, y: prev[0].y + d.y };
                if (head.x < 0 || head.x >= GRID || head.y < 0 || head.y >= GRID || prev.slice(0, (head.x===food.x && head.y===food.y) ? prev.length : -1).some((s) => s.x === head.x && s.y === head.y)) {
                    setGameActive(false);
                    setTimeout(() => onComplete(Math.min(100, Math.round(scoreRef.current * 5))), 500);
                    return prev;
                }
                const ns = [head, ...prev];
                if (head.x === food.x && head.y === food.y) {
                    scoreRef.current += 1;
                    setScore(scoreRef.current);
                    const nextFood=spawnFood(ns);
                    if(!nextFood){setGameActive(false);setTimeout(()=>onComplete(100),300);}else setFood(nextFood);
                    setAteFood(true);
                    setTimeout(() => setAteFood(false), 300);
                } else {
                    ns.pop();
                }
                return ns;
            });
        }, SPEED);
        return () => clearInterval(loop);
    }, [gameActive, started, food, onComplete, spawnFood]);

    const handleDir = useCallback((dx, dy) => {
        setStarted(true);
        const d = dir;
        if (dx !== -d.x || dy !== -d.y) dirRef.current = { x: dx, y: dy };
    }, [dir]);

    return (
        <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "6px", color: "white" }}>
            <style>{`@keyframes foodPulse { 0%,100% { transform: scale(1); } 50% { transform: scale(1.2); } }`}</style>

            <div style={{ fontSize: "13px" }}>
                {!started&&<span>{gameText('Başla')} · </span>}
                🍎 <span style={{ color: "#64ffda", fontWeight: "bold" }}>{score}</span>
                {score >= 10 && <span style={{ color: "#FFD700", marginLeft: 8 }}>{gameText("🏆 Harika!")}</span>}
            </div>

            <div style={{
                width: GRID * CELL, height: GRID * CELL,
                borderRadius: "10px", position: "relative",
                background: "linear-gradient(135deg, #0a1628, #0a0a1e)",
                border: "2px solid rgba(100,255,218,0.1)",
                boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
            }}>
                {/* Grid dots */}
                {[...Array(GRID * GRID)].map((_, i) => {
                    const x = i % GRID, y = Math.floor(i / GRID);
                    if ((x + y) % 3 !== 0) return null;
                    return <div key={i} style={{
                        position: "absolute", left: x * CELL + CELL / 2 - 1, top: y * CELL + CELL / 2 - 1,
                        width: 2, height: 2, borderRadius: "50%", background: "rgba(255,255,255,0.03)",
                    }} />;
                })}

                {/* Snake */}
                {snake.map((s, i) => {
                    const opacity = 1 - (i / snake.length) * 0.5;
                    const isHead = i === 0;
                    return (
                        <div key={i} style={{
                            position: "absolute", left: s.x * CELL + 1, top: s.y * CELL + 1,
                            width: CELL - 2, height: CELL - 2,
                            borderRadius: isHead ? "6px" : "4px",
                            background: isHead
                                ? "linear-gradient(135deg, #64ffda, #22c55e)"
                                : `rgba(34,197,94,${opacity})`,
                            boxShadow: isHead ? "0 0 8px rgba(100,255,218,0.4)" : "none",
                            transition: "left 0.08s, top 0.08s",
                        }} />
                    );
                })}

                {/* Food */}
                <div style={{
                    position: "absolute", left: food.x * CELL, top: food.y * CELL,
                    width: CELL, height: CELL,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "16px",
                    animation: "foodPulse 1s ease infinite",
                    filter: ateFood ? "drop-shadow(0 0 8px rgba(239,68,68,0.6))" : "none",
                }}>🍎</div>

                {/* Game over */}
                {!gameActive && (
                    <div style={{
                        position: "absolute", inset: 0, display: "flex", flexDirection: "column",
                        alignItems: "center", justifyContent: "center",
                        background: "rgba(0,0,0,0.5)", borderRadius: "10px",
                    }}>
                        <div style={{ fontSize: "18px", fontWeight: "bold", color: "#FF6B6B" }}>{gameText("Oyun Bitti")}</div>
                        <div style={{ color: "#FFD700" }}>🍎 {score}{gameText("")}</div>
                    </div>
                )}
            </div>

            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "3px" }}>
                <button onClick={() => handleDir(0, -1)} style={dBtn}>▲</button>
                <div style={{ display: "flex", gap: "3px" }}>
                    <button onClick={() => handleDir(-1, 0)} style={dBtn}>◀</button>
                    <button onClick={() => handleDir(0, 1)} style={dBtn}>▼</button>
                    <button onClick={() => handleDir(1, 0)} style={dBtn}>▶</button>
                </div>
            </div>
        </div>
    );
};

const dBtn = {
    width: 34, height: 30, fontSize: "12px",
    background: "rgba(255,255,255,0.08)", color: "white",
    border: "1px solid rgba(255,255,255,0.15)", borderRadius: "8px", cursor: "pointer",
};

export default Snake;
