import { db } from "../prisma/db";
import { spotifyRequest } from "./axios.interceptor";


export const capsuleService = {
  createCapsule : async(userId:number,date:Date):Promise<void>=>{
   
    try {
const topArtists = await spotifyRequest(
  userId,
  "https://api.spotify.com/v1/me/top/artists","get"
);
    }
    catch(error:any){
      throw new Error("failed to retrieve artists",{cause:error})
    }

  }
}