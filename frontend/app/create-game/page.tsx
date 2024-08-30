
"use client"

import { useState } from 'react';
import Header from '../components/header';
import SubmitButton from '../components/button';


export default function BingoTable() {
  const [size, setSize] = useState(3);
  const [table, setTable] = useState(Array(size).fill(null).map(() => Array(size).fill(null)));
  const [filled, setFilled] = useState(0);
  // const [filled, setFilled] = useState(0);

  const handleSizeChange = (e : any) => {
    const newSize = parseInt(e.target.value)
    setSize(newSize);
    setTable(Array(newSize).fill(null).map(() => Array(newSize).fill(null)));
  };

  return (
    <div className="flex flex-col h-screen">
    <Header currentPage='Game' />
    <div className="p-4 flex flex-col justify-center items-center bg-teal-100 justify-center items-center h-full">
        <div className="b">BingoSize : <input
            className="border p-2 mb-5"
            type="number"
            value={size}
            onChange={handleSizeChange}
            placeholder="Enter size (n)"
            min="2"
            max="5"
            />
          &nbsp;&nbsp;&nbsp;| &nbsp;&nbsp; Filled : {filled}
        </div>
        <div className="grid border-black border-2" style={{ gridTemplateColumns: `repeat(${size}, 1fr)` }}>
            {table.map((row, rowIndex) =>
            row.map((cell, colIndex) => (
                <textarea
                    key={`${rowIndex}-${colIndex}`}
                    className={`border p-4 border-black border-1 ${cell ? 'bg-green-500' : 'bg-yellow-500'} text-white placeholder-white resize-none text-center`}
                    value={cell || ""}
                    placeholder={`Type here... ${rowIndex}-${colIndex}`}
                    onChange={(e) => {
                      const newValue = e.target.value;
                      const oldValue = table[rowIndex][colIndex];
                      const newTable = [...table]
                      newTable[rowIndex][colIndex] = newValue;
                      setTable(newTable);
                      console.log("old : ", oldValue, " new : " ,newValue, table);
                      if( (!oldValue && newValue))
                          setFilled(filled => filled+1);
                      else if( (oldValue && !newValue))
                        setFilled(filled => filled-1);
                    }}
                    style={{ width: '100%', height: '100%', boxSizing: 'border-box' }}
                    />
                  ))
                )
              }
        </div>
        <div className='pt-4'>
        <SubmitButton
          onClick = { e => filled != size*size ? alert('Please fill all the entries') : alert('Bharne ke liye dhanyawad') }
          label = 'Create Game!'
          />
        </div>
    </div>
    </div>
  )
};