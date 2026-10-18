import express from 'express'
import { getPlaylistController } from '../controllers/users.controller'
import { requireAuth } from '../middleware/auth.middleware'

export const userRouter = express.Router()

userRouter.get('/playlists',requireAuth,getPlaylistController)
