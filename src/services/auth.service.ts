import { tokenResponse,userResponse } from "../types"
import axios, {AxiosResponse} from "axios";
import { db } from "../prisma/db";
import {redis} from "../config/redis"
import type {User}  from "../prisma/contract"


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
    let {email,display_name} = user.data
    if (!email || !display_name){
      console.error("no email or display name provided")
      return
    }
    console.log(JSON.stringify({
      email,
      display_name
    }))
    email = email.toLowerCase().trim()
    // const dbUser = await db.orm.public.User.where({ email })
    // .upsert({
    //   create: { 
    //     email, 
    //     username:display_name,
    //     refreshToken:refresh_token
    //   },
    //   // Keep empty if you only want to fetch existing users without altering them
    //   update: {refreshToken:refresh_token} 
    // });
    const existing = await db.orm.public.User.where({email}).first()
    if (existing){
      await db.orm.public.User.where({id:existing.id}).update({refreshToken:refresh_token})
      await redis.set(`user:${existing.id}`, access_token, {
        EX: expires_in,
      });
      return existing
    }
    const newUser = await db.orm.public.User.create({
      email,
      username:display_name,
      refreshToken:refresh_token
    })
  
    await redis.set(`user:${newUser.id}`,access_token,{
      EX:expires_in
    })
    return newUser
  }}
  
