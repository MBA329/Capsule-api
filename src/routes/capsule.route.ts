import express, {Request,Response} from 'express';
import { requireAuth } from '../middleware/auth.middleware';
import { createCapsuleController } from '../controllers/capsule.controller';


export const capsuleRouter = express.Router()

capsuleRouter.post('/createCapsule',createCapsuleController)
capsuleRouter.delete('/deleteCapsule/:id',deleteCapsuleController)