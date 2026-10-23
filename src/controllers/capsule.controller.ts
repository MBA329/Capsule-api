import express, {Request,Response,NextFunction} from 'express';
import { capsuleService } from '../services/capsule.service';
import { z } from "zod";

export const createCapsuleBody = z.object({
  revealDate: z.iso
    .datetime()
    .refine((s) => new Date(s) > new Date(), {
      error: "date must be set to the future",
    }),
  name: z.string().min(3),
  ownerId: z.coerce.number().int().positive(),
});

export type capsule = z.infer<typeof createCapsuleBody>

export const createCapsuleController = async (req:Request,res:Response,next:NextFunction)=>{

  try {
const id = req.user?.id;
const result = createCapsuleBody.safeParse({ ...req.body, ownerId: id });
console.log(result,createCapsuleBody)

if (!result.success) {
  res.status(400).json({ error: "bad request", details: result.error.format });

  return;
}

const response = await capsuleService.createCapsule(result.data!);
return res.status(200).json(response)
  }
  
catch (error){
console.error(error)
}

}

export const deleteCapsuleController = ()=>{

}