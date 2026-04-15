import Axios, { InternalAxiosRequestConfig } from "axios";
import { getAccessToken } from "./tokens";

export const axios = Axios.create({
  baseURL: "/api",
});

const authRequestInterceptor = (config: InternalAxiosRequestConfig) => {
  if (config.headers) {
    config.headers["Content-Type"] = "application/json";
    config.headers["Timezone-Val"] =
      Intl.DateTimeFormat().resolvedOptions().timeZone;
    const token = getAccessToken();
    if (token) {
      config.headers["authorization"] = `Bearer ${token}`;
      config.withCredentials = true;
    }
  }
  return config;
};

axios.interceptors.request.use(authRequestInterceptor);

export default axios;
