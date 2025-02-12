"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var game_controllers_1 = require("../../controllers/game.controllers");
var fw_controllers_1 = require("../../controllers/fw.controllers");
var servers_controller_1 = require("../../controllers/servers.controller");
var auth_middleware_1 = require("../../middleware/auth.middleware");
var network_controller_1 = require("../../controllers/network.controller");
var router = (0, express_1.Router)();
//! --------------------------------------- Rutas firewall game --------------------------------------------------- //
router.get("/getfirewallgame", auth_middleware_1.authMiddleware, game_controllers_1.getFirewallGame);
router.post("/addgamerule", auth_middleware_1.authMiddleware, game_controllers_1.addGameRule);
router.put("/enablegamefirewall", auth_middleware_1.authMiddleware, game_controllers_1.enableGameFirewall);
router.delete("/deletegamerule", auth_middleware_1.authMiddleware, fw_controllers_1.deleteFirewallGameRule);
router.delete("/bulkdeletefirewallrule", auth_middleware_1.authMiddleware, game_controllers_1.bulkDeleteGameRule);
//! --------------------------------------- Fin rutas firewall game ----------------------------------------------- //
//! -------------------------------------- Inicio rutas firewall -------------------------------------------------- //
router.get("/getfirewall", auth_middleware_1.authMiddleware, fw_controllers_1.getFirewall);
router.post("/addfirewallrule", auth_middleware_1.authMiddleware, fw_controllers_1.addFirewallRule);
router.delete("/deletefirewallrule", auth_middleware_1.authMiddleware, fw_controllers_1.deleteFirewallRule);
//! --------------------------------------- Fin rutas firewall ----------------------------------------------- //
// Network
router.get("/getNetworkStatistics", auth_middleware_1.authMiddleware, network_controller_1.getNetworkStatistics);
// Admin
router.get("/getServerByUser", auth_middleware_1.authMiddleware, servers_controller_1.getServerByUser);
router.get("/getServerById", auth_middleware_1.authMiddleware, servers_controller_1.getServerById);
router.get("/allServers", auth_middleware_1.adminMiddleware, servers_controller_1.getAllServers);
router.post("/createServer", auth_middleware_1.adminMiddleware, servers_controller_1.createServer);
router.delete("/deleteServer", auth_middleware_1.adminMiddleware, servers_controller_1.deleteServer);
exports.default = router;
