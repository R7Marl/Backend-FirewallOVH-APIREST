import { Router } from "express";
import {
  getFirewallGame,
  addGameRule,
  enableGameFirewall,
} from "../../controllers/game.controllers.js";
import { getFirewall, addFirewallRule, deleteFirewallRule, deleteFirewallGameRule } from "../../controllers/fw.controllers.js";
import { validatorIP } from "../../middleware/validations.middleware.js";
import { createServer, deleteServer, getAllServers, getServerById, getServerByUser } from "../../controllers/servers.controller.js";
import { adminMiddleware, authMiddleware } from "../../middleware/auth.middleware.js";
import Server from "../../models/Server.js";
const router = Router();
//! --------------------------------------- Rutas firewall game --------------------------------------------------- //
router.get("/getfirewallgame", getFirewallGame);
router.post("/addgamerule", authMiddleware, addGameRule);
router.put("/enablegamefirewall", authMiddleware, enableGameFirewall);
router.delete("/deletegamerule", authMiddleware, deleteFirewallGameRule);
//! --------------------------------------- Fin rutas firewall game ----------------------------------------------- //

//! -------------------------------------- Inicio rutas firewall -------------------------------------------------- //
router.get("/getfirewall", authMiddleware, getFirewall);
router.post("/addfirewallrule", authMiddleware, addFirewallRule);
router.delete("/deletefirewallrule", authMiddleware, deleteFirewallRule);
//! --------------------------------------- Fin rutas firewall ----------------------------------------------- //

router.get("/getServerByUser", authMiddleware, getServerByUser);
router.get("/getServerById", authMiddleware, getServerById);
router.get("/allServers", adminMiddleware, getAllServers);
router.post("/createServer", adminMiddleware, createServer);
router.delete("/deleteServer", adminMiddleware, deleteServer);
export default router;