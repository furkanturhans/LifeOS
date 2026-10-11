// Adapted by LifeOS: localized UI, touch controls, gameplay fixes. Apache-2.0.
// Upstream: https://github.com/hajunho/zeli-web-games @ ba9938eb222cb588ae7b0a6056ba6bdda89dcd9c
import { gameText } from './text';
/**
 * 🎮 Game 25: 커넥트 포 — 7×6 보드 + 드롭 애니메이션
 */
import { useCallback, useRef, useState } from "react";

const ROWS = 6, COLS = 7;

const ConnectFour = ({ onComplete }) => {
    const [board, setBoard] = useState(() => Array.from({ length: ROWS }, () => Array(COLS).fill(null)));
    const [turn, setTurn] = useState("🔴");
    const [winner, setWinner] = useState(null);
    const [winCells, setWinCells] = useState([]);
    const [lastDrop, setLastDrop] = useState(null);
    const locked=useRef(false);

    const checkWin = useCallback((b, p) => {
        const dirs = [[0, 1], [1, 0], [1, 1], [1, -1]];
        for (let r = 0; r < ROWS; r++)
            for (let c = 0; c < COLS; c++) {
                if (b[r][c] !== p) continue;
                for (const [dr, dc] of dirs) {
                    const cells = [];
                    for (let i = 0; i < 4; i++) {
                        const nr = r + dr * i, nc = c + dc * i;
                        if (nr < 0 || nr >= ROWS || nc < 0 || nc >= COLS || b[nr][nc] !== p) break;
                        cells.push(`${nr},${nc}`);
                    }
                    if (cells.length >= 4) return cells;
                }
            }
        return null;
    }, []);

    const drop = useCallback((col) => {
        if (winner || turn !== "🔴" || locked.current) return;
        const newBoard = board.map((r) => [...r]);
        let row = -1;
        for (let r = ROWS - 1; r >= 0; r--) { if (!newBoard[r][col]) { row = r; break; } }
        if (row < 0) return;

        locked.current=true;
        newBoard[row][col] = turn;
        setBoard(newBoard);
        setLastDrop(`${row},${col}`);

        const win = checkWin(newBoard, turn);
        if (win) {
            setWinner(turn);
            setWinCells(win);
            setTimeout(() => onComplete(turn === "🔴" ? 100 : 30), 500);
        } else {
            if(newBoard[0].every(Boolean)){setWinner("🤝");setTimeout(()=>onComplete(50),500);return;}
            // AI turn
            const next = turn === "🔴" ? "🟡" : "🔴";
            setTurn(next);
            if (next === "🟡") {
                setTimeout(() => {
                    const nb = newBoard.map((r) => [...r]);
                    // Simple AI
                    let bestCol = -1;
                    for (let c = 0; c < COLS; c++) {
                        for (let r = ROWS - 1; r >= 0; r--) {
                            if (!nb[r][c]) { nb[r][c] = "🟡"; if (checkWin(nb, "🟡")) bestCol = c; nb[r][c] = null; break; }
                        }
                    }
                    if (bestCol < 0) {
                        for (let c = 0; c < COLS; c++) {
                            for (let r = ROWS - 1; r >= 0; r--) {
                                if (!nb[r][c]) { nb[r][c] = "🔴"; if (checkWin(nb, "🔴")) bestCol = c; nb[r][c] = null; break; }
                            }
                        }
                    }
                    if(bestCol<0){const free=nb[0].map((v,c)=>v===null ? c : -1).filter(c=>c>=0);if(!free.length){setWinner("🤝");setTimeout(()=>onComplete(50),500);return;}bestCol=free[Math.floor(Math.random()*free.length)];}

                    for (let r = ROWS - 1; r >= 0; r--) {
                        if (!nb[r][bestCol]) {
                            nb[r][bestCol] = "🟡";
                            setBoard(nb);
                            setLastDrop(`${r},${bestCol}`);
                            const aiWin = checkWin(nb, "🟡");
                            if (aiWin) { setWinner("🟡"); setWinCells(aiWin); setTimeout(() => onComplete(30), 500); }
                            break;
                        }
                    }
                    if(nb[0].every(Boolean)&&!checkWin(nb,"🟡")){setWinner("🤝");setTimeout(()=>onComplete(50),500);}
                    locked.current=false;setTurn("🔴");
                }, 400);
            }
        }
    }, [board, turn, winner, checkWin, onComplete]);

    return (
        <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "8px", color: "white" }}>
            <style>{`
                @keyframes dropIn { 0% { transform: translateY(-120px); } 100% { transform: translateY(0); } }
                @keyframes winGlow { 0%,100% { box-shadow: 0 0 6px rgba(255,215,0,0.3); } 50% { box-shadow: 0 0 16px rgba(255,215,0,0.8); } }
            `}</style>

            <div style={{ fontSize: "13px" }}>
                {winner ? gameText(`${winner}Kazandın!`) : gameText(`${turn}`)} {gameText("| 🔴 = 👤 / 🟡 = 🤖")}</div>

            {/* Board */}
            <div style={{
                display: "grid", gridTemplateColumns: `repeat(${COLS}, 1fr)`, gap: "3px",
                padding: "8px", borderRadius: "14px",
                background: "linear-gradient(135deg, rgba(59,130,246,0.3), rgba(59,130,246,0.15))",
                border: "3px solid rgba(59,130,246,0.4)",
            }}>
                {board.flat().map((cell, i) => {
                    const r = Math.floor(i / COLS), c = i % COLS;
                    const key = `${r},${c}`;
                    const isWin = winCells.includes(key);
                    const isLast = lastDrop === key;
                    return (
                        <div key={i} role="button" tabIndex={0} aria-label={`${r+1},${c+1}`} onKeyDown={e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();if(!cell)drop(c);}}} onClick={() => !cell && drop(c)}
                            style={{
                                width: 34, height: 34, borderRadius: "50%",
                                display: "flex", alignItems: "center", justifyContent: "center",
                                fontSize: "20px",
                                background: cell ? "rgba(0,0,0,0.2)" : "rgba(255,255,255,0.08)",
                                cursor: cell || winner ? "default" : "pointer",
                                animation: isLast && cell ? "dropIn 0.3s ease" : isWin ? "winGlow 1s ease infinite" : "none",
                                border: isWin ? "2px solid #FFD700" : "1px solid rgba(0,0,0,0.1)",
                                transition: "all 0.15s ease",
                            }}
                            onMouseEnter={(e) => { if (!cell && !winner) e.currentTarget.style.background = "rgba(255,215,0,0.1)"; }}
                            onMouseLeave={(e) => { if (!cell) e.currentTarget.style.background = "rgba(255,255,255,0.08)"; }}
                        >{cell || ""}</div>
                    );
                })}
            </div>
        </div>
    );
};

export default ConnectFour;
