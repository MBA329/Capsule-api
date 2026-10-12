import express, { Request, Response } from "express";
import querystring from "node:querystring";
import { env } from "../config/env";
import axios from "axios";
import { redis } from "../config/redis";
import { api } from "../services/axios.interceptor";
import {authServices} from "../services/auth.service"

function generateRandomString(length: number) {
  const alphabet =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  return Array.from({ length }, () => {
    let randomIndex = Math.floor(Math.random() * alphabet.length);
    return alphabet.charAt(randomIndex);
  }).join("");
}
// async function getToken() {
//   try {
//     return await redis.get("access_token");
//   } catch (error) {
//     throw new Error("failed to fetch");
//   }
// }


export const login = async (req: Request, res: Response) => {
  var state = generateRandomString(16);
  var scope = "user-read-private user-read-email";

  // try {
  //   await redis.set("state", state);
  // } catch (error) {
  //   console.error("failed to connect to redis server", error);
  // }

  res.redirect(
    "https://accounts.spotify.com/authorize?" +
      querystring.stringify({
        state: state,
        scope: scope,
        client_id: env.CLIENT_ID,
        redirect_uri: "http://127.0.0.1:3000/auth/callback",
        response_type: "code",
      }),
  );
};

export const requestToken = async (req: Request, res: Response) => {
  const code = (req.query.code as string) || null;
  const state = req.query.state || null;

  if (!state || req.query.error || !code) {
    res.redirect("http://localhost:3000/login?error=no_code");
    return res.json({
      message: "couldn't authenticate",
    });
  }
 
  try {
    const tokenResponse = await axios.post(
      "https://accounts.spotify.com/api/token",
      new URLSearchParams({
        code: code,
        redirect_uri: "http://127.0.0.1:3000/auth/callback",
        grant_type: "authorization_code",
      }),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization:
            "Basic " + Buffer.from(env.CLIENT_ID + ":" + env.CLIENT_SECRET).toString('base64'),
        },
      },
    );

    await authServices.login(tokenResponse.data)

    // res.cookie(key, access_token, {
    //   sameSite: "lax",
    //   httpOnly: true,
    //   maxAge: expires_in,
    // });

  
  } catch (error) {
    console.error("failed to fetch token", error);
  }
  return res.json({message:"authentication successful"})
};
