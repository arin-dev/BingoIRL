"use client"

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Header from '../../components/header';
import SubmitButton from '../../components/button';
import useAuthToken from '../../hooks/useAuthToken';
import axios from 'axios';

const BASE_URL = process.env.NEXT_PUBLIC_PRODUCTION_DOMAIN;

type GameInfo = { name: string; gameSize: number; prize: string | null };

export default function JoinGamePage() {
  const params = useParams();
  const router = useRouter();
  const { token } = useAuthToken();
  const [authLoading, setAuthLoading] = useState(true);
  const [pageLoading, setPageLoading] = useState(true);
  const [gameInfo, setGameInfo] = useState<GameInfo | null>(null);
  const [table, setTable] = useState<string[][]>([]);
  const [filled, setFilled] = useState(0);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const gameId = params.gameId as string;

  // Hydration guard
  useEffect(() => {
    if (authLoading) { setAuthLoading(false); return; }
    if (!token) { router.push('/signin'); return; }

    axios
      .get(`${BASE_URL}api/game/${gameId}`, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => {
        const data = res.data;
        if (data.playerGame) {
          // Already registered — go straight to game
          router.push(`/game/${gameId}`);
          return;
        }
        setGameInfo({ name: data.name, gameSize: data.gameSize, prize: data.prize });
        setTable(Array(data.gameSize).fill(null).map(() => Array(data.gameSize).fill('')));
        setPageLoading(false);
      })
      .catch(() => {
        setError('Game not found or you do not have access.');
        setPageLoading(false);
      });
  }, [token, authLoading, gameId, router]);

  const handleSubmit = async () => {
    if (!gameInfo || !token) return;
    if (filled !== gameInfo.gameSize * gameInfo.gameSize) {
      setError(`Fill all ${gameInfo.gameSize * gameInfo.gameSize} squares before joining.`);
      return;
    }
    setSubmitting(true);
    try {
      await axios.post(
        `${BASE_URL}api/game/register-for-game/${gameId}`,
        { data: table },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      router.push(`/game/${gameId}`);
    } catch {
      setError('Error joining the game. It may already be full or you may already be registered.');
      setSubmitting(false);
    }
  };

  if (authLoading || pageLoading) {
    return <div className="flex items-center justify-center h-screen text-gray-500">Loading game...</div>;
  }
  if (error && !gameInfo) {
    return <div className="flex items-center justify-center h-screen text-red-500">{error}</div>;
  }
  if (!gameInfo) return null;

  return (
    <div className="flex flex-col h-screen">
      <Header currentPage={`Join: ${gameInfo.name}`} />
      <div className="p-4 flex flex-col justify-center items-center bg-teal-100 h-full gap-3">
        {gameInfo.prize && (
          <p className="text-gray-600">Prize: <strong>{gameInfo.prize}</strong></p>
        )}
        <p className="text-gray-500 text-sm">
          Fill in your {gameInfo.gameSize}×{gameInfo.gameSize} bingo card &nbsp;·&nbsp; Filled: {filled}
        </p>
        {error && <div className="text-red-500 text-sm">{error}</div>}

        <div
          className="grid border-2 border-black"
          style={{ gridTemplateColumns: `repeat(${gameInfo.gameSize}, 1fr)` }}
        >
          {table.map((row, rowIndex) =>
            row.map((cell, colIndex) => (
              <textarea
                key={`${rowIndex}-${colIndex}`}
                className={`border p-3 border-black ${cell ? 'bg-green-500' : 'bg-yellow-500'} text-white placeholder-white resize-none text-center text-sm`}
                value={cell}
                placeholder={`${rowIndex}-${colIndex}`}
                onChange={e => {
                  const oldVal = table[rowIndex][colIndex];
                  const newVal = !oldVal ? e.target.value.trim() : e.target.value;
                  const newTable = table.map(r => [...r]);
                  newTable[rowIndex][colIndex] = newVal;
                  setTable(newTable);
                  if (!oldVal && newVal) setFilled(f => f + 1);
                  else if (oldVal && !newVal) setFilled(f => f - 1);
                  setError('');
                }}
                style={{ width: '100px', height: '100px', boxSizing: 'border-box' }}
              />
            ))
          )}
        </div>

        <SubmitButton
          onClick={handleSubmit}
          label={submitting ? 'Joining...' : 'Join Game!'}
        />
      </div>
    </div>
  );
}
