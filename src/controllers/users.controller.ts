import { Request,Response } from "express";
import { userService } from "../services/user.service";

export const getPlaylistController = async (req:Request,res:Response)=>{
const userId = req?.user?.id as string

try {
  const response = await userService.getPlaylist(Number(userId))
  if (!response){
    return res.json({message:"user unavailable"})
  }
  return res.json(response)
  
}
catch (error:any){
console.error(error)

return res.status(404).json({ message: "failed to get playlists" });
  
}

}