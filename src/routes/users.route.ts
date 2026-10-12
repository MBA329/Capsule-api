import express from 'express'
import { showDashboard } from '../controllers/users.controller'

export const userRouter = express.Router()

userRouter.get('/users/:id',showDashboard)