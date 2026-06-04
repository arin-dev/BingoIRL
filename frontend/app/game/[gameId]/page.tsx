"use client"

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Header from '../../components/header';
import useAuthToken from '../../hooks/useAuthToken';
import axios from 'axios';

const BASE_URL = process.env.NEXT_PUBLIC_PRODUCTION_DOMAIN;

type BingoEntry = { text: string; tick: boolean };
type GameData = {
  id: number;
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
  const [entries, setEntries] = useState<BingoEntry[][]>([]);
  const [pageLoading, setPageLoading] = useState(true);
  const [error, setError] = useState('');
  const [updating, setUpdating] = useState(false);

  const gameId = params.gameId as string;

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
      setEntries(data.playerGame.entries);
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

  // Poll every 5 seconds for winner / state updates
  useEffect(() => {
    if (!token) return;
    const interval = setInterval(() => fetchGame(token), 5000);
    return () => clearInterval(interval);
  }, [token, fetchGame]);

  const handleCellClick = async (rowIndex: number, colIndex: number) => {
    if (!token || updating || game?.winner) return;

    // Optimistic update
    const newEntries = entries.map(row => row.map(cell => ({ ...cell })));
    newEntries[rowIndex][colIndex].tick = !newEntries[rowIndex][colIndex].tick;
    setEntries(newEntries);

    setUpdating(true);
    try {
      const res = await axios.patch(
        `${BASE_URL}api/game/update-bingo/${gameId}`,
        { updates: [{ rowIndex, colIndex, tick: newEntries[rowIndex][colIndex].tick }] },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.redirect === 'reload') {
        fetchGame(token);
      } else {
        setGame(prev =>
          prev && prev.playerGame
            ? { ...prev, playerGame: { ...prev.playerGame, bingo: res.data.bingo } }
            : prev
        );
      }
    } catch {
      setEntries(entries); // revert on failure
    } finally {
      setUpdating(false);
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
          <span>Your bingo lines: <strong>{game.playerGame?.bingo ?? 0}</strong></span>
          <span className="text-gray-400">ID: {game.id}</span>
        </div>

        {/* Bingo grid */}
        <div
          className="grid border-2 border-black"
          style={{ gridTemplateColumns: `repeat(${game.gameSize}, 1fr)` }}
        >
          {entries.map((row, rowIndex) =>
            row.map((cell, colIndex) => (
              <button
                key={`${rowIndex}-${colIndex}`}
                onClick={() => handleCellClick(rowIndex, colIndex)}
                disabled={!!game.winner || updating}
                className={`w-24 h-24 border border-black p-2 text-xs text-center flex items-center justify-center transition-colors leading-tight
                  ${cell.tick
                    ? 'bg-green-500 text-white line-through'
                    : 'bg-yellow-100 hover:bg-yellow-200 text-gray-800'
                  }
                  ${game.winner ? 'cursor-default' : 'cursor-pointer'}
                `}
              >
                {cell.text}
              </button>
            ))
          )}
        </div>

        {/* Players */}
        <p className="text-sm text-gray-400">
          {game.players.join(' · ')}
        </p>

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
