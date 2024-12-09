import { Router } from "express";
const authRouter = Router();

authRouter.get("/login")
authRouter.post("/register")

export default authRouter;