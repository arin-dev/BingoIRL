import { useEffect, useState } from 'react';

const useAuthToken = () => {
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      try {
        const payload = JSON.parse(atob(storedToken.split('.')[1]));
        if (payload.exp && payload.exp * 1000 < Date.now()) {
          localStorage.removeItem('token');
        } else {
          setToken(storedToken);
        }
      } catch {
        localStorage.removeItem('token');
      }
    }
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