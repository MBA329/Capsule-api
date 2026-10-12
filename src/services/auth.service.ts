import { tokenResponse,userResponse } from "../types"
import axios, {AxiosResponse} from "axios";
import { db } from "../prisma/db";
import {redis} from "../config/redis"
import User  from "../prisma/contract"


export const authServices = {
  login: async (data:tokenResponse):Promise<User>=>{
     const { access_token, expires_in, refresh_token } = data;
     const user: AxiosResponse = await axios.get(
       "https://api.spotify.com/v1/me",
       {
         headers: {
           Authorization: `Bearer ${access_token}`,
         },
       },
     );
    const {email,display_name} = user.data
    const dbUser = await db.orm.public.User.where({ email })
    .upsert({
    
      create: { 
        email, 
        username:display_name,
        refreshToken:refresh_token
      },
      // Keep empty if you only want to fetch existing users without altering them
      update: {refreshToken:refresh_token} 
    });
     const userId =  dbUser.id 
    await redis.set(`user ${userId}`,access_token,{
      EX:expires_in
    })
    return dbUser
  }}
  
