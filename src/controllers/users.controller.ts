import { Request,Response } from "express";
import { spotifyRequest } from "../services/axios.interceptor";


export const getPlaylistController = async (req:Request,res:Response)=>{
const userId = req?.user?.id

try {
const response = await spotifyRequest(Number(userId),`/v1/users/${userId}/playlists`,"get")
return res.status(200).json(response)
}
catch (error){
console.error(error)
}

}