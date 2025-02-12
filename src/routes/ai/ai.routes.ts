import { Router } from "express";
import { authMiddleware } from "../../middleware/auth.middleware";
import { getAISuggestion } from "../../controllers/ai.controller";

const AIRouter = Router();

AIRouter.get("/getAISuggestion", authMiddleware, getAISuggestion);

export default AIRouter;