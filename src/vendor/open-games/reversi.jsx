// Adapted by LifeOS: localized UI, touch controls, gameplay fixes. Apache-2.0.
// Upstream: https://github.com/hajunho/zeli-web-games @ ba9938eb222cb588ae7b0a6056ba6bdda89dcd9c
import { gameText } from './text';
/**
 * 🎮 Game 27: 오셀로 (6×6)
 * AI와 대결! 돌을 뒤집어 더 많은 칸을 차지하세요.
 */
import { useCallback, useState } from "react";

const SIZE = 6;
const EMPTY = 0, BLACK = 1, WHITE = 2;
const DIRS = [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]];

const initBoard = () => {
    const b = Array.from({ length: SIZE }, () => Array(SIZE).fill(EMPTY));
    const m = SIZE / 2;
    b[m - 1][m - 1] = WHITE; b[m - 1][m] = BLACK;
    b[m][m - 1] = BLACK; b[m][m] = WHITE;
    return b;
};

const getFlips = (board, r, c, player) => {
    if (board[r][c] !== EMPTY) return [];
    const opp = player === BLACK ? WHITE : BLACK;
    const allFlips = [];
    for (const [dr, dc] of DIRS) {
        const flips = [];
        let nr = r + dr, nc = c + dc;
        while (nr >= 0 && nr < SIZE && nc >= 0 && nc < SIZE && board[nr][nc] === opp) {
            flips.push([nr, nc]);
            nr += dr; nc += dc;
        }
        if (flips.length > 0 && nr >= 0 && nr < SIZE && nc >= 0 && nc < SIZE && board[nr][nc] === player) {
            allFlips.push(...flips);
        }
    }
    return allFlips;
};

const getValidMoves = (board, player) => {
    const moves = [];
    for (let r = 0; r < SIZE; r++)
        for (let c = 0; c < SIZE; c++)
            if (getFlips(board, r, c, player).length > 0) moves.push([r, c]);
    return moves;
};

const Othello = ({ onComplete }) => {
    const [board, setBoard] = useState(initBoard);
    const [turn, setTurn] = useState(BLACK);
    const [gameOver, setGameOver] = useState(false);
    const [message, setMessage] = useState("");

    const aiMove = useCallback((b) => {
        const moves = getValidMoves(b, WHITE);
        if (moves.length === 0) return null;
        // Simple AI: pick move that flips most
        let best = moves[0], bestCount = 0;
        for (const [r, c] of moves) {
            const fl = getFlips(b, r, c, WHITE).length;
            if (fl > bestCount) { bestCount = fl; best = [r, c]; }
        }
        return best;
    }, []);

    const makeMove = useCallback((r, c, player, b) => {
        const flips = getFlips(b, r, c, player);
        if (flips.length === 0) return null;
        const nb = b.map((row) => [...row]);
        nb[r][c] = player;
        for (const [fr, fc] of flips) nb[fr][fc] = player;
        return nb;
    }, []);

    const checkEnd = useCallback((b) => {
        if (getValidMoves(b, BLACK).length === 0 && getValidMoves(b, WHITE).length === 0) return true;
        return b.every((row) => row.every((c) => c !== EMPTY));
    }, []);

    const handleClick = useCallback(
        (r, c) => {
            if (gameOver || turn !== BLACK) return;
            const nb = makeMove(r, c, BLACK, board);
            if (!nb) return;

            if (checkEnd(nb)) { finishGame(nb); return; }

            // Repeated AI turns are required when the player must pass.
            let current=nb;
            while(getValidMoves(current,WHITE).length){
                const move=aiMove(current);
                current=makeMove(move[0],move[1],WHITE,current);
                if(checkEnd(current)){finishGame(current);return;}
                if(getValidMoves(current,BLACK).length)break;
            }
            setBoard(current);setTurn(BLACK);setMessage("");
        },
        [board, turn, gameOver, makeMove, aiMove, checkEnd]
    );

    const finishGame = (b) => {
        let black = 0, white = 0;
        for (const row of b) for (const c of row) { if (c === BLACK) black++; if (c === WHITE) white++; }
        setGameOver(true);
        setBoard(b);
        const won = black > white;
        setMessage(won ? gameText(`Kazandın! (${black}:${white})`) : black === white ? gameText("Berabere") : gameText(`Oyun Bitti (${black}:${white})`));
        const score = won ? Math.min(100, 50 + (black - white) * 5) : Math.max(20, 50 - (white - black) * 3);
        setTimeout(() => onComplete(score), 1000);
    };

    const validMoves = turn === BLACK ? getValidMoves(board, BLACK) : [];
    let bCount = 0, wCount = 0;
    for (const row of board) for (const c of row) { if (c === BLACK) bCount++; if (c === WHITE) wCount++; }

    return (
        <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "12px", color: "white" }}>
            <div style={{ fontSize: "13px" }}>
                ⚫ {bCount} — ⚪ {wCount}
            </div>
            <div style={{
                display: "grid", gridTemplateColumns: `repeat(${SIZE}, 48px)`,
                background: "#2d6a4f", padding: "4px", borderRadius: "8px", gap: "2px",
                border: gameOver ? "3px solid #FFD700" : "2px solid #1a5035",
            }}>
                {board.map((row, r) =>
                    row.map((cell, c) => {
                        const isValid = validMoves.some(([vr, vc]) => vr === r && vc === c);
                        return (
                            <div key={`${r}-${c}`} onClick={() => handleClick(r, c)} style={{
                                width: 48, height: 48, borderRadius: "4px",
                                background: isValid ? "#3d8a6f" : "#2d6a4f",
                                display: "flex", alignItems: "center", justifyContent: "center",
                                cursor: isValid ? "pointer" : "default",
                                border: "1px solid #1a5035",
                            }}>
                                {cell !== EMPTY && (
                                    <div style={{
                                        width: 36, height: 36, borderRadius: "50%",
                                        background: cell === BLACK ? "radial-gradient(circle at 35% 35%, #555, #111)" : "radial-gradient(circle at 35% 35%, #fff, #ccc)",
                                        boxShadow: "0 2px 4px rgba(0,0,0,0.4)",
                                        transition: "all 0.3s",
                                    }} />
                                )}
                                {isValid && cell === EMPTY && (
                                    <div style={{ width: 12, height: 12, borderRadius: "50%", background: "rgba(255,255,255,0.2)" }} />
                                )}
                            </div>
                        );
                    })
                )}
            </div>
            {message && <div style={{ fontSize: "16px", fontWeight: "bold" }}>{message}</div>}
            <div style={{ fontSize: "11px", color: "#8892b0" }}>
                {gameOver ? "" : gameText("👤 = ⚫")}
            </div>
        </div>
    );
};

export default Othello;
