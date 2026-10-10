import express from 'express'
import { getUserProfile } from '../controllers/users.controller'

export const userRouter = express.Router()

userRouter.get('/me',getUserProfile)