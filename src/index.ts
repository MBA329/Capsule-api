import {app} from "./app.js"
import {env} from './config/env.js'
import {redis} from "../src/config/redis.js"


await redis.connect()
const port = env.PORT


app.listen(port,()=>{
  console.log(`server is running on http://localhost:${port}`)
})