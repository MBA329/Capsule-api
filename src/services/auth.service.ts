import { tokenResponse,userResponse } from "../types"
import axios, {AxiosResponse} from "axios";
import { db } from "../prisma/db";
import {redis} from "../config/redis"


export const authServices = {
  login: async (data:tokenResponse)=>{
     const { access_token, expires_in, refresh_token } = data;
     const user: AxiosResponse = await axios.get("/v1/me", {
       headers: {
         Authorization: `Bearer ${access_token}`,
       },
     });
     const {email,username} = user.data
    const dbUser = db.orm.public.User.where({ email })
    .upsert({
    
      create: { 
        email, 
        username,
        refreshToken:refresh_token
      

      },
      // Keep empty if you only want to fetch existing users without altering them
      update: {} 
    });
     
  }}
  
