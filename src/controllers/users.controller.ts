import { userService } from "../services/user.service";
import { Request,Response } from "express";
import { api } from "../services/axios.interceptor";

export const getUserProfile = async (req:Request,res:Response)=>{
 try {
  const response = await api.get('/v1/me')
  userService.createProfile(response.data)
  return res.status(200).json(response.data)
  
 }
 catch(error){
  res.status(500).json({message:"error getting profile"})
  console.error("failed to load user data",error)
 }
}