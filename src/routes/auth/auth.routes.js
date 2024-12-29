import { Router } from "express";
import { getUsers, login, register, updatePassword } from "../../controllers/auth.controller.js";
import { adminMiddleware, authMiddleware } from "../../middleware/auth.middleware.js";
const authRouter = Router();

authRouter.post("/login", login);
authRouter.post("/register", register);
authRouter.get('/users', adminMiddleware, getUsers);
authRouter.put('/update-password', authMiddleware, updatePassword);
export default authRouter;