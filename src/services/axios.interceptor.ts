import axios from "axios";
import type { AxiosInstance } from "axios";
import type { InternalAxiosRequestConfig,AxiosError } from "axios";
import { getSpotifyAccessToken,refreshSpotifyAccessToken } from "./spotify-token.service.js";


export interface SpotifyRequestConfig extends InternalAxiosRequestConfig{
  capsuleUserId:number;
  _spotifyRetry:boolean;
}

export const api: AxiosInstance = axios.create({
  baseURL: "https://api.spotify.com",
  timeout: 5000,
  headers: {
    "Content-Type": "application/json",
  },
});

export async function spotifyGet<T>(
  userId:number,
  path:string,
  params?:Record<string,string|number|boolean>
):Promise<T>{
  const accessToken = await getSpotifyAccessToken(userId);

  const response = await api.get<T>(path,{
    params,
    headers:{
      Authorization: `Bearer ${accessToken}`
    },
    capsuleUserId:userId,
  } as SpotifyRequestConfig)
return response.data
}


api.interceptors.response.use(
  (response) => response,
  async (error:AxiosError) => {
    const originalRequest = error.config as SpotifyRequestConfig | undefined;
    const userId = originalRequest?.capsuleUserId;

    if (
      error.response?.status !== 401 ||
      !originalRequest ||
      userId === undefined ||
      originalRequest._spotifyRetry
    ){
      return Promise.reject(error);
    }
    originalRequest._spotifyRetry = true;
    try {
      const accessToken = await refreshSpotifyAccessToken(userId);
      originalRequest.headers.set("Authorization", `Bearer ${accessToken}`);
      return await api.request(originalRequest)
    }
    catch (refreshError){
      return Promise.reject(refreshError)
    }
  }
)

