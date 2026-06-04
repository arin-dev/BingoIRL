"use client"

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from './components/header';
import useAuthToken from './hooks/useAuthToken';
import axios from 'axios';

const BASE_URL = process.env.NEXT_PUBLIC_PRODUCTION_DOMAIN;

type GameSummary = {
  gameId: number;
  name: string;
  prize: string | null;
  gameSize: number;
  winnerId: number | null;
};

export default function HomePage() {
  const router = useRouter();
  const { token } = useAuthToken();
  const [authLoading, setAuthLoading] = useState(true);
  const [games, setGames] = useState<GameSummary[]>([]);
  const [joinId, setJoinId] = useState('');

  // Hydration guard: localStorage isn't available on first SSR pass
  useEffect(() => {
    if (authLoading) { setAuthLoading(false); return; }
    if (!token) router.push('/signin');
  }, [token, authLoading, router]);

  // Fetch user's games once token is available
  useEffect(() => {
    if (!token) return;
    axios
      .get(`${BASE_URL}api/game/my-games`, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => setGames(res.data))
      .catch(() => {});
  }, [token]);

  if (!token) return null;

  const handleJoin = () => {
    const id = joinId.trim();
    if (id) router.push(`/join-game/${id}`);
  };

  return (
    <>
      <Header currentPage="BingoIRL" />
      <main className="max-w-2xl mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Your Games</h2>
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            onClick={() => router.push('/create-game')}
          >
            + New Game
          </button>
        </div>

        {/* Join an existing game by ID */}
        <div className="flex gap-2 mb-6">
          <input
            className="border border-gray-300 rounded px-3 py-2 flex-1 focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="Enter game ID to join..."
            value={joinId}
            onChange={e => setJoinId(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleJoin()}
          />
          <button
            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
            onClick={handleJoin}
          >
            Join
          </button>
        </div>

        {/* Game list */}
        {games.length === 0 ? (
          <p className="text-gray-400 text-center py-16">
            No games yet. Create one or join with an ID!
          </p>
        ) : (
          <div className="flex flex-col gap-3">
            {games.map(g => (
              <button
                key={g.gameId}
                className="border rounded-lg p-4 text-left hover:bg-gray-50 flex justify-between items-center transition-colors"
                onClick={() => router.push(`/game/${g.gameId}`)}
              >
                <div>
                  <div className="font-semibold">{g.name}</div>
                  <div className="text-sm text-gray-500">
                    {g.gameSize}×{g.gameSize} grid
                    {g.prize && ` · Prize: ${g.prize}`}
                    {` · ID: ${g.gameId}`}
                  </div>
                </div>
                <span
                  className={`text-xs font-semibold px-2 py-1 rounded-full ${
                    g.winnerId
                      ? 'bg-green-100 text-green-700'
                      : 'bg-blue-100 text-blue-700'
                  }`}
                >
                  {g.winnerId ? 'Finished' : 'In Progress'}
                </span>
              </button>
            ))}
          </div>
        )}
      </main>
    </>
  );
}
