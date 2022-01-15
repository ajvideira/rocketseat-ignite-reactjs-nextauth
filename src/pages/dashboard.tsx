import { useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { setupAPIClient } from '../services/api';
import { api } from '../services/apiClient';
import { withSSRAuth } from '../utils/withSSRAuth';

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

export const getServerSideProps = withSSRAuth(async (ctx) => {
  const apiClient = setupAPIClient(ctx);

  const { data } = await apiClient.get('/me');
  console.log(data);

  return {
    props: {},
  };
});
