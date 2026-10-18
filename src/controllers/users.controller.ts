import { Request,Response } from "express";
import { spotifyRequest } from "../services/axios.interceptor";


export const getPlaylistController = async (req:Request,res:Response)=>{
const userId = req?.user?.id

try {
}
catch (error){
console.error(error)
}

}