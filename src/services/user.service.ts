import {db} from "../prisma/db"
import { spotifyRequest } from "./axios.interceptor"


export const userService = {
 
   getPlaylist : async <T>(userId:number):Promise<T>=>{
    const user_id = await db.orm.public.User.select('spotifyId').where({id:userId})
    try {
      const response = spotifyRequest<T>(
        userId,
        `https://api.spotify.com/v1/users/${user_id}/playlists`,
        "post",
      );
   return response
    }
    catch (error:any){
      throw new Error("failed to retieve error",{cause:error})
      
    }
  }
}