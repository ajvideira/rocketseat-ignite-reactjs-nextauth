import { useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';

export default function Dashboard() {
  const { user } = useAuth();

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get('/me');
        console.log(data);
      } catch (error) {
        console.error(error);
      }
    })();
  }, []);

  return <h1>Dashboard: {user?.email}</h1>;
}
