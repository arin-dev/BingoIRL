"use client"

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ReactMarkdown from "react-markdown";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHouse } from '@fortawesome/free-solid-svg-icons';
import useAuthToken from '../hooks/useAuthToken';
import { infoText } from "../data/infoContent";

const Header: React.FC<{ currentPage: string }> = ({ currentPage = "BingoIRL" }) => {
  const router = useRouter();
  const { clearToken } = useAuthToken();
  const [infoIsActive, setInfoIsActive] = useState(false);
  const [username, setUsername] = useState('');

  // Read from localStorage only on client to avoid SSR hydration mismatch
  useEffect(() => {
    setUsername(localStorage.getItem('username') || '');
  }, []);

  const handleLogout = () => {
    clearToken();
    localStorage.clear();
    router.push('/signin');
  };

  return (
    <header className="bg-blue-500 text-white p-4 w-full">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center gap-3">
          {currentPage !== 'BingoIRL' && (
            <button
              onClick={() => router.push('/')}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-blue-400 hover:bg-blue-300 transition-colors"
              title="Home"
            >
              <FontAwesomeIcon icon={faHouse} className="text-white text-sm" />
            </button>
          )}
          <h1 className="text-2xl font-bold">{currentPage}</h1>
        </div>

        <div className="flex items-center space-x-4">
          {/* Avatar — shows first letter of username */}
          <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center text-lg font-bold text-gray-700">
            {username ? username[0].toUpperCase() : '?'}
          </div>

          {/* Info button */}
          <button
            onClick={() => setInfoIsActive(prev => !prev)}
            className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-lg font-bold text-blue-500"
          >
            i
          </button>

          {/* Info overlay */}
          {infoIsActive && (
            <div
              onClick={() => setInfoIsActive(false)}
              className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
            >
              <div
                onClick={e => e.stopPropagation()}
                className="relative max-w-2xl w-11/12 max-h-[80vh] p-6 bg-white rounded-md shadow-lg overflow-y-auto text-black"
              >
                <button
                  onClick={() => setInfoIsActive(false)}
                  className="absolute top-2 right-2 text-gray-600 hover:text-gray-800 text-lg font-bold"
                >
                  &times;
                </button>
                <ReactMarkdown
                  components={{
                    h1: ({ node, ...props }) => <h1 className="text-3xl font-bold mt-6 mb-2" {...props} />,
                    h2: ({ node, ...props }) => <h2 className="text-2xl font-semibold mt-4 mb-2" {...props} />,
                    p: ({ node, ...props }) => <p className="text-lg my-2" {...props} />,
                    ul: ({ node, ...props }) => <ul className="list-disc list-inside ml-6 my-2" {...props} />,
                    li: ({ node, ...props }) => <li className="my-1" {...props} />,
                  }}
                >
                  {infoText}
                </ReactMarkdown>
              </div>
            </div>
          )}

          <button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
