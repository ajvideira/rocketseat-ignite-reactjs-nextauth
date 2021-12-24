import { createContext, ReactNode, useContext, useState } from 'react';

type SignInCredentials = {
  email: string;
  password: string;
};

type AuthContextData = {
  signIn: (data: SignInCredentials) => Promise<void>;
  isAuthenticated: boolean;
};

type AuthContextProviderProps = {
  children: ReactNode;
};

const AuthContext = createContext({} as AuthContextData);

export function AuthContextProvider({ children }: AuthContextProviderProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  async function signIn({ email, password }: SignInCredentials) {
    console.log(email, password);
  }

  return (
    <AuthContext.Provider value={{ signIn, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const authContext = useContext(AuthContext);
  return authContext;
}
