
"use client"

import { useState, useEffect } from 'react';
import Header from '../components/header';
import SubmitButton from '../components/button';
import useAuthToken from '../hooks/useAuthToken';
import axios from 'axios';

const BASE_URL = process.env.NEXT_PUBLIC_PRODUCTION_DOMAIN;

export default function BingoTable() {
  const [size, setSize] = useState(3);
  const [table, setTable] = useState(Array(size).fill(null).map(() => Array(size).fill(null)));
  const [filled, setFilled] = useState(0);
  const [prize, setPrize] = useState('');
  const [gameName, setGameName] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const { token } = useAuthToken();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (loading)
      {setLoading(false); return;}
    if (!token) {
      window.location.href = '/signin';
    }
  }, [token, loading]);

  useEffect(()=>{
    setErrorMessage('');
  }, [size, table, filled, gameName])

  if(!token)
    return ;

  const handleSizeChange = (e : any) => {
    const newSize = parseInt(e.target.value)
    setSize(newSize);
    setFilled(0);
    setTable(Array(newSize).fill(null).map(() => Array(newSize).fill(null)));
  };

  return (
    <div className="flex flex-col h-screen">
    <Header currentPage='Game' />
    <div className="p-4 flex flex-col justify-center items-center bg-teal-100 h-full">
        <div className="mb-5">
            <input
                className="border p-2 mb-2"
                type="text"
                placeholder="Name of the Game"
                onChange={(e) => setGameName(e.target.value)}
            />
            <input
                className="border p-2 mb-2"
                type="number"
                value={size}
                onChange={handleSizeChange}
                placeholder="Enter size (n)"
                min="2"
                max="5"
            />
            <input
                className="border p-2 mb-5"
                type="text"
                placeholder="Prize for the winner"
                onChange={(e) => setPrize(e.target.value)}
            />
            &nbsp;&nbsp;&nbsp;| &nbsp;&nbsp; Filled : {filled}
        </div>
        {errorMessage && <div className='text-red-500 text-center mb-6'>{errorMessage}</div>}
        <div className="grid border-black border-2" style={{ gridTemplateColumns: `repeat(${size}, 1fr)` }}>
            {table.map((row, rowIndex) =>
                row.map((cell, colIndex) => (
                    <textarea
                        key={`${rowIndex}-${colIndex}`}
                        className={`border p-4 border-black ${cell ? 'bg-green-500' : 'bg-yellow-500'} text-white placeholder-white resize-none text-center`}
                        value={cell || ""}
                        placeholder={`Type here... ${rowIndex}-${colIndex}`}
                        onChange={(e) => {
                          const oldValue = table[rowIndex][colIndex];
                          const newValue = !oldValue ? e.target.value.trim() : e.target.value;
                          const newTable = [...table];
                          newTable[rowIndex][colIndex] = newValue;
                          setTable(newTable);
                          if ((!oldValue && newValue)) setFilled(filled => filled + 1);
                          else if ((oldValue && !newValue)) setFilled(filled => filled - 1);
                          setErrorMessage('');
                        }}
                        style={{ width: '100%', height: '100%', boxSizing: 'border-box' }}
                    />
                ))
            )}
        </div>
        <div className='pt-4'>
            <SubmitButton
                onClick={async e => {
                  if (filled !== size * size) {
                    setErrorMessage(`Fill the remaining ${size * size - filled} blocks`);
                    return;
                  }
                  if (!gameName) {
                    setErrorMessage(e => e ? e + " and give a name to the game" : "Give a name to the game");
                    return;
                  }

                  // const playerEntries = table.map(row => row.map(cell => cell ? { text: cell, tick: false } : null).filter(Boolean));
                  const playerEntries = table;
                  const data = {
                    name: gameName,
                    gameSize: size,
                    prize: prize,
                    playerEntries: playerEntries
                  };

                  try {
                    console.log(`${BASE_URL}api/game/create-game/`);
                    console.log(data);
                    console.log(token);
                    const response = await axios.post(`${BASE_URL}api/game/create-game/`, data, {
                      headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json'
                      }
                    });
                    alert(`Game Created: ${response.data.message}, Prize: ${response.data.gameId}`);
                  } catch (error) {
                    setErrorMessage('Error creating game');
                  }
                }}
                label='Create Game!'
            />
        </div>
    </div>
    </div>
  )
};