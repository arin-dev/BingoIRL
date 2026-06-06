"use client"

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import Header from '../../components/header';
import BingoGrid from '../../components/BingoGrid';
import useAuthToken from '../../hooks/useAuthToken';
import axios from '@/lib/axios';

const BASE_URL = process.env.NEXT_PUBLIC_PRODUCTION_DOMAIN;

type BingoEntry = { text: string; tick: boolean };
type PlayerSummary = { username: string; bingo: number };
type CardData = { username: string; bingo: number; entries: BingoEntry[][] };
type GameData = {
  id: string;
  name: string;
  gameSize: number;
  prize: string | null;
  winner: string | null;
  players: PlayerSummary[];
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
  const [viewingCard, setViewingCard] = useState<CardData | null>(null);
  const [cardLoading, setCardLoading] = useState(false);

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

  const handleCellClick = (r: number, c: number) => {
    if (game?.winner) return;
    setLocalEntries(prev => {
      const next = prev.map(row => row.map(cell => ({ ...cell })));
      next[r][c].tick = !next[r][c].tick;
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
        if (serverEntries[r]?.[c]?.tick !== cell.tick)
          updates.push({ rowIndex: r, colIndex: c, tick: cell.tick });
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

  const handleViewCard = async (username: string) => {
    setCardLoading(true);
    setViewingCard({ username, bingo: 0, entries: [] });
    try {
      const res = await axios.get(
        `${BASE_URL}api/game/${gameId}/player-card/${username}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setViewingCard(res.data);
    } catch {
      toast.error('Could not load card.');
      setViewingCard(null);
    } finally {
      setCardLoading(false);
    }
  };

  if (authLoading || pageLoading)
    return <div className="flex items-center justify-center h-screen text-gray-500">Loading game...</div>;
  if (error)
    return <div className="flex items-center justify-center h-screen text-red-500">{error}</div>;
  if (!game) return null;

  return (
    <div className="flex flex-col min-h-screen">
      <Header currentPage={game.name} />

      {game.winner && (
        <div className="bg-yellow-400 text-center py-4 text-2xl font-bold border-b border-yellow-500">
          {game.winner} won!{game.prize ? ` Prize: ${game.prize}` : ''}
        </div>
      )}

      <div className="flex flex-1">
        {/* Left — own card */}
        <main className="flex-1 flex flex-col items-center p-6 gap-5">
          <div className="flex flex-wrap gap-4 text-sm text-gray-600">
            {game.prize && <span>Prize: <strong>{game.prize}</strong></span>}
            <span>Your bingo lines: <strong>{game.playerGame?.bingo ?? 0}</strong></span>
          </div>

          <BingoGrid
            entries={localEntries}
            gameSize={game.gameSize}
            serverEntries={serverEntries}
            onCellClick={handleCellClick}
            disabled={!!game.winner}
          />

          {hasPending && !game.winner && (
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="bg-blue-500 hover:bg-blue-700 disabled:opacity-50 text-white font-bold py-2 px-6 rounded"
            >
              {submitting ? 'Submitting...' : 'Submit Changes'}
            </button>
          )}

          {game.winner && (
            <button
              className="mt-2 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded"
              onClick={() => router.push('/')}
            >
              Back to Home
            </button>
          )}
        </main>

        {/* Right — other players sidebar, always visible */}
        <aside className="w-64 border-l border-gray-200 bg-gray-50 flex flex-col shrink-0">
          <div className="p-4 border-b border-gray-200">
            <h2 className="font-semibold text-gray-700">
              Other Players ({game.players.length})
            </h2>
          </div>
          <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2">
            {game.players.length === 0 ? (
              <p className="text-sm text-gray-400 text-center pt-6">
                No other players yet.
              </p>
            ) : (
              game.players.map(p => (
                <button
                  key={p.username}
                  onClick={() => handleViewCard(p.username)}
                  className="flex items-center justify-between p-3 rounded-lg border bg-white hover:bg-blue-50 hover:border-blue-200 transition-colors text-left w-full"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm font-bold shrink-0">
                      {p.username[0].toUpperCase()}
                    </div>
                    <span className="text-sm font-medium truncate">{p.username}</span>
                    {game.winner === p.username && <span className="shrink-0">🏆</span>}
                  </div>
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full shrink-0 ml-1">
                    {p.bingo}
                  </span>
                </button>
              ))
            )}
          </div>
        </aside>
      </div>

      {/* Player card overlay */}
      {viewingCard && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={() => setViewingCard(null)}
        >
          <div
            className="bg-white rounded-xl p-6 shadow-xl max-w-fit"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4 gap-6">
              <div>
                <h3 className="text-lg font-bold">{viewingCard.username}&apos;s card</h3>
                <p className="text-sm text-gray-500">
                  {viewingCard.bingo} bingo line{viewingCard.bingo !== 1 ? 's' : ''}
                </p>
              </div>
              <button
                onClick={() => setViewingCard(null)}
                className="text-gray-400 hover:text-gray-600 text-xl leading-none"
              >
                ✕
              </button>
            </div>

            {cardLoading || viewingCard.entries.length === 0 ? (
              <div className="w-60 h-32 flex items-center justify-center text-gray-400 text-sm">
                Loading...
              </div>
            ) : (
              <BingoGrid
                entries={viewingCard.entries}
                gameSize={game.gameSize}
                readOnly
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
