import { useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useCan } from '../hooks/useCan';
import { setupAPIClient } from '../services/api';
import { api } from '../services/apiClient';
import { withSSRAuth } from '../utils/withSSRAuth';

export default function Dashboard() {
  const { user } = useAuth();

  const canMetrics = useCan({
    permissions: ['metrics.list'],
    roles: ['administrator'],
  });

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

  return (
    <div>
      <h1>Dashboard: {user?.email}</h1>
      <h2>Can see metrics? {canMetrics ? 'Yes' : 'No'}</h2>
    </div>
  );
}

export const getServerSideProps = withSSRAuth(async (ctx) => {
  const apiClient = setupAPIClient(ctx);

  const { data } = await apiClient.get('/me');
  console.log(data);

  return {
    props: {},
  };
});
