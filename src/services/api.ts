import axios, { AxiosError, AxiosRequestConfig } from 'axios';
import { parseCookies, setCookie } from 'nookies';
import { signOut } from '../contexts/AuthContext';

let cookies = parseCookies();

export const api = axios.create({
  baseURL: 'http://localhost:3333',
});

if (cookies['nextAuth.refreshToken']) {
  api.defaults.headers.common[
    'Authorization'
  ] = `Bearer ${cookies['nextAuth.refreshToken']}`;
}

let failedRequestsQueue: any = [];
let isRefreshing = false;

// Interceptor for Response
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error: AxiosError) => {
    const originalRequest = error.config;

    if (error.response?.status === 401) {
      if (error.response.data?.code === 'token.expired') {
        if (!isRefreshing) {
          isRefreshing = true;
          cookies = parseCookies();

          api
            .post('/refresh', {
              refreshToken: cookies['nextAuth.refreshToken'],
            })
            .then((response) => {
              const {
                data: { token, refreshToken },
              } = response;

              setCookie(null, 'nextAuth.token', token, {
                maxAge: 60 * 60 * 24 * 30,
                path: '/',
              });

              setCookie(null, 'nextAuth.refreshToken', refreshToken, {
                maxAge: 60 * 60 * 24 * 30,
                path: '/',
              });

              api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

              failedRequestsQueue.forEach((request: any) => {
                request.onSuccess(token);
              });
            })
            .catch((err) => {
              console.log(err);
              failedRequestsQueue.forEach((request: any) => {
                request.onFailure(err);
              });
              signOut();
            })
            .finally(() => {
              failedRequestsQueue = [];
              isRefreshing = false;
            });
        }

        return new Promise((resolve, reject) => {
          failedRequestsQueue.push({
            onSuccess: (token: string) => {
              if (originalRequest.headers !== undefined) {
                originalRequest.headers.Authorization = `Bearer ${token}`;
              }
              resolve(api(originalRequest));
            },
            onFailure: (err: any) => {
              reject(err);
            },
          });
        });
      }
    }
    return Promise.reject(error);
  }
);
