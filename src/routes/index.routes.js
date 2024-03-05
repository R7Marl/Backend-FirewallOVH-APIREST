import { Router } from "express";
import {
  getFirewallGame,
  addGameRule,
  enableGameFirewall,
} from "../controllers/game.controllers.js";
import { getFirewall, addFirewallRule } from "../controllers/fw.controllers.js";
import { validatorIP } from "../middleware/validations.middleware.js";
const router = Router();
//! --------------------------------------- Rutas firewall game --------------------------------------------------- //
router.get("/getfirewallgame", validatorIP, getFirewallGame);
router.post("/addgamerule", validatorIP, addGameRule);
router.put("/enablegamefirewall", validatorIP, enableGameFirewall);
//! --------------------------------------- Fin rutas firewall game ----------------------------------------------- //

//! -------------------------------------- Inicio rutas firewall -------------------------------------------------- //
router.get("/getfirewall", validatorIP, getFirewall);
router.post("/addfirewallrule", validatorIP, addFirewallRule);
//! --------------------------------------- Fin rutas firewall ----------------------------------------------- //
export default router;
