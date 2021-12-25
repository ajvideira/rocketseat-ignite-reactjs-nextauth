import { createContext, ReactNode, useContext, useState } from 'react';
import Router from 'next/router';
import { api } from '../services/api';

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

export function AuthContextProvider({ children }: AuthContextProviderProps) {
  const [user, setUser] = useState<User>();
  const isAuthenticated = !!user;

  async function signIn({ email, password }: SignInCredentials) {
    try {
      const { data } = await api.post('/sessions', { email, password });
      const { roles, permissions, token, refreshToken } = data;

      setUser({ email, roles, permissions });

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
