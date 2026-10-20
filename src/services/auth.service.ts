import { tokenResponse, userResponse } from "../types";
import axios, { AxiosResponse } from "axios";
import { db } from "../prisma/db";
import type { Models } from "../prisma/contract";
import {Scalars} from "@prisma/orm-postgres/family-contract/types";
import { cacheSpotifyAccessToken } from "./spotify-token.service";


type userRow = Scalars<Models.public_User>;

export const authServices = {
  login: async (data: tokenResponse): Promise<userRow | undefined | Models.public_User> => {
   
    try {
       const { access_token, expires_in, refresh_token } = data;
       const user: AxiosResponse = await axios.get<userResponse>(
         "https://api.spotify.com/v1/me",
         {
           headers: {
             Authorization: `Bearer ${access_token}`,
           },
         },
       );
      console.log(user)
       let { email, display_name, id } = user.data;
       if (!email || !display_name) {
         throw new Error("missing username or email");
       }

       email = email.toLowerCase().trim();

       let existing = await db.orm.public.User.where({ email }).first();

       if (existing !== null) {
         await cacheSpotifyAccessToken(existing.id, access_token, expires_in);
         existing = await db.orm.public.User.where({ id: existing.id }).update({
           refreshToken: refresh_token,
         });

         return existing !== null ? existing : undefined;
       }
      const newUser = await db.orm.public.User.create({
        email,
        username: display_name,
        refreshToken: refresh_token
      });

      
       await cacheSpotifyAccessToken(newUser.id, access_token, expires_in);
      return newUser;
    } catch (error) {
      console.error("failed to persist user", error);
      throw new Error("failed to persist user",{cause:error})
    }
  },
};
