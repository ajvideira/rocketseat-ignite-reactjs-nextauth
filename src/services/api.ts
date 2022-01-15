import axios, { AxiosError, AxiosRequestConfig } from 'axios';
import { GetServerSidePropsContext } from 'next';
import { parseCookies, setCookie } from 'nookies';
import { signOut } from '../contexts/AuthContext';

let failedRequestsQueue: any = [];
let isRefreshing = false;

export function setupAPIClient(
  ctx: GetServerSidePropsContext | undefined = undefined
) {
  const api = axios.create({
    baseURL: 'http://localhost:3333',
  });

  let cookies = parseCookies(ctx);

  if (cookies['nextAuth.token']) {
    api.defaults.headers.common[
      'Authorization'
    ] = `Bearer ${cookies['nextAuth.token']}`;
  }

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
            cookies = parseCookies(ctx);

            api
              .post('/refresh', {
                refreshToken: cookies['nextAuth.refreshToken'],
              })
              .then((response) => {
                const {
                  data: { token, refreshToken },
                } = response;

                setCookie(ctx, 'nextAuth.token', token, {
                  maxAge: 60 * 60 * 24 * 30,
                  path: '/',
                });

                setCookie(ctx, 'nextAuth.refreshToken', refreshToken, {
                  maxAge: 60 * 60 * 24 * 30,
                  path: '/',
                });

                api.defaults.headers.common[
                  'Authorization'
                ] = `Bearer ${token}`;

                failedRequestsQueue.forEach((request: any) => {
                  request.onSuccess(token);
                });
              })
              .catch((err) => {
                console.log(err);
                failedRequestsQueue.forEach((request: any) => {
                  request.onFailure(err);
                });
                if (process.browser) {
                  signOut();
                }
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
  return api;
}
