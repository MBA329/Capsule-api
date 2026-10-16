import axios , {AxiosError} from 'axios';
import {z} from 'zod';
import {db} from '../prisma/db'
import {redis} from '../config/redis'
import {env} from '../config/env'

const spotifyRefreshResponseSchema = z.object({
  access_token: z.string().min(1),
  refresh_token:z.string().min(1),
  expires_in:z.number().int().positive()
})

export class SpotifyAuthError extends Error{
  retryable:boolean;
  reauthenticationRequired:boolean;

  constructor(message:string,
    options:{reauthenticationRequired:boolean;retryable:boolean}
  ){
    super(message);
    this.name = "SpotifyAuthError";
    this.reauthenticationRequired = options.reauthenticationRequired;
    this.retryable = options.retryable
  }
}

const refreshPromises = new Map<number,Promise<string>>();

function accessTokenKey(userId:number):string{
  return `spotify:access-token${userId}`;
}

function cacheTtlSeconds(expiresIn:number):number{
  return Math.max(expiresIn - 30, 1)
}

export const cacheSpotifyAccessToken = async(
  userId:number,
  accessToken:string,
  expiresIn:number,
):Promise<void>=>{
await redis.set(accessTokenKey(userId),accessToken,{EX:cacheTtlSeconds(expiresIn)})

}

export const getSpotifyAccessToekn = async(userId:number):Promise<string>=>{
  const cached =  await redis.get(accessTokenKey(userId))
  if (cached) {return cached;}

  return refreshSpotifyAccessToken(userId)
}

export function refreshSpotifyAccessToken(userId:number):Promise<string>{
const inFlight = refreshPromises.get(userId);
if (inFlight){
  return inFlight
}

const refreshPromise = renewSpotifyAccessToken(userId).finally(()=>{
  if (refreshPromises.get(userId) === refreshPromise){
    refreshPromises.delete(userId)
  }
})
refreshPromises.set(userId,refreshPromise)
}

async function renewSpotifyAccessToken(userId:number):Promise<string>{
  const user = await db.orm.public.User.where({id:userId}).first()
  const refreshToken = user?.refreshToken;

  if (!refreshToken){
    throw new SpotifyAuthError("Spotify authorization is missing; the user must log in again",{reauthenticationRequired:true,retryable:false})
  }

  let response;
  try{

  }
}
