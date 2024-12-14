import { Router } from "express";
import { getUsers, login, register } from "../../controllers/auth.controller.js";
import { adminMiddleware } from "../../middleware/auth.middleware.js";
const authRouter = Router();

authRouter.post("/login", login);
authRouter.post("/register", register);
authRouter.get('/users', adminMiddleware, getUsers);
export default authRouter;