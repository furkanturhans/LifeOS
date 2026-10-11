// Adapted by LifeOS: localized UI, touch controls, gameplay fixes. Apache-2.0.
// Upstream: https://github.com/hajunho/zeli-web-games @ ba9938eb222cb588ae7b0a6056ba6bdda89dcd9c
import { gameText } from './text';
/**
 * 🎮 Game 96: 양궁 — Canvas 과녁 + 이동 조준점 + 바람 효과
 */
import { useCallback, useEffect, useRef, useState } from "react";

const ArcheryGame = ({ onComplete }) => {
    const canvasRef = useRef(null);
    const [shots, setShots] = useState(0);
    const [score, setScore] = useState(0);
    const [wind, setWind] = useState(0);
    const [aimX, setAimX] = useState(50);
    const [aimY, setAimY] = useState(50);
    const [result, setResult] = useState(null);
    const [arrows, setArrows] = useState([]);
    const aimRef = useRef({ x: 50, y: 50, dx: 1.5, dy: 1 });
    const MAX = 5;

    // Oscillate aim
    useEffect(() => {
        const t = setInterval(() => {
            const a = aimRef.current;
            a.x += a.dx + wind * 0.3;
            a.y += a.dy;
            if (a.x > 85 || a.x < 15) a.dx *= -1;
            if (a.y > 85 || a.y < 15) a.dy *= -1;
            a.x = Math.max(5, Math.min(95, a.x));
            a.y = Math.max(5, Math.min(95, a.y));
            setAimX(a.x);
            setAimY(a.y);
        }, 40);
        return () => clearInterval(t);
    }, [wind]);

    // Draw
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        const S = 220;
        ctx.clearRect(0, 0, S, S);

        // Target rings
        const cx = S / 2, cy = S / 2;
        const rings = [
            { r: 90, color: "#fff" }, { r: 80, color: "#222" },
            { r: 65, color: "#3B82F6" }, { r: 50, color: "#EF4444" },
            { r: 35, color: "#EF4444" }, { r: 20, color: "#FFD700" },
            { r: 8, color: "#FFD700" },
        ];
        rings.forEach(({ r, color }) => {
            ctx.beginPath();
            ctx.arc(cx, cy, r, 0, Math.PI * 2);
            ctx.fillStyle = color;
            ctx.fill();
            ctx.strokeStyle = "rgba(0,0,0,0.2)";
            ctx.lineWidth = 1;
            ctx.stroke();
        });
        // Bullseye dot
        ctx.beginPath();
        ctx.arc(cx, cy, 3, 0, Math.PI * 2);
        ctx.fillStyle = "#000";
        ctx.fill();

        // Previous arrows
        arrows.forEach((ar) => {
            const ax = (ar.x / 100) * S, ay = (ar.y / 100) * S;
            ctx.beginPath();
            ctx.moveTo(ax, ay - 8);
            ctx.lineTo(ax - 3, ay + 4);
            ctx.lineTo(ax + 3, ay + 4);
            ctx.closePath();
            ctx.fillStyle = "rgba(139,69,19,0.8)";
            ctx.fill();
            ctx.beginPath();
            ctx.arc(ax, ay, 2, 0, Math.PI * 2);
            ctx.fillStyle = "#333";
            ctx.fill();
        });

        // Crosshair
        if (!result) {
            const ax = (aimX / 100) * S, ay = (aimY / 100) * S;
            ctx.strokeStyle = "rgba(255,255,255,0.6)";
            ctx.lineWidth = 1;
            ctx.setLineDash([3, 3]);
            ctx.beginPath(); ctx.moveTo(ax - 15, ay); ctx.lineTo(ax + 15, ay); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(ax, ay - 15); ctx.lineTo(ax, ay + 15); ctx.stroke();
            ctx.setLineDash([]);
            ctx.beginPath();
            ctx.arc(ax, ay, 10, 0, Math.PI * 2);
            ctx.strokeStyle = "rgba(255,50,50,0.7)";
            ctx.lineWidth = 1.5;
            ctx.stroke();
        }
    }, [aimX, aimY, arrows, result]);

    // Change wind each shot
    useEffect(() => {
        setWind(Math.round((Math.random() - 0.5) * 6));
    }, [shots]);

    const shoot = useCallback(() => {
        if (result) return;
        const drift = wind * (Math.random() * 2);
        const finalX = aimX + drift;
        const finalY = aimY + (Math.random() - 0.5) * 3;
        const distFromCenter = Math.sqrt(Math.pow(finalX - 50, 2) + Math.pow(finalY - 50, 2));
        const pts = distFromCenter < 5 ? 10 : distFromCenter < 15 ? 8 : distFromCenter < 25 ? 6 : distFromCenter < 35 ? 4 : 2;
        const label = pts >= 10 ? gameText("🎯 10") : pts >= 8 ? gameText("8") : pts >= 6 ? gameText("6") : pts >= 4 ? gameText("4") : gameText("2");

        setArrows((a) => [...a, { x: finalX, y: finalY }]);
        const newScore = score + pts;
        setScore(newScore);
        setResult(label);

        const ns = shots + 1;
        setShots(ns);
        setTimeout(() => {
            if (ns >= MAX) onComplete(Math.min(100, Math.round(newScore / (MAX * 10) * 100)));
            else setResult(null);
        }, 800);
    }, [aimX, aimY, wind, shots, score, result, onComplete]);

    return (
        <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "8px", color: "white" }}>
            <div style={{ display: "flex", gap: "16px", fontSize: "12px" }}>
                <span>🏹 {shots}/{MAX}</span>
                <span>{gameText("Puan:")}<span style={{ color: "#FFD700" }}>{score}</span></span>
                <span>{gameText("💨")}<span style={{ color: wind > 0 ? "#3B82F6" : "#EF4444" }}>{wind > 0 ? "→" : "←"} {Math.abs(wind)}</span></span>
            </div>

            <canvas ref={canvasRef} width={220} height={220}
                style={{ borderRadius: "50%", border: "3px solid rgba(255,255,255,0.2)", boxShadow: "0 4px 20px rgba(0,0,0,0.4)" }} />

            {result && <div style={{ fontSize: "18px", fontWeight: "bold", color: "#FFD700" }}>{result}</div>}

            <button onClick={shoot} disabled={!!result} style={{
                padding: "10px 28px", fontSize: "14px", fontWeight: "bold",
                background: result ? "rgba(100,100,100,0.3)" : "linear-gradient(135deg, rgba(34,197,94,0.3), rgba(34,197,94,0.1))",
                color: "white", border: `2px solid ${result ? "#666" : "#22C55E"}`,
                borderRadius: "12px", cursor: result ? "wait" : "pointer",
            }}>{gameText("🏹")}</button>
        </div>
    );
};

export default ArcheryGame;
