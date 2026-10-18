import express from 'express'
import { login } from '../controllers/auth.controller'
import { requestToken } from '../controllers/auth.controller'

export const authRouter = express.Router()

authRouter.get('/login',login)
authRouter.get('/callback',requestToken)

