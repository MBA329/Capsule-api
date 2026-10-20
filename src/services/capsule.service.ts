import { db } from "../prisma/db";
import { spotifyRequest } from "./axios.interceptor";
import {items} from "../types"


export const capsuleService = {
  createCapsule : async(userId:number,date:Date,title:string)=>{
   
    try {
const response = await spotifyRequest<{items:{name:string}[]}>(
  userId,
  "https://api.spotify.com/v1/me/top/artists","get",{params:{"limit:":"10","offset":"5","time_range":"short_term"}}
);

const artists:string[] = response.items.map((artist)=>artist.name)

const capsule = await db.orm.public.Capsule.create({
  ownerId:userId,
  title:title,
  artists,
  revealAt:date
})
return capsule


    }
    catch(error:any){
      throw new Error("failed to retrieve artists",{cause:error})
    }

  }
}