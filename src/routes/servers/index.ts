import { Router } from "express";
import {
  getFirewallGame,
  addGameRule,
  enableGameFirewall,
  bulkDeleteGameRule,
} from "@/controllers/game.controllers.js";
import {
  getFirewall,
  addFirewallRule,
  deleteFirewallRule,
  deleteFirewallGameRule,
} from "../../controllers/fw.controllers.js";

import {
  createServer,
  deleteServer,
  getAllServers,
  getServerById,
  getServerByUser,
} from "@/controllers/servers";

import { adminMiddleware, authMiddleware } from "@/middlewares/auth";

import { getNetworkStatistics } from "@/controllers/network";

const router = Router();
//! --------------------------------------- Rutas firewall game --------------------------------------------------- //
router.get("/getfirewallgame", authMiddleware, getFirewallGame);
router.post("/addgamerule", authMiddleware, addGameRule);
router.put("/enablegamefirewall", authMiddleware, enableGameFirewall);
router.delete("/deletegamerule", authMiddleware, deleteFirewallGameRule);
router.delete("/bulkdeletefirewallrule", authMiddleware, bulkDeleteGameRule);
//! --------------------------------------- Fin rutas firewall game ----------------------------------------------- //

//! -------------------------------------- Inicio rutas firewall -------------------------------------------------- //
router.get("/getfirewall", authMiddleware, getFirewall);
router.post("/addfirewallrule", authMiddleware, addFirewallRule);
router.delete("/deletefirewallrule", authMiddleware, deleteFirewallRule);
//! --------------------------------------- Fin rutas firewall ----------------------------------------------- //

// Network

router.get("/getNetworkStatistics", authMiddleware, getNetworkStatistics);

// Admin

router.get("/getServerByUser", authMiddleware, getServerByUser);
router.get("/getServerById", authMiddleware, getServerById);
router.get("/allServers", adminMiddleware, getAllServers);
router.post("/createServer", adminMiddleware, createServer);
router.delete("/deleteServer", adminMiddleware, deleteServer);
export default router;
