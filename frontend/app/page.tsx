"use client"
import Header from './components/header';
import useAuthToken from './hooks/useAuthToken';
import { useEffect, useState } from 'react';

export default function FunPage() {
  const { token } = useAuthToken();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (loading)
      {setLoading(false); return;}
    if (!token) {
      window.location.href = '/signin';
    }
  }, [token, loading]);

  const redirectToCG = () => {
    window.location.href = '/create-game';
  };

  if(!token)
    return ;

  return (
    <>
      <Header currentPage='BingoIRL' />
      <main className="flex flex-col items-center justify-center p-24">
        <h1 className="text-3xl font-bold">Welcome to BingoIRL!</h1>
        <p className="mt-4">Turn your boring activities into fun times with friends and colleagues!</p>
        <p className="mt-4">Get ready for an interactive experience:</p>
        <ul className="mt-2">
          <li>🎉 Mark off squares as your friends share their funniest quirks!</li>
          <li>🤔 Spot the moment when someone makes their classic joke!</li>
          <li>👀 Watch for predictable actions, like someone always being late!</li>
          <li>😂 Enjoy the hilarity as you complete your BingoIRL card!</li>
          <li>🏆 Celebrate the winner with a fun prize!</li>
        </ul>
        <button 
          className="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          onClick={() => redirectToCG()}
        >
          Click for a Hilarious Surprise!
        </button>
      </main>
    </>
  );
}