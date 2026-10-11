// Adapted by LifeOS: localized UI, touch controls, gameplay fixes. Apache-2.0.
// Upstream: https://github.com/hajunho/zeli-web-games @ ba9938eb222cb588ae7b0a6056ba6bdda89dcd9c
import { gameText } from './text';
/**
 * 🎮 Game 101: 하노이 탑
 * 원반을 규칙에 맞게 옮기기 — 최소 이동수 달성 시 퍼펙트
 */
import { useState, useCallback } from "react";

const DISC_COLORS = [
    ["#FF6B6B", "#e55555"], ["#FFD93D", "#e6c030"], ["#6BCB77", "#55b562"],
    ["#4D96FF", "#3a7de6"], ["#9B59B6", "#854aad"], ["#FF8C42", "#e67a35"], ["#38B6FF", "#2a9ae6"]
];

const HanoiTower = ({ onComplete }) => {
    const [discCount] = useState(() => 3 + Math.floor(Math.random() * 3));
    const minMoves = Math.pow(2, discCount) - 1;
    const [pegs, setPegs] = useState(() => {
        const initial = [[], [], []];
        for (let i = discCount; i >= 1; i--) initial[0].push(i);
        return initial;
    });
    const [moves, setMoves] = useState(0);
    const [selected, setSelected] = useState(null);
    const [done, setDone] = useState(false);

    const handlePegClick = useCallback((pegIdx) => {
        if (done) return;
        if (selected === null) {
            if (pegs[pegIdx].length > 0) setSelected(pegIdx);
        } else {
            if (selected === pegIdx) { setSelected(null); return; }
            const fromPeg = pegs[selected];
            const toPeg = pegs[pegIdx];
            const disc = fromPeg[fromPeg.length - 1];
            if (toPeg.length > 0 && toPeg[toPeg.length - 1] < disc) {
                setSelected(null);
                return;
            }
            const newPegs = pegs.map(p => [...p]);
            newPegs[selected].pop();
            newPegs[pegIdx].push(disc);
            const newMoves = moves + 1;
            setPegs(newPegs);
            setMoves(newMoves);
            setSelected(null);
            if (newPegs[2].length === discCount) {
                setDone(true);
                const perfect = newMoves <= minMoves;
                const score = perfect ? 100 : Math.max(30, 100 - (newMoves - minMoves) * 5);
                setTimeout(() => onComplete(Math.min(100, score)), 500);
            }
        }
    }, [selected, pegs, moves, discCount, minMoves, done, onComplete]);

    const maxWidth = 80;
    const progress = pegs[2].length / discCount * 100;

    return (
        <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "16px", color: "white" }}>
            <style>{`
                @keyframes discDrop { from{transform:translateY(-8px);opacity:0.7} to{transform:translateY(0);opacity:1} }
                @keyframes perfectPulse { 0%,100%{text-shadow:0 0 10px #64ffda} 50%{text-shadow:0 0 30px #64ffda,0 0 40px #64ffda} }
            `}</style>
            <div style={{ display: "flex", gap: "16px", fontSize: "13px", alignItems: "center" }}>
                <span>{gameText("Hamle:")}<span style={{ color: moves <= minMoves ? "#64ffda" : "#FFD700", fontWeight: "bold" }}>{moves}</span></span>
                <span>{gameText("🎯")}<span style={{ color: "#8892b0" }}>{minMoves}</span></span>
                <span>{gameText("🗼")}<span style={{ color: "#FF6B6B", fontWeight: "bold" }}>{discCount}{gameText("")}</span></span>
            </div>
            {/* Progress bar */}
            <div style={{ width: "260px", height: "4px", background: "rgba(255,255,255,0.08)", borderRadius: "2px" }}>
                <div style={{ height: "100%", borderRadius: "2px", width: `${progress}%`, background: "linear-gradient(90deg, #FFD93D, #64ffda)", transition: "width 0.4s ease" }} />
            </div>
            <div style={{ display: "flex", gap: "16px", alignItems: "flex-end" }}>
                {pegs.map((peg, pi) => (
                    <div
                        key={pi}
                        onClick={() => handlePegClick(pi)}
                        style={{
                            cursor: "pointer",
                            display: "flex",
                            flexDirection: "column-reverse",
                            alignItems: "center",
                            width: maxWidth + 20,
                            minHeight: (discCount + 1) * 28 + 20,
                            background: selected === pi
                                ? "linear-gradient(180deg, rgba(100,255,218,0.08), rgba(100,255,218,0.02))"
                                : "rgba(255,255,255,0.02)",
                            border: selected === pi ? "2px solid rgba(100,255,218,0.4)" : "2px solid rgba(255,255,255,0.06)",
                            borderRadius: "14px",
                            padding: "8px 4px",
                            position: "relative",
                            transition: "all 0.25s ease",
                            boxShadow: selected === pi ? "0 4px 20px rgba(100,255,218,0.1)" : "0 2px 8px rgba(0,0,0,0.1)",
                        }}
                    >
                        <div style={{
                            width: "4px", height: (discCount + 1) * 28,
                            background: "linear-gradient(180deg, rgba(255,255,255,0.15), rgba(255,255,255,0.05))",
                            borderRadius: "2px",
                            position: "absolute", bottom: 36, zIndex: 0,
                        }} />
                        <div style={{
                            width: maxWidth + 10, height: "6px",
                            background: "linear-gradient(90deg, rgba(255,255,255,0.08), rgba(255,255,255,0.15), rgba(255,255,255,0.08))",
                            borderRadius: "3px",
                        }} />
                        {peg.map((disc, di) => {
                            const w = 40 + (disc / discCount) * (maxWidth - 40);
                            const [c1, c2] = DISC_COLORS[disc - 1];
                            return (
                                <div key={di} style={{
                                    width: w, height: "24px", borderRadius: "12px",
                                    background: `linear-gradient(135deg, ${c1}, ${c2})`,
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                    fontSize: "12px", fontWeight: "bold", color: "white",
                                    zIndex: 1, marginTop: "2px",
                                    boxShadow: `0 2px 8px ${c1}44`,
                                    animation: "discDrop 0.25s ease",
                                }}>
                                    {disc}
                                </div>
                            );
                        })}
                        <div style={{ fontSize: "11px", color: selected === pi ? "#64ffda" : "#8892b0", marginTop: "4px", fontWeight: "bold" }}>
                            {["A", "B", "C"][pi]}
                        </div>
                    </div>
                ))}
            </div>
            <div style={{ fontSize: "12px", color: "#8892b0" }}>
                {gameText("→ C")}</div>
            {done && (
                <div style={{
                    fontSize: "18px", fontWeight: "bold",
                    color: "#64ffda",
                    animation: moves <= minMoves ? "perfectPulse 1.5s infinite" : "none",
                    textShadow: "0 0 15px rgba(100,255,218,0.3)",
                }}>
                    🎉 {moves <= minMoves ? gameText("Harika!") : gameText(`Tamamlandı${moves}`)}
                </div>
            )}
        </div>
    );
};

export default HanoiTower;
