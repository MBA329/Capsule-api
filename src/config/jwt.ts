import jwt from 'jsonwebtoken'

interface tokenPayload  {
  userId:String,
  email:String
}

export const generateToken = (payload:tokenPayload):string | null{



}

export const verifyToken = (){
  
}