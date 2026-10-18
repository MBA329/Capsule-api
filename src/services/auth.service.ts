import { tokenResponse, userResponse } from "../types";
import axios, { AxiosResponse } from "axios";
import { db } from "../prisma/db";
import { redis } from "../config/redis";
import type { Models } from "../prisma/contract";
import {Scalars} from "@prisma/orm-postgres/family-contract/types"


type userRow = Scalars<Models.public_User>;

export const authServices = {
  login: async (data: tokenResponse): Promise<userRow | undefined | Models.public_User> => {
    const { access_token, expires_in, refresh_token } = data;
    const user: AxiosResponse = await axios.get<userResponse>(
      "https://api.spotify.com/v1/me",
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      },
    );
    let { email, display_name } = user.data;
    if (!email || !display_name) {
      throw new Error("missing username or email");
    }

    email = email.toLowerCase().trim();
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
    let existing = await db.orm.public.User.where({ email }).first();
    if (existing !== null) {
      await redis.set(`user:${existing.id}`, access_token, {
        EX: expires_in,
      });
      existing = await db.orm.public.User.where({ id: existing.id }).update({
        refreshToken: refresh_token,
      });


      return existing !== null? existing : undefined;
    }
    try {
      const newUser = await db.orm.public.User.create({
        email,
        username: display_name,
        refreshToken: refresh_token,
      });

      await redis.set(`user:${newUser.id}`, access_token, {
        EX: expires_in,
      });
      return newUser;
    } catch (error) {
      console.error("something went wrong", error);
      return
    }
  },
};
