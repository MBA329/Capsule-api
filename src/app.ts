import express, { Request, Response } from "express";
import { db } from "./prisma/db";
import { authRouter } from "./routes/auth.route";
import { userRouter } from "./routes/users.route";

export const app = express();
app.use(express.json());
const appRouter = express.Router();

app.get("/health", async (_req: Request, res: Response) => {
  try {
    await db.orm.public.User.select("id").limit(1).all();

    res.json({ status: "ok", db: "up" });
  } catch (error) {
    console.error("health probe failed", error);
    res.status(503).json({ status: "down", db: "down" });
  }
});

app.get("/", (req: Request, res: Response) => {
  res.json({ message: "app is now running" });
});

appRouter.use("/auth", authRouter);
appRouter.use("/users",userRouter)
app.use("/", appRouter);

