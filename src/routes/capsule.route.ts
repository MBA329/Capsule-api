import express, {Request,Response} from 'express';
import { requireAuth } from '../middleware/auth.middleware';
import { createCapsuleController,deleteCapsuleController } from '../controllers/capsule.controller';


export const capsuleRouter = express.Router()

capsuleRouter.post('/createCapsule',requireAuth,createCapsuleController)
capsuleRouter.delete('/deleteCapsule/:id',deleteCapsuleController)