import type { GetServerSideProps, NextPage } from 'next';
import { parseCookies } from 'nookies';
import { FormEvent, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import styles from '../styles/Home.module.css';
import { withSSRGuest } from '../utils/withSSRGuest';

const Home: NextPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const { signIn } = useAuth();

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const data = {
      email,
      password,
    };
    await signIn(data);
  };

  return (
    <form
      className={`${styles.container} ${styles.main}`}
      onSubmit={handleSubmit}
    >
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button type="submit">Enviar</button>
    </form>
  );
};

export default Home;

export const getServerSideProps = withSSRGuest(async (ctx) => {
  return {
    props: {},
  };
});
