import axios from "axios";
import type { AxiosInstance } from "axios";
import type { InternalAxiosRequestConfig,AxiosError } from "axios";
import { redis } from "../config/redis.js";




export const api: AxiosInstance = axios.create({
  baseURL: "https://api.spotify.com",
  timeout: 5000,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    
    return config;
  },
  (error: AxiosError): Promise<never> => {
    return Promise.reject(error);
  },
);


