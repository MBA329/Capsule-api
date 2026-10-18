import { userService } from "../services/user.service";
import { Request,Response } from "express";
import { spotifyRequest } from "../services/axios.interceptor";
import { api } from "../services/axios.interceptor";
import {db} from "../prisma/db"


export const getPlaylistController = async (req:Request,res:Response)=>{
const userId = req?.user?.id

try {
const response = await spotifyRequest(userId,'/v1/playlists/')
}
catch (error){

}

}