import { useState, useEffect } from 'react';

interface User {
  id: string;
  username: string;
  email: string;
  avatarUrl?: string;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      return;
    }

    // Fetch user data from your API
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
      .then(res => res.json())
      .then(data => {
        setUser(data);
        setLoading(false);
      })
      .catch(() => {
        localStorage.removeItem('token');
        setUser(null);
        setLoading(false);
      });
  }, []);

  return { user, loading };
} 