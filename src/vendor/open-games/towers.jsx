// Adapted by LifeOS: localized UI, touch controls, gameplay fixes. Apache-2.0.
// Upstream: https://github.com/hajunho/zeli-web-games @ ba9938eb222cb588ae7b0a6056ba6bdda89dcd9c
import { gameText } from './text';
/**
 * 🎮 Game 81: 타워 디펜스 — 레인 비주얼 + 타워 범위 + HP바
 */
import { useCallback, useEffect, useRef, useState } from "react";

const LANES = 3;
const COLS = 8;
const WAVE_SIZE = 5;
const MAX_WAVES = 3;

const TowerDefense = ({ onComplete }) => {
    const [towers, setTowers] = useState(Array(LANES).fill(false));
    const [enemies, setEnemies] = useState([]);
    const [hp, setHp] = useState(10);
    const [kills, setKills] = useState(0);
    const [gold, setGold] = useState(3);
    const [wave, setWave] = useState(1);
    const hpRef = useRef(10);
    const killsRef = useRef(0);
    const goldRef = useRef(3);
    const towersRef=useRef(towers);towersRef.current=towers;

    const placeTower = useCallback((lane) => {
        if (towers[lane]) {
            setTowers((t) => { const n = [...t]; n[lane] = false; return n; });
            goldRef.current++;
            setGold(goldRef.current);
        } else if (goldRef.current > 0) {
            setTowers((t) => { const n = [...t]; n[lane] = true; return n; });
            goldRef.current--;
            setGold(goldRef.current);
        }
    }, [towers]);

    useEffect(() => {
        let spawned = 0;
        const spawn = setInterval(() => {
            if (spawned >= WAVE_SIZE * MAX_WAVES) { clearInterval(spawn); return; }
            setEnemies((e) => [...e, {
                id: Date.now() + Math.random(),
                lane: Math.floor(Math.random() * LANES),
                pos: 0,
                hp: 2,
                maxHp: 2,
            }]);
            spawned++;
        }, 1000);

        const move = setInterval(() => {
            setEnemies((e) => {
                return e.map((en) => ({ ...en, pos: en.pos + 1 })).filter((en) => {
                    if (en.pos >= 5 && towersRef.current[en.lane] && en.hp > 0) {
                        en.hp--;
                        if (en.hp <= 0) {
                            killsRef.current++;
                            setKills(killsRef.current);
                            goldRef.current += 0.5;
                            setGold(Math.floor(goldRef.current));
                            return false;
                        }
                    }
                    if (en.pos >= COLS) {
                        hpRef.current--;
                        setHp(hpRef.current);
                        return false;
                    }
                    return true;
                });
            });

            if (hpRef.current <= 0) {
                clearInterval(spawn);
                clearInterval(move);
                onComplete(Math.min(100, killsRef.current * 7));
            }
            if (killsRef.current >= WAVE_SIZE * MAX_WAVES) {
                clearInterval(spawn);
                clearInterval(move);
                onComplete(100);
            }
        }, 500);

        return () => { clearInterval(spawn); clearInterval(move); };
    }, [onComplete]);

    return (
        <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "8px", color: "white" }}>
            <style>{`@keyframes enemyWalk { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-2px); } }`}</style>

            <div style={{ display: "flex", gap: "14px", fontSize: "12px" }}>
                <span>❤️ <span style={{ color: hp > 5 ? "#64ffda" : "#FF6B6B" }}>{hp}</span></span>
                <span>💀 <span style={{ color: "#FFD700" }}>{kills}/{WAVE_SIZE * MAX_WAVES}</span></span>
                <span>💰 {gold}</span>
            </div>

            {/* Lanes */}
            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                {[0, 1, 2].map((lane) => (
                    <div key={lane} style={{ display: "flex", gap: "2px", alignItems: "center" }}>
                        {Array.from({ length: COLS }).map((_, col) => {
                            const enemy = enemies.find((e) => e.lane === lane && Math.floor(e.pos) === col);
                            const isTower = col === 5 && towers[lane];
                            const isBase = col === COLS - 1;
                            const inRange = towers[lane] && col >= 4 && col <= 6;

                            return (
                                <div key={col} style={{
                                    width: 30, height: 34, borderRadius: "4px",
                                    display: "flex", flexDirection: "column",
                                    alignItems: "center", justifyContent: "center",
                                    fontSize: enemy ? "14px" : "16px",
                                    background: isTower ? "rgba(100,255,218,0.15)"
                                        : isBase ? "rgba(239,68,68,0.12)"
                                            : inRange ? "rgba(100,255,218,0.04)"
                                                : col % 2 === 0 ? "rgba(255,255,255,0.02)" : "rgba(255,255,255,0.04)",
                                    border: isTower ? "2px solid #64ffda"
                                        : isBase ? "1px solid rgba(239,68,68,0.3)"
                                            : "1px solid rgba(255,255,255,0.05)",
                                }}>
                                    {enemy && (
                                        <div style={{ animation: "enemyWalk 0.5s ease infinite" }}>
                                            <div style={{ fontSize: "14px" }}>👾</div>
                                            <div style={{ width: 20, height: 3, background: "rgba(255,255,255,0.15)", borderRadius: 2, overflow: "hidden" }}>
                                                <div style={{
                                                    width: `${(enemy.hp / enemy.maxHp) * 100}%`, height: "100%",
                                                    background: enemy.hp > 1 ? "#64ffda" : "#EF4444",
                                                }} />
                                            </div>
                                        </div>
                                    )}
                                    {isTower && !enemy && "🗼"}
                                    {isBase && !enemy && "🏠"}
                                </div>
                            );
                        })}
                        <button onClick={() => placeTower(lane)} style={{
                            width: 30, height: 30, fontSize: "12px",
                            background: towers[lane] ? "rgba(255,107,107,0.15)" : gold > 0 ? "rgba(255,215,0,0.15)" : "rgba(100,100,100,0.1)",
                            border: towers[lane] ? "1px solid #FF6B6B" : gold > 0 ? "1px solid #FFD700" : "1px solid #444",
                            borderRadius: "6px", cursor: "pointer", color: "white",
                        }}>{towers[lane] ? "❌" : "🗼"}</button>
                    </div>
                ))}
            </div>

            <div style={{ fontSize: "10px", color: "#8892b0" }}>{gameText("🗼 = 💰 1")}</div>
        </div>
    );
};

export default TowerDefense;
