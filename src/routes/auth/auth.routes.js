import { Router } from "express";
import { getUser, getUsers, login, register, updateName, updatePassword } from "../../controllers/auth.controller.js";
import { adminMiddleware, authMiddleware } from "../../middleware/auth.middleware.js";
import { validateRecaptcha } from "../../common/utils.js";
const authRouter = Router();

authRouter.post("/login", login);
authRouter.post("/register", validateRecaptcha, register);
authRouter.get('/users', adminMiddleware, getUsers);
authRouter.get('/user', authMiddleware, getUser);
authRouter.put('/update-password', authMiddleware, updatePassword);
authRouter.put('/update-name', authMiddleware, updateName);
export default authRouter;