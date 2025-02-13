import { Router } from "express";
import { getUser, getUsers, login, register, updateName, updatePassword } from "../../controllers/auth.controller";
import { adminMiddleware, authMiddleware } from "../../middleware/auth.middleware";
import { validateRecaptcha } from "../../common/utils";
const authRouter = Router();

authRouter.post("/login", login);
authRouter.post("/register", register);
authRouter.get('/users', adminMiddleware, getUsers);
authRouter.get('/user', authMiddleware, getUser);
authRouter.put('/update-password', authMiddleware, updatePassword);
authRouter.put('/update-name', authMiddleware, updateName);
export default authRouter;