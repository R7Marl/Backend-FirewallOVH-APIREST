"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var auth_middleware_1 = require("../../middleware/auth.middleware");
var ai_controller_1 = require("../../controllers/ai.controller");
var AIRouter = (0, express_1.Router)();
AIRouter.get("/getAISuggestion", auth_middleware_1.authMiddleware, ai_controller_1.getAISuggestion);
exports.default = AIRouter;
