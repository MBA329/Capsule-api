import { db } from "../prisma/db";
import { spotifyRequest } from "./axios.interceptor";
import {items} from "../types"
import {createCapsuleBody , type capsule} from '../controllers/capsule.controller'


export const capsuleService = {
  createCapsule : async(body:capsule)=>{
    try {
const response = await spotifyRequest<{items:{name:string}[]}>(
  body.ownerId,
  "https://api.spotify.com/v1/me/top/artists","get",{params:{"limit:":"10","offset":"5","time_range":"short_term"}}
);

const artists:string[] = response.items.map((artist)=>artist.name)

const capsule = await db.orm.public.Capsule.create({
  ownerId:body.ownerId,
  title:body.name,
  artists,
  revealAt:body.revealDate
})
return capsule


    }
    catch(error:any){
      throw new Error("failed to retrieve artists",{cause:error})
    }

  }
}