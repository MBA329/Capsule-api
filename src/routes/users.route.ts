import express from 'express'
import { showDashboard } from '../controllers/users.controller'
import { requireAuth } from '../middleware/auth.middleware'

export const userRouter = express.Router()

userRouter.get('/playlists',requireAuth,showDashboard)
