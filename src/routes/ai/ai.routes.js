import { Router } from "express";
import { authMiddleware } from "../../middleware/auth.middleware.js";
import { getAISuggestion } from "../../controllers/ai.controller.js";

const AIRouter = Router();

AIRouter.get("/getAISuggestion", authMiddleware, getAISuggestion);

export default AIRouter;