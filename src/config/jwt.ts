import jwt from 'jsonwebtoken'
import { env } from './env'

interface tokenPayload  {
  userId:String,
  email:String
}

export const generateToken = (payload:tokenPayload):string =>{
return jwt.sign(payload,env.JWT_SECRET,{expiresIn:'7d'})


}

export const verifyToken = (token:string):tokenPayload|null{
  try{
    return jwt.verify(token,env.JWT_SECRET) as tokenPayload 
  }
  catch(error){return null}

}