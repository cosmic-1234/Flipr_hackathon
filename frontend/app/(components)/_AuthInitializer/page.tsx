'use client';

import { useEffect } from 'react';
import axios from 'axios';

export default function AuthInitializer() {
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      axios.defaults.headers.common['Authorization'] = token;
    }
  }, []);

  return null;
}