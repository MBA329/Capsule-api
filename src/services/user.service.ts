import {db} from "../prisma/db"
import { spotifyRequest } from "./axios.interceptor"
import querystring from "node:querystring";


export const userService = {
 
   getPlaylist : async <T>(userId:number):Promise<T>=>{
    try {
    const users = await db.orm.public.User.select("spotifyId").where({
      id: userId,
    }).first();
    
    if (!users){
      throw new Error("user cannot be found")
    }
      const spotifyId = users?.spotifyId;
     

      const response = spotifyRequest<T>(
        userId,
        `https://api.spotify.com/v1/users/${spotifyId}/playlists`,
        "get",
      );
   return response
    }
    catch (error:any){
      throw new Error("failed to retieve error",{cause:error})
      
    }
  }
}