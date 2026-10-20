import {db} from "../prisma/db"
import { spotifyRequest } from "./axios.interceptor"
import querystring from "node:querystring";


export const userService = {
 
   getPlaylist : async <T>(userId:number):Promise<T>=>{
    try {
      const response = await spotifyRequest<T>(
        userId,
        `https://api.spotify.com/v1/me/playlists`,
        "get",
      );
   return response
    }
    catch (error:any){
      throw new Error("failed to retieve error",{cause:error})
      
    }
  }
}