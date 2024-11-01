import React from 'react';
import useAuthToken from '../hooks/useAuthToken';
import ReactMarkdown from "react-markdown";
// import remarkGfm from 'remark-gfm';
import {useState} from 'react';

import { infoText } from "../data/infoContent";

const Header: React.FC <{ currentPage : string }> = ({currentPage = "Under Testing"}) => {
  const { clearToken } = useAuthToken();
  const [ infoIsActive, setInfoIsActive ] = useState(false);
  // This will work every time as it initializes the username state with the value from localStorage or defaults to "Unknown" if not found.
  // const [ username, setUserName ] = useState(() => {
  //   const storedUsername = localStorage.getItem('username') || "Unknow";
  //   // return storedUsername ? JSON.parse(storedUsername) : "Unknown";
  // });
  const username = localStorage.getItem('username') || "Unknown";

  const handleLogout = () => {
    clearToken();
    localStorage.clear();
    window.location.href = '/signin';
  };

  const handleInfo = () => {
    setInfoIsActive( (prev) => !prev);
  };


  return (
    <header className="bg-blue-500 text-white p-4 w-full">
      <div className="container mx-auto flex justify-between items-center">
        <h1 className="text-2xl font-bold">{currentPage}</h1>

        <div className="flex items-center space-x-4">
          <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center text-lg font-bold">
            {username[0]}
          </div>
          <button
            onClick={handleInfo}
            className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-lg font-bold text-blue-500"
            > i </button>

          {/* Full-Screen Overlay for the Info Window */}
          {infoIsActive && (
            <div
              onClick={() => setInfoIsActive(false)} // Closes the overlay when clicking outside
              className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
            >
              <div
                onClick={(e) => e.stopPropagation()} // Prevents closing when clicking inside the box
                className="relative max-w-2xl w-11/12 max-h-[80vh] p-6 bg-white rounded-md shadow-lg overflow-y-auto text-black"
              >
                <button
                  onClick={() => setInfoIsActive(false)}
                  className="absolute top-2 right-2 text-gray-600 hover:text-gray-800 text-lg font-bold"
                >
                  &times;
                </button>
                <ReactMarkdown 
                  // remarkPlugins={[remarkGfm]}
                  components={{
                    h1: ({ node, ...props }) => <h1 className="text-3xl font-bold mt-6 mb-2" {...props} />,
                    h2: ({ node, ...props }) => <h2 className="text-2xl font-semibold mt-4 mb-2" {...props} />,
                    p: ({ node, ...props }) => <p className="text-lg my-2" {...props} />,
                    ul: ({ node, ...props }) => <ul className="list-disc list-inside ml-6 my-2" {...props} />,
                    li: ({ node, ...props }) => <li className="my-1" {...props} />,
                  }}            
                    >{infoText}</ReactMarkdown>
              </div>
            </div>
          )}

          <button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
            >Logout </button>
        </div>

      </div>
    </header>
  );
};

export default Header;