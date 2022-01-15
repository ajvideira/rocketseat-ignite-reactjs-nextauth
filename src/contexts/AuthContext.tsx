import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from 'react';
import Router from 'next/router';
import { api } from '../services/apiClient';
import { destroyCookie, parseCookies, setCookie } from 'nookies';

type User = {
  email: string;
  permissions: string[];
  roles: string[];
};

type SignInCredentials = {
  email: string;
  password: string;
};

type AuthContextData = {
  signIn: (data: SignInCredentials) => Promise<void>;
  user: User | undefined;
  isAuthenticated: boolean;
};

type AuthContextProviderProps = {
  children: ReactNode;
};

const AuthContext = createContext({} as AuthContextData);

export function signOut() {
  destroyCookie(undefined, 'nextAuth.token');
  destroyCookie(undefined, 'nextAuth.refreshToken');
  Router.push('/');
}

export function AuthContextProvider({ children }: AuthContextProviderProps) {
  const [user, setUser] = useState<User>();
  const isAuthenticated = !!user;

  useEffect(() => {
    (async () => {
      const { 'nextAuth.token': token } = parseCookies();

      if (token) {
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        try {
          const {
            data: { email, roles, permissions },
          } = await api.get('/me');

          setUser({ email, roles, permissions });
        } catch (_) {
          signOut();
        }
      }
    })();
  }, []);

  async function signIn({ email, password }: SignInCredentials) {
    try {
      console.log('Chegou no signIn');

      const { data } = await api.post('/sessions', { email, password });
      const { roles, permissions, token, refreshToken } = data;

      setCookie(undefined, 'nextAuth.token', token, {
        maxAge: 60 * 60 * 24 * 30,
        path: '/',
      });

      setCookie(undefined, 'nextAuth.refreshToken', refreshToken, {
        maxAge: 60 * 60 * 24 * 30,
        path: '/',
      });

      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      setUser({ email, roles, permissions });

      console.log('Redireciona para dashboard');
      Router.push('/dashboard');
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <AuthContext.Provider value={{ signIn, user, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const authContext = useContext(AuthContext);
  return authContext;
}
