import {z} from 'zod'
import "dotenv/config";

const envSchema = z.object({
  PORT: z.coerce.number().default(3000),
  CLIENT_ID: z.string().min(8),
  CLIENT_SECRET: z.string().min(6),
  DATABASE_URL: z.string().min(6),
  JWT_SECRET: z.string().min(8),
  // API_URL: z.string().url().default("http://localhost:3000"),
  API_URL: z.url("http://localhost:3000"),
});

const parsed = envSchema.safeParse(process.env)

if (!parsed.success || parsed === undefined){
  console.log('invalid environment variables',parsed.error)  
  process.exit(1)
}


export const env =  parsed.data 
