import React from 'react';
import useAuthToken from '../hooks/useAuthToken';

const Header: React.FC <{ currentPage : string }> = ({currentPage = "Under Testing"}) => {
  const { clearToken } = useAuthToken();
  const handleLogout = () => {
    clearToken();
    window.location.href = '/signin';
  };

  return (
    <header className="bg-blue-500 text-white p-4 w-full">
      <div className="container mx-auto flex justify-between items-center">
        <h1 className="text-2xl font-bold">{currentPage}</h1>
        <div className="flex items-center space-x-4">
          <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center text-lg font-bold">
            A
          </div>
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