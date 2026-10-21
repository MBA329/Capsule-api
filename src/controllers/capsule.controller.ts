import express, {Request,Response,NextFunction} from 'express';
import { capsuleService } from '../services/capsule.service';
import { z } from "zod";

export const createCapsuleBody = z.object({
  revealDate:z.date().min(new Date(), { error: "date must be set to the future" }),
  name:z.string().min(3),
  ownerId:z.number().int().positive()
})

export type capsule = z.infer<typeof createCapsuleBody>

export const createCapsuleController = (req:Request,res:Response,next:NextFunction)=>{

  const id = req.params.id
  const result = createCapsuleBody.safeParse({...req.body,ownerId:id})

  if (!result.success ){
    res.status(400).json({error:"bad request",details:result.error.format})
     return
  }
 
  const response = capsuleService.createCapsule(result.data!)


}