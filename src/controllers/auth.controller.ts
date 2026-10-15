import express, { Request, Response } from "express";
import querystring from "node:querystring";
import { env } from "../config/env";
import axios from "axios";
import {authServices} from "../services/auth.service"
import { generateToken } from "../config/jwt";


function generateRandomString(length: number) {
  const alphabet =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  return Array.from({ length }, () => {
    let randomIndex = Math.floor(Math.random() * alphabet.length);
    return alphabet.charAt(randomIndex);
  }).join("");
}


export const login = async (req: Request, res: Response) => {
  
  var scope = "user-read-private user-read-email";
  req.app.locals.state = generateRandomString(16);

  res.redirect(
    "https://accounts.spotify.com/authorize?" +
      querystring.stringify({
        state: req.app.locals.state,
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

  if (!state || req.query.error || !code || state != req.app.locals.state) {
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

   const user =  await authServices.login(tokenResponse.data)
   if (user){
   const access_token = generateToken({ id: user.id.toString(), email: user.email });
    res.cookie("auth_token", access_token, {
      sameSite: "lax",
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
   }

    

  return res.status(200).json({message:"user authenticated"})
  } catch (error) {
    res.status(500).json({error:"internal server error"})
    console.error("failed to fetch token", error);
  }
  return res.json({message:"authentication successful"})
};
