import axios, { AxiosError } from 'axios';
import { parseCookies, setCookie } from 'nookies';

export const api = axios.create({
  baseURL: 'http://localhost:3333',
});

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    if (error.response?.status === 401) {
      if (error.response.data?.code === 'token.expired') {
        const cookies = parseCookies();

        const {
          data: { token, refreshToken },
        } = await api.post('/refresh', {
          refreshToken: cookies['nextAuth.refreshToken'],
        });

        setCookie(null, 'nextAuth.token', token, {
          maxAge: 60 * 60 * 24 * 30,
          path: '/',
        });

        setCookie(null, 'nextAuth.refreshToken', refreshToken, {
          maxAge: 60 * 60 * 24 * 30,
          path: '/',
        });

        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      }
    }
  }
);
