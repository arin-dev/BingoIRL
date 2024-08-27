import { useEffect, useState } from 'react';

const useAuthToken = () => {
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      setToken(storedToken);
    }
    // else
    //   window.location.href = '/signin';
  }, []);

  const updateToken = (newToken: string) => {
    setToken(newToken);
    localStorage.setItem('token', newToken);
  };

  const clearToken = () => {
    setToken(null);
    localStorage.removeItem('token');
  };

  return { token, updateToken, clearToken };
};

export default useAuthToken;