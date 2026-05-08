import axios from "axios";

const api = axios.create({
  baseURL: "/api",
  withCredentials: true,
});

let isRefreshing = false;
let failedQueue: any[] = [];

const AUTH_ROUTES = [
  "/auth/login",
  "/auth/register",
  "/auth/refresh",
  "/auth/logout",
];

const processQueue = (error: any) => {
  failedQueue.forEach((promise) => {
    if (error) {
      promise.reject(error);
    } else {
      promise.resolve(null);
    }
  });

  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    const isAuthRoute = AUTH_ROUTES.some((route) =>
      originalRequest?.url?.includes(route),
    );

    // Let login/register errors go back to UI
    if (isAuthRoute) {
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({
            resolve,
            reject,
          });
        }).then(() => api(originalRequest));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        await axios.post(
          "/api/auth/refresh",
          {},
          {
            withCredentials: true,
          },
        );

        processQueue(null);

        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError);

        window.location.href = "/login";

        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);

export default api;
