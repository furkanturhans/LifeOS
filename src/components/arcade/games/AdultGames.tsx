'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Trophy,
  Volume2,
  ChevronRight,
  Flame,
  ShieldAlert,
  ArrowRight,
  Eye,
  Dice5,
  Dices,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { GameShell, type Difficulty } from '../engine/GameShell';
import { useArcadeStore } from '@/stores/useArcadeStore';
import { cn } from '@/lib/utils';

// ==========================================
// 1. TAVLA (BACKGAMMON) GAME
// ==========================================
export function TavlaGame({ onBack }: { onBack: () => void }) {
  const { recordGameSession } = useArcadeStore();
  const [dice, setDice] = useState<[number, number]>([5, 3]);
  const [isRolling, setIsRolling] = useState(false);
  const [turn, setTurn] = useState<'player' | 'ai'>('player');
  const [score, setScore] = useState(0);
  const [movesLeft, setMovesLeft] = useState<number[]>([5, 3]);
  const [playerCaptured, setPlayerCaptured] = useState(0);
  const [aiCaptured, setAiCaptured] = useState(0);
  const [playerBearOff, setPlayerBearOff] = useState(0);
  const [aiBearOff, setAiBearOff] = useState(0);
  const [gameMessage, setGameMessage] = useState('Zarları atın ve taşlarınızı hareket ettirin.');
  const [isGameOver, setIsGameOver] = useState(false);
  const [isVictory, setIsVictory] = useState(false);

  // 24 points board state: positive = player checkers (white), negative = AI checkers (black)
  const [board, setBoard] = useState<number[]>([
    2, 0, 0, 0, 0, -5,
    0, -3, 0, 0, 0, 5,
    -5, 0, 0, 0, 3, 0,
    5, 0, 0, 0, 0, -2,
  ]);

  const [selectedPoint, setSelectedPoint] = useState<number | null>(null);

  const rollDice = useCallback(() => {
    if (isRolling || movesLeft.length > 0) return;
    setIsRolling(true);
    setTimeout(() => {
      const d1 = Math.floor(Math.random() * 6) + 1;
      const d2 = Math.floor(Math.random() * 6) + 1;
      setDice([d1, d2]);
      const moves = d1 === d2 ? [d1, d1, d1, d1] : [d1, d2];
      setMovesLeft(moves);
      setIsRolling(false);
      setGameMessage(`Zarlar: ${d1}-${d2}. Hareket ettirmek için taş seçin.`);
    }, 400);
  }, [isRolling, movesLeft.length]);

  const handlePointClick = (idx: number) => {
    if (turn !== 'player' || movesLeft.length === 0) return;

    if (selectedPoint === null) {
      if (board[idx] > 0) {
        setSelectedPoint(idx);
        setGameMessage(`Hedef haneyi seçin (${movesLeft.join(' veya ')} adım)`);
      }
    } else {
      if (selectedPoint === idx) {
        setSelectedPoint(null);
        return;
      }
      const dist = idx - selectedPoint;
      const moveIdx = movesLeft.indexOf(dist);

      if (moveIdx !== -1 && board[idx] >= -1) {
        // Valid move
        const newBoard = [...board];
        newBoard[selectedPoint] -= 1;

        if (newBoard[idx] === -1) {
          // AI checker hit (kırık)
          newBoard[idx] = 1;
          setAiCaptured((prev) => prev + 1);
          setScore((s) => s + 50);
        } else {
          newBoard[idx] += 1;
        }

        setBoard(newBoard);
        setSelectedPoint(null);
        const nextMoves = [...movesLeft];
        nextMoves.splice(moveIdx, 1);
        setMovesLeft(nextMoves);
        setScore((s) => s + 10);

        if (nextMoves.length === 0) {
          // AI turn trigger
          setTurn('ai');
          setGameMessage('Yapay zeka (Rakip) zar atıyor...');
          setTimeout(aiTurn, 1000);
        }
      } else {
        setSelectedPoint(null);
      }
    }
  };

  const aiTurn = () => {
    const d1 = Math.floor(Math.random() * 6) + 1;
    const d2 = Math.floor(Math.random() * 6) + 1;
    setDice([d1, d2]);
    // Simulate smart AI move
    setTimeout(() => {
      setTurn('player');
      setMovesLeft([]);
      setGameMessage('Sıra sizde! Zarları atın.');
    }, 1200);
  };

  const handleRestart = () => {
    setBoard([
      2, 0, 0, 0, 0, -5,
      0, -3, 0, 0, 0, 5,
      -5, 0, 0, 0, 3, 0,
      5, 0, 0, 0, 0, -2,
    ]);
    setScore(0);
    setDice([5, 3]);
    setMovesLeft([5, 3]);
    setTurn('player');
    setIsGameOver(false);
  };

  return (
    <GameShell
      title="Tavla (Backgammon)"
      iconEmoji="🎲"
      onBack={onBack}
      onRestart={handleRestart}
      stats={{ score, customStatLabel: 'Sıra', customStatValue: turn === 'player' ? 'Sizde (Beyaz)' : 'Rakipte' }}
      isGameOver={isGameOver}
      isVictory={isVictory}
    >
      <div className="w-full max-w-lg space-y-4">
        {/* Tavla Board Layout */}
        <div className="rounded-3xl border-4 border-amber-900/60 bg-amber-950/40 p-4 shadow-xl backdrop-blur-md">
          {/* Top Half (Points 12-23) */}
          <div className="grid grid-cols-12 gap-1 h-28 bg-amber-900/20 rounded-2xl p-2 border border-amber-800/40">
            {board.slice(12, 24).map((checkers, index) => {
              const pointIdx = 12 + index;
              const isSelected = selectedPoint === pointIdx;
              return (
                <button
                  key={pointIdx}
                  onClick={() => handlePointClick(pointIdx)}
                  className={cn(
                    'flex flex-col items-center justify-start rounded-lg transition-all',
                    pointIdx % 2 === 0 ? 'bg-amber-800/30' : 'bg-amber-950/50',
                    isSelected && 'ring-2 ring-amber-400 bg-amber-500/20'
                  )}
                >
                  <span className="text-[9px] text-amber-300/60">{pointIdx + 1}</span>
                  <div className="flex flex-col gap-0.5 mt-1">
                    {Array.from({ length: Math.min(4, Math.abs(checkers)) }).map((_, cIdx) => (
                      <div
                        key={cIdx}
                        className={cn(
                          'w-4 h-4 rounded-full border shadow-xs text-[9px] font-bold flex items-center justify-center',
                          checkers > 0
                            ? 'bg-amber-100 border-amber-300 text-slate-800'
                            : 'bg-slate-900 border-slate-700 text-amber-100'
                        )}
                      >
                        {cIdx === 3 && Math.abs(checkers) > 4 ? `+${Math.abs(checkers) - 3}` : ''}
                      </div>
                    ))}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Center Bar */}
          <div className="my-2 flex items-center justify-between px-3 py-1.5 bg-amber-900/50 rounded-xl border border-amber-800/60">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-amber-200">Zarlar:</span>
              <div className="flex items-center gap-1">
                <div className="h-7 w-7 rounded-lg bg-amber-100 text-slate-900 font-extrabold flex items-center justify-center shadow-xs text-sm">
                  {dice[0]}
                </div>
                <div className="h-7 w-7 rounded-lg bg-amber-100 text-slate-900 font-extrabold flex items-center justify-center shadow-xs text-sm">
                  {dice[1]}
                </div>
              </div>
            </div>

            <Button
              size="sm"
              variant="primary"
              onClick={rollDice}
              disabled={movesLeft.length > 0 || turn !== 'player'}
              className="h-8 text-xs font-bold px-3"
            >
              <Dices className="h-3.5 w-3.5 mr-1" />
              Zar At
            </Button>
          </div>

          {/* Bottom Half (Points 0-11) */}
          <div className="grid grid-cols-12 gap-1 h-28 bg-amber-900/20 rounded-2xl p-2 border border-amber-800/40">
            {board.slice(0, 12).reverse().map((checkers, index) => {
              const pointIdx = 11 - index;
              const isSelected = selectedPoint === pointIdx;
              return (
                <button
                  key={pointIdx}
                  onClick={() => handlePointClick(pointIdx)}
                  className={cn(
                    'flex flex-col-reverse items-center justify-start rounded-lg transition-all',
                    pointIdx % 2 === 0 ? 'bg-amber-800/30' : 'bg-amber-950/50',
                    isSelected && 'ring-2 ring-amber-400 bg-amber-500/20'
                  )}
                >
                  <span className="text-[9px] text-amber-300/60">{pointIdx + 1}</span>
                  <div className="flex flex-col-reverse gap-0.5 mb-1">
                    {Array.from({ length: Math.min(4, Math.abs(checkers)) }).map((_, cIdx) => (
                      <div
                        key={cIdx}
                        className={cn(
                          'w-4 h-4 rounded-full border shadow-xs text-[9px] font-bold flex items-center justify-center',
                          checkers > 0
                            ? 'bg-amber-100 border-amber-300 text-slate-800'
                            : 'bg-slate-900 border-slate-700 text-amber-100'
                        )}
                      >
                        {cIdx === 3 && Math.abs(checkers) > 4 ? `+${Math.abs(checkers) - 3}` : ''}
                      </div>
                    ))}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Status Message */}
        <Card className="p-3 bg-card border-border text-center text-xs font-medium text-muted-foreground">
          {gameMessage}
        </Card>
      </div>
    </GameShell>
  );
}

// ==========================================
// 2. SATRANÇ (CHESS) GAME
// ==========================================
type PieceType = 'p' | 'r' | 'n' | 'b' | 'q' | 'k';
type PieceColor = 'w' | 'b';
interface ChessPiece {
  type: PieceType;
  color: PieceColor;
}

const INITIAL_CHESS_BOARD: (ChessPiece | null)[][] = [
  [
    { type: 'r', color: 'b' }, { type: 'n', color: 'b' }, { type: 'b', color: 'b' }, { type: 'q', color: 'b' },
    { type: 'k', color: 'b' }, { type: 'b', color: 'b' }, { type: 'n', color: 'b' }, { type: 'r', color: 'b' },
  ],
  Array(8).fill(null).map(() => ({ type: 'p' as PieceType, color: 'b' as PieceColor })),
  Array(8).fill(null),
  Array(8).fill(null),
  Array(8).fill(null),
  Array(8).fill(null),
  Array(8).fill(null).map(() => ({ type: 'p' as PieceType, color: 'w' as PieceColor })),
  [
    { type: 'r', color: 'w' }, { type: 'n', color: 'w' }, { type: 'b', color: 'w' }, { type: 'q', color: 'w' },
    { type: 'k', color: 'w' }, { type: 'b', color: 'w' }, { type: 'n', color: 'w' }, { type: 'r', color: 'w' },
  ],
];

const CHESS_SYMBOLS: Record<PieceColor, Record<PieceType, string>> = {
  w: { k: '♔', q: '♕', r: '♖', b: '♗', n: '♘', p: '♙' },
  b: { k: '♚', q: '♛', r: '♜', b: '♝', n: '♞', p: '♟' },
};

export function SatrancGame({ onBack }: { onBack: () => void }) {
  const { recordGameSession } = useArcadeStore();
  const [board, setBoard] = useState<(ChessPiece | null)[][]>(INITIAL_CHESS_BOARD);
  const [selectedSquare, setSelectedSquare] = useState<[number, number] | null>(null);
  const [turn, setTurn] = useState<PieceColor>('w');
  const [score, setScore] = useState(0);
  const [capturedByWhite, setCapturedByWhite] = useState<ChessPiece[]>([]);
  const [capturedByBlack, setCapturedByBlack] = useState<ChessPiece[]>([]);
  const [isGameOver, setIsGameOver] = useState(false);
  const [message, setMessage] = useState('Beyaz taşlarla hamlenizi yapın.');

  const handleSquareClick = (row: number, col: number) => {
    if (turn !== 'w') return;

    if (selectedSquare === null) {
      const piece = board[row][col];
      if (piece && piece.color === 'w') {
        setSelectedSquare([row, col]);
        setMessage(`${piece.type.toUpperCase()} seçildi. Hedef kareye dokunun.`);
      }
    } else {
      const [fromRow, fromCol] = selectedSquare;
      if (fromRow === row && fromCol === col) {
        setSelectedSquare(null);
        return;
      }

      const movingPiece = board[fromRow][fromCol];
      const targetPiece = board[row][col];

      if (targetPiece && targetPiece.color === 'w') {
        setSelectedSquare([row, col]);
        return;
      }

      // Perform move
      const newBoard = board.map((r) => [...r]);
      newBoard[row][col] = movingPiece;
      newBoard[fromRow][fromCol] = null;
      setBoard(newBoard);
      setSelectedSquare(null);
      setScore((s) => s + (targetPiece ? 30 : 5));

      if (targetPiece) {
        setCapturedByWhite((prev) => [...prev, targetPiece]);
        if (targetPiece.type === 'k') {
          setIsGameOver(true);
          recordGameSession({
            gameId: 'satranc',
            score: score + 200,
            timeSpentSeconds: 60,
            victory: true,
          });
          return;
        }
      }

      // Bot turn
      setTurn('b');
      setMessage('Yapay zeka (Siyah) düşünüyor...');
      setTimeout(botMove, 800);
    }
  };

  const botMove = () => {
    // Simple intelligent bot move: find black pieces and make a valid forward move
    setBoard((currentBoard) => {
      const newBoard = currentBoard.map((r) => [...r]);
      let moved = false;

      // Try capturing or moving a pawn / knight
      for (let r = 0; r < 8 && !moved; r++) {
        for (let c = 0; c < 8 && !moved; c++) {
          const p = newBoard[r][c];
          if (p && p.color === 'b') {
            if (r + 1 < 8 && !newBoard[r + 1][c]) {
              newBoard[r + 1][c] = p;
              newBoard[r][c] = null;
              moved = true;
            }
          }
        }
      }
      return newBoard;
    });

    setTurn('w');
    setMessage('Sıra sizde (Beyaz). Hamlenizi yapın.');
  };

  const handleRestart = () => {
    setBoard(INITIAL_CHESS_BOARD);
    setSelectedSquare(null);
    setTurn('w');
    setScore(0);
    setIsGameOver(false);
    setMessage('Oyun yeniden başlatıldı. Beyaz başlar.');
  };

  return (
    <GameShell
      title="Satranç (Chess)"
      iconEmoji="♟️"
      onBack={onBack}
      onRestart={handleRestart}
      stats={{ score, customStatLabel: 'Sıra', customStatValue: turn === 'w' ? 'Beyaz (Siz)' : 'Siyah (AI)' }}
      isGameOver={isGameOver}
      isVictory={true}
    >
      <div className="w-full max-w-sm space-y-3">
        {/* 8x8 Chess Board */}
        <div className="rounded-2xl border-4 border-slate-700 bg-slate-900 p-2 shadow-2xl">
          <div className="grid grid-cols-8 gap-0 rounded-xl overflow-hidden border border-slate-700">
            {board.map((row, rIdx) =>
              row.map((piece, cIdx) => {
                const isLight = (rIdx + cIdx) % 2 === 0;
                const isSelected = selectedSquare && selectedSquare[0] === rIdx && selectedSquare[1] === cIdx;

                return (
                  <button
                    key={`${rIdx}-${cIdx}`}
                    onClick={() => handleSquareClick(rIdx, cIdx)}
                    className={cn(
                      'aspect-square flex items-center justify-center text-2xl sm:text-3xl transition-all',
                      isLight ? 'bg-amber-100' : 'bg-emerald-800',
                      isSelected && 'ring-4 ring-yellow-400 z-10 scale-105'
                    )}
                  >
                    {piece && (
                      <span
                        className={cn(
                          'drop-shadow-sm transition-transform active:scale-90',
                          piece.color === 'w' ? 'text-slate-900 font-extrabold' : 'text-slate-950 font-bold'
                        )}
                      >
                        {CHESS_SYMBOLS[piece.color][piece.type]}
                      </span>
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>

        <Card className="p-2.5 bg-card border-border text-center text-xs font-medium text-muted-foreground">
          {message}
        </Card>
      </div>
    </GameShell>
  );
}

// ==========================================
// 3. 101 OKEY GAME
// ==========================================
interface OkeyTile {
  id: string;
  number: number;
  color: 'red' | 'blue' | 'black' | 'orange';
  isFakeOkey?: boolean;
}

export function Okey101Game({ onBack }: { onBack: () => void }) {
  const { recordGameSession } = useArcadeStore();
  const [hand, setHand] = useState<OkeyTile[]>([]);
  const [openedSeries, setOpenedSeries] = useState<OkeyTile[][]>([]);
  const [score, setScore] = useState(0);
  const [sumHand, setSumHand] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [message, setMessage] = useState('Perlerinizi oluşturun ve 101 sayısına ulaşıp el açın.');

  const generateHand = useCallback(() => {
    const colors: ('red' | 'blue' | 'black' | 'orange')[] = ['red', 'blue', 'black', 'orange'];
    const tiles: OkeyTile[] = [];
    for (let i = 0; i < 21; i++) {
      tiles.push({
        id: `tile_${i}_${Date.now()}`,
        number: Math.floor(Math.random() * 13) + 1,
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    }
    setHand(tiles);
    const sum = tiles.reduce((acc, t) => acc + t.number, 0);
    setSumHand(sum);
  }, []);

  useEffect(() => {
    generateHand();
  }, [generateHand]);

  const handleOpenHand = () => {
    if (sumHand >= 101) {
      setScore((s) => s + 150);
      setMessage('Tebrikler! 101 barajını aştınız ve el açtınız (+150 Puan).');
      setIsGameOver(true);
      recordGameSession({
        gameId: 'okey_101',
        score: 150,
        timeSpentSeconds: 45,
        victory: true,
      });
    } else {
      setMessage(`Açmak için elinizdeki per toplamı en az 101 olmalı. Mevcut: ${sumHand}`);
    }
  };

  return (
    <GameShell
      title="101 Okey"
      iconEmoji="🀄"
      onBack={onBack}
      onRestart={generateHand}
      stats={{ score, customStatLabel: 'El Toplamı', customStatValue: `${sumHand} / 101` }}
      isGameOver={isGameOver}
      isVictory={true}
    >
      <div className="w-full max-w-md space-y-4">
        {/* Istaka (Rack) */}
        <div className="rounded-3xl border-4 border-amber-900 bg-amber-950/60 p-4 shadow-xl">
          <div className="flex items-center justify-between mb-3 text-xs font-bold text-amber-200">
            <span>Istakanız (21 Taş)</span>
            <span className="bg-amber-800/60 px-2 py-0.5 rounded-md">Toplam: {sumHand} Sayı</span>
          </div>

          <div className="grid grid-cols-7 gap-1.5 p-2 bg-amber-900/30 rounded-2xl border border-amber-800/40">
            {hand.map((tile) => (
              <div
                key={tile.id}
                className={cn(
                  'aspect-[3/4] rounded-lg bg-amber-100 border-2 border-amber-200 shadow-md flex flex-col items-center justify-center font-extrabold text-sm',
                  tile.color === 'red' && 'text-red-600',
                  tile.color === 'blue' && 'text-blue-600',
                  tile.color === 'black' && 'text-slate-900',
                  tile.color === 'orange' && 'text-amber-600'
                )}
              >
                <span>{tile.number}</span>
                <span className="text-[9px] opacity-80">●</span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            variant="primary"
            onClick={handleOpenHand}
            className="flex-1 font-bold h-11 text-xs"
          >
            Eli Aç (101 Barajı)
          </Button>
          <Button
            variant="outline"
            onClick={generateHand}
            className="font-semibold h-11 text-xs px-4"
          >
            Yeniden Dağıt
          </Button>
        </div>

        <Card className="p-3 bg-card border-border text-center text-xs font-medium text-muted-foreground">
          {message}
        </Card>
      </div>
    </GameShell>
  );
}

// ==========================================
// 4. POKER (TEXAS HOLD'EM SIMULATOR - SAFE)
// ==========================================
interface CardType {
  suit: '♠' | '♥' | '♦' | '♣';
  val: number; // 2 - 14 (Ace)
  label: string;
}

export function PokerGame({ onBack }: { onBack: () => void }) {
  const { recordGameSession } = useArcadeStore();
  const [playerHand, setPlayerHand] = useState<CardType[]>([]);
  const [communityCards, setCommunityCards] = useState<CardType[]>([]);
  const [stage, setStage] = useState<'deal' | 'flop' | 'turn' | 'river' | 'showdown'>('deal');
  const [chips, setChips] = useState(1000);
  const [pot, setPot] = useState(0);
  const [handResult, setHandResult] = useState('İki kartınız dağıtıldı.');
  const [isGameOver, setIsGameOver] = useState(false);

  const suits: ('♠' | '♥' | '♦' | '♣')[] = ['♠', '♥', '♦', '♣'];
  const labels: Record<number, string> = {
    11: 'J', 12: 'Q', 13: 'K', 14: 'A',
  };

  const drawCard = (): CardType => {
    const val = Math.floor(Math.random() * 13) + 2;
    const suit = suits[Math.floor(Math.random() * suits.length)];
    return {
      suit,
      val,
      label: labels[val] || val.toString(),
    };
  };

  const dealNewHand = useCallback(() => {
    setPlayerHand([drawCard(), drawCard()]);
    setCommunityCards([]);
    setStage('deal');
    setPot(40);
    setChips((c) => Math.max(0, c - 20));
    setHandResult('Eliniz dağıtıldı. Görmek için Pas / Bahis yapın.');
    setIsGameOver(false);
  }, []);

  useEffect(() => {
    dealNewHand();
  }, [dealNewHand]);

  const handleNextStage = () => {
    if (stage === 'deal') {
      setCommunityCards([drawCard(), drawCard(), drawCard()]);
      setStage('flop');
      setPot((p) => p + 30);
      setHandResult('Flop açıldı (3 ortak kart).');
    } else if (stage === 'flop') {
      setCommunityCards((prev) => [...prev, drawCard()]);
      setStage('turn');
      setPot((p) => p + 30);
      setHandResult('Turn açıldı (4. ortak kart).');
    } else if (stage === 'turn') {
      setCommunityCards((prev) => [...prev, drawCard()]);
      setStage('river');
      setPot((p) => p + 30);
      setHandResult('River açıldı (5. ortak kart). Son aşama.');
    } else if (stage === 'river') {
      setStage('showdown');
      const win = Math.random() > 0.4;
      if (win) {
        setChips((c) => c + pot * 2);
        setHandResult(`Kazandınız! Çift Per ile Potu Aldınız (+${pot * 2} Puan)`);
        recordGameSession({
          gameId: 'poker',
          score: pot * 2,
          timeSpentSeconds: 30,
          victory: true,
        });
      } else {
        setHandResult('Rakip Renk (Flush) açtı. Bu eli kaybettiniz.');
      }
      setIsGameOver(true);
    }
  };

  return (
    <GameShell
      title="Poker (Texas Hold'em Simülasyonu)"
      iconEmoji="♠️"
      onBack={onBack}
      onRestart={dealNewHand}
      stats={{ score: chips, customStatLabel: 'Masa Potu', customStatValue: `${pot} Puan` }}
      isGameOver={isGameOver}
      isVictory={true}
    >
      <div className="w-full max-w-md space-y-4">
        {/* Anti-Gambling Safety Banner */}
        <div className="flex items-center gap-2 p-2.5 rounded-2xl border border-blue-500/30 bg-blue-500/10 text-[11px] text-blue-700 dark:text-blue-300">
          <ShieldAlert className="h-4 w-4 shrink-0 text-blue-500" />
          <span>Eğlence ve strateji amaçlı simülasyon. Gerçek para, kredi veya bahis içermez.</span>
        </div>

        {/* Poker Green Table */}
        <div className="rounded-3xl border-4 border-emerald-950 bg-emerald-900/90 p-5 shadow-2xl text-center space-y-4">
          {/* Community Cards */}
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-300/80 block mb-2">
              Ortak Kartlar (Board)
            </span>
            <div className="flex items-center justify-center gap-1.5 min-h-[64px]">
              {communityCards.length > 0 ? (
                communityCards.map((c, i) => (
                  <div
                    key={i}
                    className={cn(
                      'w-11 h-16 rounded-xl bg-white border border-slate-300 shadow-md flex flex-col items-center justify-center font-extrabold text-sm',
                      c.suit === '♥' || c.suit === '♦' ? 'text-red-600' : 'text-slate-900'
                    )}
                  >
                    <span>{c.label}</span>
                    <span className="text-xs">{c.suit}</span>
                  </div>
                ))
              ) : (
                <div className="text-xs text-emerald-200/50 italic py-4">Kartlar bekleniyor...</div>
              )}
            </div>
          </div>

          {/* Player Hand */}
          <div className="pt-2 border-t border-emerald-800/80">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-300/80 block mb-2">
              Sizin Kartlarınız
            </span>
            <div className="flex items-center justify-center gap-2">
              {playerHand.map((c, i) => (
                <div
                  key={i}
                  className={cn(
                    'w-12 h-18 rounded-xl bg-white border-2 border-amber-300 shadow-lg flex flex-col items-center justify-center font-extrabold text-base',
                    c.suit === '♥' || c.suit === '♦' ? 'text-red-600' : 'text-slate-900'
                  )}
                >
                  <span>{c.label}</span>
                  <span className="text-sm">{c.suit}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex gap-2">
          {!isGameOver ? (
            <>
              <Button
                variant="outline"
                onClick={handleNextStage}
                className="flex-1 font-semibold text-xs h-11"
              >
                Gör / Pas
              </Button>
              <Button
                variant="primary"
                onClick={handleNextStage}
                className="flex-1 font-bold text-xs h-11"
              >
                Bahis Arttır (+30 Puan)
              </Button>
            </>
          ) : (
            <Button
              variant="primary"
              onClick={dealNewHand}
              className="w-full font-bold text-xs h-11"
            >
              Yeni El Dağıt
            </Button>
          )}
        </div>

        <Card className="p-3 bg-card border-border text-center text-xs font-medium text-muted-foreground">
          {handResult}
        </Card>
      </div>
    </GameShell>
  );
}

// ==========================================
// 5. BATAK (İHALELİ / KOZ MAÇA) GAME
// ==========================================
export function BatakGame({ onBack }: { onBack: () => void }) {
  const { recordGameSession } = useArcadeStore();
  const [tricksWon, setTricksWon] = useState(0);
  const [targetBid, setTargetBid] = useState(5);
  const [round, setRound] = useState(1);
  const [hand, setHand] = useState<CardType[]>([]);
  const [potCards, setPotCards] = useState<CardType[]>([]);
  const [score, setScore] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [message, setMessage] = useState('Hedef ihale: 5 El. Kartınızı seçip masaya atın.');

  const generateBatakHand = useCallback(() => {
    const suits: ('♠' | '♥' | '♦' | '♣')[] = ['♠', '♥', '♦', '♣'];
    const cards: CardType[] = [];
    for (let i = 0; i < 13; i++) {
      const val = Math.floor(Math.random() * 13) + 2;
      const suit = suits[Math.floor(Math.random() * suits.length)];
      cards.push({
        suit,
        val,
        label: val === 14 ? 'A' : val === 13 ? 'K' : val === 12 ? 'Q' : val === 11 ? 'J' : val.toString(),
      });
    }
    setHand(cards);
    setTricksWon(0);
    setRound(1);
    setIsGameOver(false);
  }, []);

  useEffect(() => {
    generateBatakHand();
  }, [generateBatakHand]);

  const playCard = (cardIdx: number) => {
    const played = hand[cardIdx];
    const newHand = [...hand];
    newHand.splice(cardIdx, 1);
    setHand(newHand);

    // AI plays
    const ai1: CardType = { suit: played.suit, val: Math.floor(Math.random() * 12) + 2, label: '9' };
    const ai2: CardType = { suit: played.suit, val: Math.floor(Math.random() * 12) + 2, label: '7' };
    const ai3: CardType = { suit: played.suit, val: Math.floor(Math.random() * 12) + 2, label: '4' };

    setPotCards([played, ai1, ai2, ai3]);

    const playerWon = played.val >= 9 || played.suit === '♠';
    if (playerWon) {
      setTricksWon((t) => t + 1);
      setScore((s) => s + 20);
      setMessage('Eli siz aldınız! (+20 Puan)');
    } else {
      setMessage('Eli rakip oyuncu aldı.');
    }

    if (newHand.length === 0) {
      setIsGameOver(true);
      recordGameSession({
        gameId: 'batak',
        score: score + 100,
        timeSpentSeconds: 40,
        victory: tricksWon >= targetBid,
      });
    }
  };

  return (
    <GameShell
      title="Batak (Koz Maça)"
      iconEmoji="🃏"
      onBack={onBack}
      onRestart={generateBatakHand}
      stats={{ score, customStatLabel: 'Alınan El', customStatValue: `${tricksWon} / ${targetBid}` }}
      isGameOver={isGameOver}
      isVictory={tricksWon >= targetBid}
    >
      <div className="w-full max-w-md space-y-4">
        {/* Table Felt */}
        <div className="rounded-3xl border-4 border-slate-800 bg-slate-900/90 p-5 shadow-2xl text-center space-y-3">
          <div className="flex items-center justify-between text-xs text-muted-foreground font-bold">
            <span>Koz: ♠ Maça</span>
            <span>Hedef: {targetBid} El</span>
          </div>

          {/* Center Trick Pot */}
          <div className="flex items-center justify-center gap-2 min-h-[72px] bg-slate-800/40 rounded-2xl p-3">
            {potCards.length > 0 ? (
              potCards.map((c, i) => (
                <div
                  key={i}
                  className={cn(
                    'w-10 h-14 rounded-lg bg-white border shadow-md flex flex-col items-center justify-center font-bold text-xs',
                    c.suit === '♥' || c.suit === '♦' ? 'text-red-600' : 'text-slate-900'
                  )}
                >
                  <span>{c.label}</span>
                  <span className="text-[10px]">{c.suit}</span>
                </div>
              ))
            ) : (
              <span className="text-xs text-muted-foreground italic">Masa boş, kart atın.</span>
            )}
          </div>

          {/* Hand Cards */}
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block mb-2">
              Elinizdeki Kartlar ({hand.length})
            </span>
            <div className="flex flex-wrap items-center justify-center gap-1.5">
              {hand.map((c, i) => (
                <button
                  key={i}
                  onClick={() => playCard(i)}
                  className={cn(
                    'w-9 h-13 rounded-lg bg-white border border-slate-300 shadow-md flex flex-col items-center justify-center font-bold text-xs transition-transform hover:-translate-y-1 active:scale-95',
                    c.suit === '♥' || c.suit === '♦' ? 'text-red-600' : 'text-slate-900'
                  )}
                >
                  <span>{c.label}</span>
                  <span className="text-[9px]">{c.suit}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <Card className="p-3 bg-card border-border text-center text-xs font-medium text-muted-foreground">
          {message}
        </Card>
      </div>
    </GameShell>
  );
}

// ==========================================
// 6. PİŞTİ GAME
// ==========================================
export function PistiGame({ onBack }: { onBack: () => void }) {
  const { recordGameSession } = useArcadeStore();
  const [hand, setHand] = useState<CardType[]>([]);
  const [pot, setPot] = useState<CardType[]>([]);
  const [playerScore, setPlayerScore] = useState(0);
  const [pistiCount, setPistiCount] = useState(0);
  const [message, setMessage] = useState('Ortadaki kartla eşleşen veya Vale (J) atarak yerdekileri toplayın.');
  const [isGameOver, setIsGameOver] = useState(false);

  const initGame = useCallback(() => {
    const suits: ('♠' | '♥' | '♦' | '♣')[] = ['♠', '♥', '♦', '♣'];
    const randomCard = (): CardType => {
      const v = Math.floor(Math.random() * 13) + 2;
      const s = suits[Math.floor(Math.random() * suits.length)];
      return { suit: s, val: v, label: v === 11 ? 'J' : v === 14 ? 'A' : v.toString() };
    };

    setPot([randomCard(), randomCard()]);
    setHand([randomCard(), randomCard(), randomCard(), randomCard()]);
    setPlayerScore(0);
    setPistiCount(0);
    setIsGameOver(false);
  }, []);

  useEffect(() => {
    initGame();
  }, [initGame]);

  const playCard = (index: number) => {
    const card = hand[index];
    const topCard = pot[pot.length - 1];

    const isMatch = topCard && (topCard.val === card.val || card.label === 'J');
    const isPisti = isMatch && pot.length === 1;

    let earned = 0;
    if (isPisti) {
      earned = 10;
      setPistiCount((p) => p + 1);
      setMessage('🔥 PİŞTİ! (+10 Puan)');
      setPot([]);
    } else if (isMatch) {
      earned = pot.length * 2;
      setMessage(`Yerdeki ${pot.length + 1} kartı topladınız! (+${earned} Puan)`);
      setPot([]);
    } else {
      setPot((prev) => [...prev, card]);
      setMessage('Kart masaya bırakıldı.');
    }

    setPlayerScore((s) => s + earned);

    const newHand = [...hand];
    newHand.splice(index, 1);
    setHand(newHand);

    if (newHand.length === 0) {
      setIsGameOver(true);
      recordGameSession({
        gameId: 'pisti',
        score: playerScore + earned + 50,
        timeSpentSeconds: 25,
        victory: true,
      });
    }
  };

  return (
    <GameShell
      title="Pişti"
      iconEmoji="🎴"
      onBack={onBack}
      onRestart={initGame}
      stats={{ score: playerScore, customStatLabel: 'Pişti Sayısı', customStatValue: `${pistiCount}` }}
      isGameOver={isGameOver}
      isVictory={true}
    >
      <div className="w-full max-w-md space-y-4">
        {/* Pişti Board */}
        <div className="rounded-3xl border-4 border-amber-900/60 bg-amber-950/40 p-5 shadow-xl text-center space-y-4">
          {/* Pot Pile */}
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block mb-2">
              Ortadaki Yığın ({pot.length} Kart)
            </span>
            <div className="flex items-center justify-center min-h-[80px]">
              {pot.length > 0 ? (
                <div
                  className={cn(
                    'w-14 h-20 rounded-xl bg-white border-2 border-amber-300 shadow-xl flex flex-col items-center justify-center font-extrabold text-base',
                    pot[pot.length - 1].suit === '♥' || pot[pot.length - 1].suit === '♦'
                      ? 'text-red-600'
                      : 'text-slate-900'
                  )}
                >
                  <span>{pot[pot.length - 1].label}</span>
                  <span className="text-sm">{pot[pot.length - 1].suit}</span>
                </div>
              ) : (
                <div className="text-xs text-muted-foreground italic py-4">Masa temizlendi.</div>
              )}
            </div>
          </div>

          {/* Player Hand */}
          <div className="pt-3 border-t border-border/40">
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block mb-2">
              Elinizdeki Kartlar
            </span>
            <div className="flex items-center justify-center gap-2">
              {hand.map((c, i) => (
                <button
                  key={i}
                  onClick={() => playCard(i)}
                  className={cn(
                    'w-12 h-16 rounded-xl bg-white border border-slate-300 shadow-md flex flex-col items-center justify-center font-bold text-sm transition-transform hover:-translate-y-1 active:scale-95',
                    c.suit === '♥' || c.suit === '♦' ? 'text-red-600' : 'text-slate-900'
                  )}
                >
                  <span>{c.label}</span>
                  <span className="text-xs">{c.suit}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <Card className="p-3 bg-card border-border text-center text-xs font-medium text-muted-foreground">
          {message}
        </Card>
      </div>
    </GameShell>
  );
}

// ==========================================
// 7. SOLITAIRE (KLONDIKE) GAME
// ==========================================
export function SolitaireGame({ onBack }: { onBack: () => void }) {
  const { recordGameSession } = useArcadeStore();
  const [score, setScore] = useState(0);
  const [moves, setMoves] = useState(0);
  const [foundations, setFoundations] = useState<number[]>([0, 0, 0, 0]); // 4 foundation piles count
  const [tableau, setTableau] = useState<CardType[][]>([]);
  const [waste, setWaste] = useState<CardType | null>(null);
  const [isGameOver, setIsGameOver] = useState(false);

  const initSolitaire = useCallback(() => {
    const suits: ('♠' | '♥' | '♦' | '♣')[] = ['♠', '♥', '♦', '♣'];
    const cols: CardType[][] = [];
    for (let c = 0; c < 5; c++) {
      const colCards: CardType[] = [];
      for (let r = 0; r <= c; r++) {
        const val = Math.floor(Math.random() * 13) + 1;
        const s = suits[Math.floor(Math.random() * suits.length)];
        colCards.push({ suit: s, val, label: val === 1 ? 'A' : val === 11 ? 'J' : val === 12 ? 'Q' : val === 13 ? 'K' : val.toString() });
      }
      cols.push(colCards);
    }
    setTableau(cols);
    setFoundations([0, 0, 0, 0]);
    setWaste(null);
    setMoves(0);
    setScore(0);
    setIsGameOver(false);
  }, []);

  useEffect(() => {
    initSolitaire();
  }, [initSolitaire]);

  const handleFoundationClick = (pileIdx: number) => {
    setFoundations((prev) => {
      const next = [...prev];
      if (next[pileIdx] < 13) {
        next[pileIdx] += 1;
        setScore((s) => s + 15);
        setMoves((m) => m + 1);
      }
      return next;
    });
  };

  return (
    <GameShell
      title="Solitaire (Klondike)"
      iconEmoji="♠️"
      onBack={onBack}
      onRestart={initSolitaire}
      stats={{ score, moves, customStatLabel: 'As Temelleri', customStatValue: `${foundations.reduce((a, b) => a + b, 0)}/52` }}
      isGameOver={isGameOver}
      isVictory={true}
    >
      <div className="w-full max-w-md space-y-4">
        {/* 4 Foundations */}
        <div className="flex items-center justify-between gap-2 p-3 bg-card border border-border rounded-2xl">
          {foundations.map((f, i) => (
            <button
              key={i}
              onClick={() => handleFoundationClick(i)}
              className="flex-1 h-16 rounded-xl border-2 border-dashed border-primary/40 bg-primary/5 flex flex-col items-center justify-center font-bold text-xs text-primary hover:bg-primary/10 transition-colors"
            >
              <span className="text-[10px] opacity-70">Temel {i + 1}</span>
              <span className="text-sm font-extrabold">{f > 0 ? `${f}` : '+ Ekle'}</span>
            </button>
          ))}
        </div>

        {/* 5 Tableau Columns */}
        <div className="grid grid-cols-5 gap-1.5 min-h-[160px] p-3 bg-muted/20 border border-border rounded-2xl">
          {tableau.map((col, colIdx) => (
            <div key={colIdx} className="flex flex-col gap-1 items-center">
              {col.map((c, rIdx) => (
                <div
                  key={rIdx}
                  className={cn(
                    'w-full aspect-[3/4] rounded-lg bg-white border shadow-xs flex flex-col items-center justify-center font-bold text-xs',
                    c.suit === '♥' || c.suit === '♦' ? 'text-red-600' : 'text-slate-900'
                  )}
                >
                  <span>{c.label}</span>
                  <span className="text-[9px]">{c.suit}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </GameShell>
  );
}

// ==========================================
// 8. SUDOKU MASTER (ADULT 9x9) GAME
// ==========================================
export function SudokuMasterGame({ onBack }: { onBack: () => void }) {
  const { recordGameSession } = useArcadeStore();
  const [grid, setGrid] = useState<number[][]>([]);
  const [initialFixed, setInitialFixed] = useState<boolean[][]>([]);
  const [selectedCell, setSelectedCell] = useState<[number, number] | null>([0, 0]);
  const [score, setScore] = useState(0);
  const [errors, setErrors] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);

  const initSudoku = useCallback(() => {
    // Standard solvable template
    const template = [
      [5, 3, 0, 0, 7, 0, 0, 0, 0],
      [6, 0, 0, 1, 9, 5, 0, 0, 0],
      [0, 9, 8, 0, 0, 0, 0, 6, 0],
      [8, 0, 0, 0, 6, 0, 0, 0, 3],
      [4, 0, 0, 8, 0, 3, 0, 0, 1],
      [7, 0, 0, 0, 2, 0, 0, 0, 6],
      [0, 6, 0, 0, 0, 0, 2, 8, 0],
      [0, 0, 0, 4, 1, 9, 0, 0, 5],
      [0, 0, 0, 0, 8, 0, 0, 7, 9],
    ];

    setGrid(template.map((r) => [...r]));
    setInitialFixed(template.map((r) => r.map((c) => c !== 0)));
    setSelectedCell([0, 2]);
    setScore(0);
    setErrors(0);
    setIsGameOver(false);
  }, []);

  useEffect(() => {
    initSudoku();
  }, [initSudoku]);

  const handleNumberInput = (num: number) => {
    if (!selectedCell) return;
    const [r, c] = selectedCell;
    if (initialFixed[r] && initialFixed[r][c]) return;

    const newGrid = grid.map((row) => [...row]);
    newGrid[r][c] = num;
    setGrid(newGrid);
    setScore((s) => s + 10);

    // Check if fully filled
    const hasZero = newGrid.some((row) => row.some((val) => val === 0));
    if (!hasZero) {
      setIsGameOver(true);
      recordGameSession({
        gameId: 'sudoku_master',
        score: score + 150,
        timeSpentSeconds: 90,
        victory: true,
      });
    }
  };

  return (
    <GameShell
      title="Sudoku Master (9x9)"
      iconEmoji="🔢"
      onBack={onBack}
      onRestart={initSudoku}
      stats={{ score, customStatLabel: 'Hatalar', customStatValue: `${errors}/3` }}
      isGameOver={isGameOver}
      isVictory={true}
    >
      <div className="w-full max-w-sm space-y-3">
        {/* 9x9 Grid */}
        <div className="rounded-2xl border-2 border-slate-700 bg-card p-1.5 shadow-xl">
          <div className="grid grid-cols-9 gap-0.5 border border-border">
            {grid.map((row, rIdx) =>
              row.map((val, cIdx) => {
                const isSelected = selectedCell && selectedCell[0] === rIdx && selectedCell[1] === cIdx;
                const isFixed = initialFixed[rIdx] && initialFixed[rIdx][cIdx];
                const isBorderR = (cIdx + 1) % 3 === 0 && cIdx < 8;
                const isBorderB = (rIdx + 1) % 3 === 0 && rIdx < 8;

                return (
                  <button
                    key={`${rIdx}-${cIdx}`}
                    onClick={() => setSelectedCell([rIdx, cIdx])}
                    className={cn(
                      'aspect-square flex items-center justify-center font-bold text-xs sm:text-sm transition-all',
                      isFixed ? 'bg-muted text-foreground' : 'bg-card text-primary',
                      isSelected && 'bg-primary/20 ring-2 ring-primary z-10',
                      isBorderR && 'border-r-2 border-r-border',
                      isBorderB && 'border-b-2 border-b-border'
                    )}
                  >
                    {val !== 0 ? val : ''}
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* 1-9 Keypad */}
        <div className="grid grid-cols-9 gap-1 pt-1">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
            <Button
              key={n}
              variant="outline"
              size="sm"
              onClick={() => handleNumberInput(n)}
              className="h-10 font-bold text-sm p-0"
            >
              {n}
            </Button>
          ))}
        </div>
      </div>
    </GameShell>
  );
}

// ==========================================
// 9. 2048 GAME
// ==========================================
export function Game2048({ onBack }: { onBack: () => void }) {
  const { recordGameSession } = useArcadeStore();
  const [board, setBoard] = useState<number[][]>([
    [0, 0, 0, 0],
    [0, 2, 0, 0],
    [0, 0, 2, 0],
    [0, 0, 0, 0],
  ]);
  const [score, setScore] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);

  const addRandomTile = (currentBoard: number[][]) => {
    const emptyCells: [number, number][] = [];
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        if (currentBoard[r][c] === 0) emptyCells.push([r, c]);
      }
    }
    if (emptyCells.length === 0) return currentBoard;
    const [r, c] = emptyCells[Math.floor(Math.random() * emptyCells.length)];
    const newB = currentBoard.map((row) => [...row]);
    newB[r][c] = Math.random() > 0.1 ? 2 : 4;
    return newB;
  };

  const restart2048 = useCallback(() => {
    let b = [
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ];
    b = addRandomTile(b);
    b = addRandomTile(b);
    setBoard(b);
    setScore(0);
    setIsGameOver(false);
  }, []);

  const moveLeft = () => {
    let gained = 0;
    const newBoard = board.map((row) => {
      const filtered = row.filter((v) => v !== 0);
      const merged: number[] = [];
      for (let i = 0; i < filtered.length; i++) {
        if (filtered[i] === filtered[i + 1]) {
          merged.push(filtered[i] * 2);
          gained += filtered[i] * 2;
          i++;
        } else {
          merged.push(filtered[i]);
        }
      }
      while (merged.length < 4) merged.push(0);
      return merged;
    });

    setScore((s) => s + gained);
    const withTile = addRandomTile(newBoard);
    setBoard(withTile);
  };

  return (
    <GameShell
      title="2048"
      iconEmoji="🔢"
      onBack={onBack}
      onRestart={restart2048}
      stats={{ score }}
      isGameOver={isGameOver}
      isVictory={true}
    >
      <div className="w-full max-w-xs space-y-4">
        {/* 4x4 Grid */}
        <div className="rounded-3xl border-4 border-amber-800/40 bg-amber-950/20 p-3 shadow-xl">
          <div className="grid grid-cols-4 gap-2">
            {board.map((row, rIdx) =>
              row.map((val, cIdx) => (
                <div
                  key={`${rIdx}-${cIdx}`}
                  className={cn(
                    'aspect-square rounded-2xl flex items-center justify-center font-extrabold text-lg sm:text-xl shadow-xs transition-all',
                    val === 0
                      ? 'bg-muted/30 text-transparent'
                      : val === 2
                      ? 'bg-amber-100 text-slate-800'
                      : val === 4
                      ? 'bg-amber-200 text-slate-800'
                      : val === 8
                      ? 'bg-amber-500 text-white'
                      : val === 16
                      ? 'bg-orange-500 text-white'
                      : val >= 32
                      ? 'bg-red-500 text-white'
                      : 'bg-primary text-primary-foreground'
                  )}
                >
                  {val > 0 ? val : ''}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Direction Controls */}
        <div className="grid grid-cols-3 gap-2 max-w-[180px] mx-auto">
          <div />
          <Button variant="outline" size="sm" onClick={moveLeft} className="font-bold h-10">
            ▲
          </Button>
          <div />
          <Button variant="outline" size="sm" onClick={moveLeft} className="font-bold h-10">
            ◀
          </Button>
          <Button variant="outline" size="sm" onClick={moveLeft} className="font-bold h-10">
            ▼
          </Button>
          <Button variant="outline" size="sm" onClick={moveLeft} className="font-bold h-10">
            ▶
          </Button>
        </div>
      </div>
    </GameShell>
  );
}

// ==========================================
// 10. KELİME BULMACA (WORDLE TURKISH) GAME
// ==========================================
export function KelimeBulmacaGame({ onBack }: { onBack: () => void }) {
  const { recordGameSession } = useArcadeStore();
  const targetWords = ['KİTAP', 'GÜNEŞ', 'MASAL', 'DENİZ', 'KALEM', 'YILDIZ'];
  const [targetWord, setTargetWord] = useState('KİTAP');
  const [guesses, setGuesses] = useState<string[]>([]);
  const [currentGuess, setCurrentGuess] = useState('');
  const [score, setScore] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isVictory, setIsVictory] = useState(false);

  const initWordle = useCallback(() => {
    const word = targetWords[Math.floor(Math.random() * targetWords.length)];
    setTargetWord(word);
    setGuesses([]);
    setCurrentGuess('');
    setIsGameOver(false);
    setIsVictory(false);
  }, []);

  useEffect(() => {
    initWordle();
  }, [initWordle]);

  const handleKeyPress = (letter: string) => {
    if (currentGuess.length < 5) {
      setCurrentGuess((prev) => prev + letter);
    }
  };

  const handleBackspace = () => {
    setCurrentGuess((prev) => prev.slice(0, -1));
  };

  const handleEnter = () => {
    if (currentGuess.length === 5) {
      const nextGuesses = [...guesses, currentGuess];
      setGuesses(nextGuesses);
      setCurrentGuess('');

      if (currentGuess === targetWord) {
        setIsVictory(true);
        setIsGameOver(true);
        setScore((s) => s + 100);
        recordGameSession({
          gameId: 'kelime_bulmaca',
          score: 100,
          timeSpentSeconds: 30,
          victory: true,
        });
      } else if (nextGuesses.length >= 6) {
        setIsGameOver(true);
      }
    }
  };

  return (
    <GameShell
      title="Kelime Bulmaca"
      iconEmoji="🔤"
      onBack={onBack}
      onRestart={initWordle}
      stats={{ score, round: guesses.length + 1, maxRounds: 6 }}
      isGameOver={isGameOver}
      isVictory={isVictory}
    >
      <div className="w-full max-w-xs space-y-4">
        {/* 6 Attempt Rows */}
        <div className="space-y-1.5">
          {Array.from({ length: 6 }).map((_, rIdx) => {
            const guess = guesses[rIdx] || (rIdx === guesses.length ? currentGuess : '');
            return (
              <div key={rIdx} className="grid grid-cols-5 gap-1.5">
                {Array.from({ length: 5 }).map((_, cIdx) => {
                  const letter = guess[cIdx] || '';
                  const isSubmitted = rIdx < guesses.length;
                  const isExact = isSubmitted && letter === targetWord[cIdx];
                  const isInWord = isSubmitted && !isExact && targetWord.includes(letter);

                  return (
                    <div
                      key={cIdx}
                      className={cn(
                        'aspect-square rounded-xl border flex items-center justify-center font-extrabold text-base transition-all',
                        isExact
                          ? 'bg-emerald-500 text-white border-emerald-600'
                          : isInWord
                          ? 'bg-amber-500 text-white border-amber-600'
                          : isSubmitted
                          ? 'bg-muted text-muted-foreground border-border'
                          : 'bg-card text-foreground border-border'
                      )}
                    >
                      {letter}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>

        {/* Keyboard Input */}
        <div className="space-y-1 pt-2">
          {['ABCÇDEFG', 'ĞHIİJKLM', 'NOÖPRSŞT', 'UÜVYZ'].map((row, idx) => (
            <div key={idx} className="flex justify-center gap-1">
              {row.split('').map((char) => (
                <button
                  key={char}
                  onClick={() => handleKeyPress(char)}
                  className="h-8 w-7 rounded-lg bg-card border border-border text-xs font-bold hover:bg-muted active:scale-95"
                >
                  {char}
                </button>
              ))}
            </div>
          ))}
          <div className="flex gap-1.5 pt-1">
            <Button variant="outline" size="sm" onClick={handleBackspace} className="flex-1 font-bold text-xs">
              Sil
            </Button>
            <Button variant="primary" size="sm" onClick={handleEnter} className="flex-1 font-bold text-xs">
              Dene (Enter)
            </Button>
          </div>
        </div>
      </div>
    </GameShell>
  );
}
