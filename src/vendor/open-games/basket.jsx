// Adapted by LifeOS: localized UI, touch controls, gameplay fixes. Apache-2.0.
// Upstream: https://github.com/hajunho/zeli-web-games @ ba9938eb222cb588ae7b0a6056ba6bdda89dcd9c
import { gameText } from './text';
/**
 * 🎮 Game 91: 농구 프리스로 (고도화)
 * Canvas 포물선 궤적 시각화 + 공 날아가는 애니메이션
 */
import { useCallback, useState } from "react";

const W = 250, H = 280;
const HOOP_X = 175, HOOP_Y = 70, HOOP_R = 18;
const MAX_SHOTS = 5;

const BasketballShoot = ({ onComplete }) => {
    const [angle, setAngle] = useState(55);
    const [power, setPower] = useState(60);
    const [shots, setShots] = useState(0);
    const [made, setMade] = useState(0);
    const [phase, setPhase] = useState("aim"); // aim, flying, result
    const [ballPath, setBallPath] = useState([]);
    const [result, setResult] = useState(null);
    const [trail, setTrail] = useState([]);

    const shoot = useCallback(() => {
        if (phase !== "aim") return;
        setPhase("flying");

        const rad = (angle * Math.PI) / 180;
        const v = power * 0.12;
        const startX = 50, startY = 240;
        const vx = Math.cos(rad) * v;
        const vy = -Math.sin(rad) * v;
        const g = 0.08;

        const path = [];
        let bx = startX, by = startY, bvx = vx, bvy = vy;
        for (let i = 0; i < 120; i++) {
            bx += bvx;
            bvy += g;
            by += bvy;
            path.push({ x: bx, y: by });
            if (by > H) break;
        }

        let step = 0;
        const anim = setInterval(() => {
            if (step >= path.length) {
                clearInterval(anim);
                const lastPt = path[Math.min(step - 1, path.length - 1)];
                const dist = Math.sqrt((lastPt.x - HOOP_X) ** 2 + (lastPt.y - HOOP_Y) ** 2);
                // Check if ball passes through hoop area
                const hoopHit = path.some(p => Math.abs(p.x - HOOP_X) < HOOP_R && Math.abs(p.y - HOOP_Y) < 15);
                const scored = hoopHit;
                const newMade = made + (scored ? 1 : 0);

                if (scored) setMade(newMade);
                setResult(scored ? gameText("🏀") : gameText("❌"));
                setPhase("result");

                setTimeout(() => {
                    const ns = shots + 1;
                    setShots(ns);
                    if (ns >= MAX_SHOTS) {
                        onComplete(Math.round((newMade / MAX_SHOTS) * 100));
                    } else {
                        setPhase("aim");
                        setBallPath([]);
                        setTrail([]);
                        setResult(null);
                    }
                }, 1000);
                return;
            }
            setTrail(path.slice(0, step + 1));
            setBallPath([path[step]]);
            step++;
        }, 35);
    }, [phase, angle, power, shots, made, onComplete]);

    const ballPos = ballPath[0] || { x: 50, y: 240 };
    const aimRad = (angle * Math.PI) / 180;
    const aimEndX = 50 + Math.cos(aimRad) * (power * 0.8);
    const aimEndY = 240 - Math.sin(aimRad) * (power * 0.8);

    return (
        <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "6px", color: "white" }}>
            <div style={{ fontSize: "13px" }}>
                {shots}/{MAX_SHOTS} | 🏀 <span style={{ color: "#64ffda" }}>{made}</span>{gameText("")}</div>
            {/* Progress dots */}
            <div style={{ display: "flex", gap: "5px" }}>
                {Array.from({ length: MAX_SHOTS }).map((_, i) => (
                    <div key={i} style={{ width: 10, height: 10, borderRadius: "50%", background: i < shots ? (i < made ? "#64ffda" : "#FF6B6B") : i === shots ? "#FFD700" : "rgba(255,255,255,0.1)" }} />
                ))}
            </div>

            <svg width={W} height={H} style={{ background: "linear-gradient(180deg, #0a1628, #1a2940)", borderRadius: "12px", border: "2px solid rgba(255,255,255,0.06)" }}>
                {/* Court floor */}
                <rect x={0} y={250} width={W} height={30} fill="rgba(139,90,43,0.3)" />

                {/* Backboard */}
                <rect x={HOOP_X - 5} y={35} width={35} height={50} fill="rgba(255,255,255,0.15)" stroke="white" strokeWidth={2} rx={2} />

                {/* Hoop */}
                <ellipse cx={HOOP_X} cy={HOOP_Y} rx={HOOP_R} ry={5}
                    fill="none" stroke="#EF4444" strokeWidth={3} />
                {/* Net lines */}
                {[-12, -4, 4, 12].map((dx, i) => (
                    <line key={i} x1={HOOP_X + dx} y1={HOOP_Y + 4} x2={HOOP_X + dx * 0.6} y2={HOOP_Y + 25}
                        stroke="rgba(255,255,255,0.15)" strokeWidth={1} />
                ))}

                {/* Pole */}
                <rect x={HOOP_X + 25} y={35} width={4} height={220} fill="rgba(255,255,255,0.2)" />

                {/* Aim guide */}
                {phase === "aim" && (
                    <>
                        <line x1={50} y1={240} x2={aimEndX} y2={aimEndY}
                            stroke="rgba(255,215,0,0.4)" strokeWidth={2} strokeDasharray="4,4" />
                        <circle cx={aimEndX} cy={aimEndY} r={4} fill="rgba(255,215,0,0.3)" />
                    </>
                )}

                {/* Trail */}
                {trail.length > 1 && (
                    <polyline
                        points={trail.map(p => `${p.x},${p.y}`).join(" ")}
                        fill="none" stroke="rgba(255,165,0,0.3)" strokeWidth={2} strokeDasharray="3,3"
                    />
                )}

                {/* Ball */}
                <circle cx={ballPos.x + 2} cy={ballPos.y + 2} r={10} fill="rgba(0,0,0,0.2)" />
                <circle cx={ballPos.x} cy={ballPos.y} r={10} fill="#FF8C00" stroke="#CC6600" strokeWidth={1.5} />
                <path d={`M${ballPos.x - 5},${ballPos.y} Q${ballPos.x},${ballPos.y - 6} ${ballPos.x + 5},${ballPos.y}`}
                    fill="none" stroke="#B35A00" strokeWidth={1} />
                <path d={`M${ballPos.x},${ballPos.y - 8} L${ballPos.x},${ballPos.y + 8}`}
                    stroke="#B35A00" strokeWidth={0.8} />

                {/* Player */}
                {phase === "aim" && <text x={45} y={248} textAnchor="middle" fontSize="24">🏃</text>}
            </svg>

            {phase === "aim" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "4px", width: "220px" }}>
                    <label style={{ fontSize: "11px", display: "flex", alignItems: "center", gap: "6px" }}>
                        📐 {angle}°
                        <input type="range" min="20" max="75" value={angle} onChange={e => setAngle(+e.target.value)}
                            style={{ flex: 1, accentColor: "#FFD700" }} />
                    </label>
                    <label style={{ fontSize: "11px", display: "flex", alignItems: "center", gap: "6px" }}>
                        💪 {power}%
                        <input type="range" min="30" max="100" value={power} onChange={e => setPower(+e.target.value)}
                            style={{ flex: 1, accentColor: "#EF4444" }} />
                    </label>
                </div>
            )}

            {phase === "aim" && (
                <button onClick={shoot} style={{
                    padding: "10px 28px", fontSize: "15px", fontWeight: "bold",
                    background: "rgba(255,165,0,0.3)", color: "white",
                    border: "2px solid #FFA500", borderRadius: "12px", cursor: "pointer",
                }}>{gameText("🏀")}</button>
            )}

            {result && (
                <div style={{
                    fontSize: "16px", fontWeight: "bold",
                    color: result.includes(gameText("🏀")) ? "#FFD700" : "#FF6B6B",
                }}>{result}</div>
            )}
        </div>
    );
};

export default BasketballShoot;
