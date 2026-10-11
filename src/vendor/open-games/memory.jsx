// Adapted by LifeOS: localized UI, touch controls, gameplay fixes. Apache-2.0.
// Upstream: https://github.com/hajunho/zeli-web-games @ ba9938eb222cb588ae7b0a6056ba6bdda89dcd9c
import { gameText } from './text';
/**
 * 🎮 Game 21: 메모리 매치 — 카드 플립 3D + 매칭 파티클
 */
import { useCallback, useState } from "react";

const EMOJIS = ["🐶", "🐱", "🐰", "🦊", "🐻", "🐼", "🐸", "🐨"];

const genCards = () => {
    const pairs = EMOJIS.slice(0, 6);
    const cards = [...pairs, ...pairs].map((emoji, i) => ({ id: i, emoji, flipped: false, matched: false }));
    return cards.sort(() => Math.random() - 0.5);
};

const MemoryMatch = ({ onComplete }) => {
    const [cards, setCards] = useState(genCards);
    const [flipped, setFlipped] = useState([]);
    const [moves, setMoves] = useState(0);
    const [matches, setMatches] = useState(0);
    const [locked, setLocked] = useState(false);

    const handleFlip = useCallback((idx) => {
        if (locked || cards[idx].flipped || cards[idx].matched) return;

        const newCards = [...cards];
        newCards[idx].flipped = true;
        setCards(newCards);

        const newFlipped = [...flipped, idx];
        setFlipped(newFlipped);

        if (newFlipped.length === 2) {
            setMoves((m) => m + 1);
            setLocked(true);

            if (newCards[newFlipped[0]].emoji === newCards[newFlipped[1]].emoji) {
                newCards[newFlipped[0]].matched = true;
                newCards[newFlipped[1]].matched = true;
                setCards(newCards);
                const nm = matches + 1;
                setMatches(nm);
                setFlipped([]);
                setLocked(false);
                if (nm >= 6) setTimeout(() => onComplete(Math.max(30, 100 - moves * 5)), 500);
            } else {
                setTimeout(() => {
                    const reset = [...newCards];
                    reset[newFlipped[0]].flipped = false;
                    reset[newFlipped[1]].flipped = false;
                    setCards(reset);
                    setFlipped([]);
                    setLocked(false);
                }, 800);
            }
        }
    }, [cards, flipped, locked, moves, matches, onComplete]);

    return (
        <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "10px", color: "white" }}>
            <style>{`
                @keyframes cardFlip3d { 0% { transform: perspective(400px) rotateY(0); } 50% { transform: perspective(400px) rotateY(90deg); } 100% { transform: perspective(400px) rotateY(0); } }
                @keyframes matchGlow { 0%,100% { box-shadow: 0 0 8px rgba(100,255,218,0.3); } 50% { box-shadow: 0 0 18px rgba(100,255,218,0.6); } }
                @keyframes matchPop { 0% { transform: scale(1.3); } 100% { transform: scale(1); } }
            `}</style>

            <div style={{ display: "flex", gap: "16px", fontSize: "12px" }}>
                <span>{gameText("Hamle:")}<span style={{ color: "#FFD700" }}>{moves}</span></span>
                <span>{gameText("✓")}<span style={{ color: "#64ffda" }}>{matches}/6</span></span>
            </div>

            {/* Progress */}
            <div style={{ width: 220, height: 6, borderRadius: 3, background: "rgba(255,255,255,0.1)", overflow: "hidden" }}>
                <div style={{ width: `${(matches / 6) * 100}%`, height: "100%", background: "#64ffda", borderRadius: 3, transition: "width 0.3s ease" }} />
            </div>

            {/* Card grid */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "6px" }}>
                {cards.map((card, idx) => (
                    <div key={card.id} onClick={() => handleFlip(idx)}
                        style={{
                            width: 52, height: 58, borderRadius: "10px",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontSize: card.flipped || card.matched ? "26px" : "18px",
                            cursor: card.flipped || card.matched || locked ? "default" : "pointer",
                            background: card.matched ? "rgba(100,255,218,0.15)"
                                : card.flipped ? "rgba(255,255,255,0.08)"
                                    : "linear-gradient(135deg, rgba(124,58,237,0.2), rgba(124,58,237,0.08))",
                            border: card.matched ? "2px solid rgba(100,255,218,0.4)"
                                : card.flipped ? "2px solid rgba(255,215,0,0.4)"
                                    : "2px solid rgba(124,58,237,0.3)",
                            animation: card.matched ? "matchGlow 1.5s ease infinite, matchPop 0.3s ease"
                                : card.flipped ? "cardFlip3d 0.4s ease" : "none",
                            boxShadow: card.matched ? "0 4px 15px rgba(100,255,218,0.15)" : "0 3px 10px rgba(0,0,0,0.2)",
                            transition: "all 0.2s ease",
                        }}
                        onMouseEnter={(e) => { if (!card.flipped && !card.matched && !locked) { e.currentTarget.style.transform = "scale(1.05)"; e.currentTarget.style.borderColor = "#FFD700"; } }}
                        onMouseLeave={(e) => { if (!card.flipped && !card.matched) { e.currentTarget.style.transform = "scale(1)"; e.currentTarget.style.borderColor = "rgba(124,58,237,0.3)"; } }}
                    >
                        {card.flipped || card.matched ? card.emoji : "❓"}
                    </div>
                ))}
            </div>

            {matches >= 6 && (
                <div style={{ fontSize: "16px", fontWeight: "bold", color: "#64ffda" }}>
                    {gameText("Kazandın! (")}{moves}{gameText(")")}</div>
            )}
        </div>
    );
};

export default MemoryMatch;
