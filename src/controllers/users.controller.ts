import { userService } from "../services/user.service";
import { Request,Response } from "express";
import { api } from "../services/axios.interceptor";
import {db} from "../prisma/db"


export const showDashboard = async (req:Request,res:Response)=>{
const id = Number(req.params.id)
try{
 const user =  db.orm.public.User.where({id:id})
  console.log(user);
  return res.status(200).json({user})
 
}
 
 catch (error){
  return res.status(404).json("user could not be found") 
 }
}