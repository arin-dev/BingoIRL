"use client"

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import Header from '../../components/header';
import useAuthToken from '../../hooks/useAuthToken';
import axios from 'axios';

const BASE_URL = process.env.NEXT_PUBLIC_PRODUCTION_DOMAIN;

type BingoEntry = { text: string; tick: boolean };
type GameData = {
  id: string;
  name: string;
  gameSize: number;
  prize: string | null;
  createdBy: string;
  winner: string | null;
  players: string[];
  playerGame: {
    id: number;
    entries: BingoEntry[][];
    bingo: number;
  } | null;
};

export default function GamePage() {
  const params = useParams();
  const router = useRouter();
  const { token } = useAuthToken();
  const [authLoading, setAuthLoading] = useState(true);
  const [game, setGame] = useState<GameData | null>(null);

  // localEntries: what the user sees (may have un-submitted toggles)
  // serverEntries: last state successfully committed to the server
  const [localEntries, setLocalEntries] = useState<BingoEntry[][]>([]);
  const [serverEntries, setServerEntries] = useState<BingoEntry[][]>([]);

  const [pageLoading, setPageLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const gameId = params.gameId as string;

  // A cell is "pending" if its local tick differs from the last submitted server state
  const hasPending = localEntries.some((row, r) =>
    row.some((cell, c) => serverEntries[r]?.[c]?.tick !== cell.tick)
  );

  const fetchGame = useCallback(async (currentToken: string) => {
    try {
      const res = await axios.get(`${BASE_URL}api/game/${gameId}`, {
        headers: { Authorization: `Bearer ${currentToken}` },
      });
      const data: GameData = res.data;
      setGame(data);
      if (!data.playerGame) {
        router.push(`/join-game/${gameId}`);
        return;
      }
      // Only sync entries from server if there are no local pending changes
      // (avoid clobbering draft state during polling)
      setServerEntries(data.playerGame.entries);
      setLocalEntries(prev => {
        const hasDraft = prev.length > 0 && prev.some((row, r) =>
          row.some((cell, c) => data.playerGame!.entries[r]?.[c]?.tick !== cell.tick)
        );
        return hasDraft ? prev : data.playerGame!.entries;
      });
    } catch {
      setError('Failed to load game. Check the game ID and try again.');
    } finally {
      setPageLoading(false);
    }
  }, [gameId, router]);

  // Hydration guard
  useEffect(() => {
    if (authLoading) { setAuthLoading(false); return; }
    if (!token) { router.push('/signin'); return; }
    fetchGame(token);
  }, [token, authLoading, router, fetchGame]);

  // Poll every 5 seconds for winner / other players joining
  useEffect(() => {
    if (!token) return;
    const interval = setInterval(() => fetchGame(token), 5000);
    return () => clearInterval(interval);
  }, [token, fetchGame]);

  // Toggle a cell locally — no server call until user clicks Submit
  const handleCellClick = (rowIndex: number, colIndex: number) => {
    if (game?.winner) return;
    setLocalEntries(prev => {
      const next = prev.map(row => row.map(cell => ({ ...cell })));
      next[rowIndex][colIndex].tick = !next[rowIndex][colIndex].tick;
      return next;
    });
  };

  // Submit all pending changes to the server at once
  const handleSubmit = async () => {
    if (!token || !hasPending || submitting) return;
    setSubmitting(true);

    // Collect only the cells that changed from the last server state
    const updates: { rowIndex: number; colIndex: number; tick: boolean }[] = [];
    localEntries.forEach((row, r) =>
      row.forEach((cell, c) => {
        if (serverEntries[r]?.[c]?.tick !== cell.tick) {
          updates.push({ rowIndex: r, colIndex: c, tick: cell.tick });
        }
      })
    );

    try {
      const res = await axios.patch(
        `${BASE_URL}api/game/update-bingo/${gameId}`,
        { updates },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setServerEntries(localEntries.map(row => row.map(cell => ({ ...cell }))));
      if (res.data.redirect === 'reload') {
        fetchGame(token);
      } else {
        setGame(prev =>
          prev?.playerGame
            ? { ...prev, playerGame: { ...prev.playerGame, bingo: res.data.bingo } }
            : prev
        );
        toast.success('Changes saved!');
      }
    } catch {
      toast.error('Failed to save. Try again.');
      // Leave local state as-is so the user can retry
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading || pageLoading) {
    return <div className="flex items-center justify-center h-screen text-gray-500">Loading game...</div>;
  }
  if (error) {
    return <div className="flex items-center justify-center h-screen text-red-500">{error}</div>;
  }
  if (!game) return null;

  return (
    <div className="flex flex-col min-h-screen">
      <Header currentPage={game.name} />

      {/* Winner banner */}
      {game.winner && (
        <div className="bg-yellow-400 text-center py-4 text-2xl font-bold border-b border-yellow-500">
          {game.winner} won!{game.prize ? ` Prize: ${game.prize}` : ''}
        </div>
      )}

      <main className="flex flex-col items-center p-6 gap-5">
        {/* Game meta */}
        <div className="flex flex-wrap gap-4 text-sm text-gray-600">
          {game.prize && <span>Prize: <strong>{game.prize}</strong></span>}
          <span>Players: <strong>{game.players.length}</strong></span>
          <span>Bingo lines: <strong>{game.playerGame?.bingo ?? 0}</strong></span>
        </div>

        {/* Bingo grid */}
        <div
          className="grid border-2 border-black"
          style={{ gridTemplateColumns: `repeat(${game.gameSize}, 1fr)` }}
        >
          {localEntries.map((row, rowIndex) =>
            row.map((cell, colIndex) => {
              const isPending = serverEntries[rowIndex]?.[colIndex]?.tick !== cell.tick;
              return (
                <button
                  key={`${rowIndex}-${colIndex}`}
                  onClick={() => handleCellClick(rowIndex, colIndex)}
                  disabled={!!game.winner}
                  className={`w-24 h-24 border border-black p-2 text-xs text-center flex items-center justify-center transition-colors leading-tight relative
                    ${cell.tick && !isPending ? 'bg-green-500 text-white line-through' : ''}
                    ${isPending ? 'bg-amber-400 text-white' : ''}
                    ${!cell.tick && !isPending ? 'bg-yellow-100 hover:bg-yellow-200 text-gray-800' : ''}
                    ${game.winner ? 'cursor-default' : 'cursor-pointer'}
                  `}
                >
                  {cell.text}
                  {isPending && (
                    <span className="absolute top-1 right-1 text-[8px] font-bold opacity-70">●</span>
                  )}
                </button>
              );
            })
          )}
        </div>

        {/* Submit pending changes */}
        {hasPending && !game.winner && (
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="bg-blue-500 hover:bg-blue-700 disabled:opacity-50 text-white font-bold py-2 px-6 rounded"
          >
            {submitting ? 'Submitting...' : 'Submit Changes'}
          </button>
        )}

        {/* Players */}
        <p className="text-sm text-gray-400">{game.players.join(' · ')}</p>

        {game.winner && (
          <button
            className="mt-2 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded"
            onClick={() => router.push('/')}
          >
            Back to Home
          </button>
        )}
      </main>
    </div>
  );
}
