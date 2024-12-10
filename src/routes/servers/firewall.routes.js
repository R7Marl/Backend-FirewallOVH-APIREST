import { Router } from "express";
import {
  getFirewallGame,
  addGameRule,
  enableGameFirewall,
} from "../../controllers/game.controllers.js";
import { getFirewall, addFirewallRule } from "../../controllers/fw.controllers.js";
import { validatorIP } from "../../middleware/validations.middleware.js";
import { authMiddleware } from "../../middleware/auth.middleware.js";
const router = Router();
//! --------------------------------------- Rutas firewall game --------------------------------------------------- //
router.get("/getfirewallgame", authMiddleware, validatorIP, getFirewallGame);
router.post("/addgamerule", authMiddleware, validatorIP, addGameRule);
router.put("/enablegamefirewall", authMiddleware, validatorIP, enableGameFirewall);
//! --------------------------------------- Fin rutas firewall game ----------------------------------------------- //

//! -------------------------------------- Inicio rutas firewall -------------------------------------------------- //
router.get("/getfirewall", authMiddleware, validatorIP, getFirewall);
router.post("/addfirewallrule", authMiddleware, validatorIP, addFirewallRule);
//! --------------------------------------- Fin rutas firewall ----------------------------------------------- //
export default router;