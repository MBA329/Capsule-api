import {db} from "./db.js";

async function main(){
  const email = "dev@capsule.local";

  let user = await db.orm.public.User.where({email}).
  first();
  if (!user){
user = await db.orm.public.User.create({email,username:"dev",refreshToken:""});
console.log("created user:",user.id);
  }
  else {
    console.log("user exists:",user.id)
  }
  const existing = await db.orm.public.Capsule.where((c)=>
  c.ownerId.eq(user.id))
  .limit(1)
  .all();

  if (existing.length === 0){
    const capsule = await db.orm.public.Capsule.create({
      title:"First Capsule",
      content:"hello from seed",
      ownerId:user.id,
    })
     console.log("created capsule", capsule.id);
  }
  else{
    console.log("capsule exists",existing[0]!.id)
  }
  await db.close()
 
}
main().catch(async (e)=>{
  console.error(e);
  await db.close();
  process.exit(1);
})