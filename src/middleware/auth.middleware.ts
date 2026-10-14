import { Request,Response,NextFunction } from "express";
import {verifyToken} from '../config/jwt'

export async function requireAuth(req:Request,res:Response,next:NextFunction){

  const token = req.cookies?.access_token

  const valid = verifyToken(token)

  if (!token){
    return res.status(401).json({message:"unauthorized: no token provided"})
  }
  if (!valid){
   return res.status(403).json({message:"forbidded: invalid or expired token"})
  }

  req.user = valid
  next()
  
}