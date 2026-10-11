// Adapted by LifeOS: localized UI, touch controls, gameplay fixes. Apache-2.0.
// Upstream: https://github.com/hajunho/zeli-web-games @ ba9938eb222cb588ae7b0a6056ba6bdda89dcd9c
import { gameText } from './text';
/**
 * 🎮 Game 10: 매치3
 * 같은 색 보석을 3개 이상 연결하세요!
 * 인접한 두 보석을 스와프하여 가로/세로 3연속을 만들면 터짐
 */
import { useCallback, useEffect, useRef, useState } from "react";

const ROWS = 6;
const COLS = 6;
const GEMS = ["🔴", "🟢", "🔵", "🟡", "🟣"];

const randomGem = () => GEMS[Math.floor(Math.random() * GEMS.length)];

const createBoard = () => {
    let board;
    do {
        board = Array.from({ length: ROWS }, () =>
            Array.from({ length: COLS }, () => randomGem())
        );
    } while (findMatches(board).length > 0);
    return board;
};

const findMatches = (board) => {
    const matched = new Set();
    // Horizontal
    for (let r = 0; r < ROWS; r++)
        for (let c = 0; c < COLS - 2; c++)
            if (board[r][c] && board[r][c] === board[r][c + 1] && board[r][c] === board[r][c + 2])
                [c, c + 1, c + 2].forEach((cc) => matched.add(`${r}-${cc}`));
    // Vertical
    for (let c = 0; c < COLS; c++)
        for (let r = 0; r < ROWS - 2; r++)
            if (board[r][c] && board[r][c] === board[r + 1][c] && board[r][c] === board[r + 2][c])
                [r, r + 1, r + 2].forEach((rr) => matched.add(`${rr}-${c}`));
    return [...matched];
};

const removeAndFill = (board, matches) => {
    const newBoard = board.map((r) => [...r]);
    const cleared = new Set(matches);
    // Mark as null
    cleared.forEach((key) => {
        const [r, c] = key.split("-").map(Number);
        newBoard[r][c] = null;
    });
    // Gravity: drop cells down
    for (let c = 0; c < COLS; c++) {
        const col = [];
        for (let r = ROWS - 1; r >= 0; r--)
            if (newBoard[r][c] !== null) col.push(newBoard[r][c]);
        for (let r = ROWS - 1; r >= 0; r--)
            newBoard[r][c] = col.length > 0 ? col.shift() : randomGem();
    }
    return newBoard;
};

const hasValidMoves = (board) => {
    for (let r = 0; r < ROWS; r++)
        for (let c = 0; c < COLS; c++) {
            // Try swap right
            if (c < COLS - 1) {
                const b = board.map((row) => [...row]);
                [b[r][c], b[r][c + 1]] = [b[r][c + 1], b[r][c]];
                if (findMatches(b).length > 0) return true;
            }
            // Try swap down
            if (r < ROWS - 1) {
                const b = board.map((row) => [...row]);
                [b[r][c], b[r + 1][c]] = [b[r + 1][c], b[r][c]];
                if (findMatches(b).length > 0) return true;
            }
        }
    return false;
};

const Match3 = ({ onComplete }) => {
    const [board, setBoard] = useState(createBoard);
    const [selected, setSelected] = useState(null);
    const [totalCleared, setTotalCleared] = useState(0);
    const [movesLeft, setMovesLeft] = useState(20);
    const processingRef = useRef(false);
    const completedRef = useRef(false);

    const processMatches = useCallback(
        (b, clearedAcc, remainingMoves) => {
            const matches = findMatches(b);
            if (matches.length === 0) {
                setBoard(b);
                const totalC = clearedAcc;
                setTotalCleared(totalC);

                if ((remainingMoves <= 0 || !hasValidMoves(b)) && !completedRef.current) {
                    completedRef.current = true;
                    const score = Math.min(100, Math.round(totalC / 36 * 100));
                    setTimeout(() => onComplete(score), 400);
                }
                processingRef.current = false;
                return;
            }

            const newBoard = removeAndFill(b, matches);
            setBoard(newBoard);
            const newCleared = clearedAcc + matches.length;
            setTotalCleared(newCleared);

            // Chain reaction
            setTimeout(() => processMatches(newBoard, newCleared, remainingMoves), 300);
        },
        [onComplete]
    );

    const handleClick = useCallback(
        (r, c) => {
            if (processingRef.current || movesLeft <= 0) return;

            if (!selected) {
                setSelected({ r, c });
                return;
            }

            const dist = Math.abs(selected.r - r) + Math.abs(selected.c - c);
            if (dist !== 1) {
                setSelected({ r, c });
                return;
            }

            // Swap
            const newBoard = board.map((row) => [...row]);
            [newBoard[selected.r][selected.c], newBoard[r][c]] = [newBoard[r][c], newBoard[selected.r][selected.c]];

            const matches = findMatches(newBoard);
            if (matches.length === 0) {
                // Invalid swap → revert
                setSelected(null);
                return;
            }

            processingRef.current = true;
            setSelected(null);
            const newMovesLeft = movesLeft - 1;
            setMovesLeft(newMovesLeft);
            processMatches(newBoard, totalCleared, newMovesLeft);
        },
        [selected, board, movesLeft, totalCleared, processMatches]
    );

    // End game when no moves left
    useEffect(() => {
        if (movesLeft <= 0 && !processingRef.current && !completedRef.current) {
            completedRef.current = true;
            const score = Math.min(100, Math.round(totalCleared / 36 * 100));
            setTimeout(() => onComplete(score), 600);
        }
    }, [movesLeft, totalCleared, onComplete]);

    const cellSize = 44;

    return (
        <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "12px", color: "white" }}>
            <div style={{ display: "flex", gap: "20px", fontSize: "13px" }}>
                <span>{gameText("Hamle:")}<span style={{ color: movesLeft <= 5 ? "#FF6B6B" : "#FFD700", fontWeight: "bold" }}>{movesLeft}</span></span>
                <span>{gameText("Puan:")}<span style={{ color: "#64ffda", fontWeight: "bold" }}>{totalCleared}</span></span>
            </div>
            {/* Moves bar */}
            <div style={{ width: COLS * (cellSize + 3) + 12, height: 5, borderRadius: 3, background: "rgba(255,255,255,0.08)", overflow: "hidden" }}>
                <div style={{ width: `${(movesLeft / 20) * 100}%`, height: "100%", background: movesLeft <= 5 ? "#FF6B6B" : "#FFD700", borderRadius: 3, transition: "width 0.3s" }} />
            </div>
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: `repeat(${COLS}, ${cellSize}px)`,
                    gap: "3px",
                    padding: "6px",
                    background: "#1a1a2e",
                    borderRadius: "8px",
                    border: "2px solid rgba(255,255,255,0.06)",
                }}
            >
                {board.flat().map((gem, idx) => {
                    const r = Math.floor(idx / COLS), c = idx % COLS;
                    const isSel = selected && selected.r === r && selected.c === c;
                    return (
                        <div
                            key={idx}
                            onClick={() => handleClick(r, c)}
                            style={{
                                width: cellSize,
                                height: cellSize,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: "24px",
                                borderRadius: "6px",
                                cursor: "pointer",
                                background: isSel ? "rgba(255,215,0,0.25)" : "rgba(255,255,255,0.05)",
                                border: isSel ? "2px solid #FFD700" : "2px solid transparent",
                                transition: "all 0.15s",
                                userSelect: "none",
                            }}
                        >
                            {gem}
                        </div>
                    );
                })}
            </div>
            <div style={{ fontSize: "12px", color: "#8892b0" }}>
                {gameText("")}</div>
        </div>
    );
};

export default Match3;
