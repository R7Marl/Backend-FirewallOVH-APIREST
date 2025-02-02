import ovh from "ovh";
const client = ovh({
  endpoint: process.env.END_POINT,
  appKey: process.env.APP_KEY,
  appSecret: process.env.APP_SECRET,
  consumerKey: process.env.CONSUMER_KEY,
});
import { promisify } from "util";
client.re = promisify(client.request);
import Server from "../models/Server.js";
import { sleep } from "../common/utils.js";

// Comienzo de rutas.

//! -------------------------------------------------- RUTAS DE FIREWALL GAME -------------------------------------------------------- //
export const getFirewallGame = async (req, res) => {
  const serverId = req.query.serverId;
  const { ipBlock, ip } = await Server.findByPk(serverId);
  let firewallGame = [];
  try {
    let getIP = await client.re(
      "GET",
      `/ip/${encodeURIComponent(ipBlock)}/game/${ip}/rule`
    );
    for (let i = 0; i < getIP.length; i++) {
      firewallGame.push(
        await client.re(
          "GET",
          `/ip/${encodeURIComponent(ipBlock)}/game/${ip}/rule/${getIP[i]}`
        )
      );
    }
    res.status(200).json(firewallGame);
  } catch (error) {
    res.status(400).json({ code: "Error "+error})
  }
};

export const addGameRule = async (req, res) => {
  const serverId = req.query.serverId;
  const { startport, endport, protocol } = req.body;
  const { ipBlock, ip } = await Server.findOne({ where: { id: serverId } });
  try {
    let postRule = await client.re(
      "POST",
      `/ip/${encodeURIComponent(ipBlock)}/game/${ip}/rule`,
      {
        ports: { from: startport, to: endport },
        protocol: protocol,
      }
    );
    res.status(200).json({ code: "Successfully Added Rule" });
  } catch (error) {
    res.status(400).json({ code: `Error\n ${error}`});
  }
};
export const enableGameFirewall = async (req, res) => {
    const serverId = req.query.serverId;
    const { ipBlock, ip } = await Server.findOne({ where: { id: serverId } });
    const { gameMitigation } = req.body;

    try {
        await client.re('PUT', `/ip/${ipBlock}/game/${ip}`, {
            firewallModeEnabled: gameMitigation
        });
    res.status(200).json({ code: "Status game firewall is on: "+gameMitigation ? "ACTIVE" : "DISABLED"});
    } catch (error) {
    res.status(400).json({ code: `Error\n ${error}`});
    }
}

export const bulkDeleteGameRule = async (req, res) => {
  const { serverId } = req.query;
  if (!serverId) return res.status(400).json({ code: "ServerId is required" });
  if (!req.body) return res.status(400).json({ code: "Rules are required" });
  try { 
    const { ipBlock, ip } = await Server.findOne({ where: { id: serverId } });
    const rules = req.body;
    for(let i = 0; i < rules.length; i++) {
      await client.re('DELETE', `/ip/${encodeURIComponent(ipBlock)}/game/${ip}/rule/${rules[i]}`);
      sleep(1500);
    } 
    res.status(200).json({ code: "Successfully Deleted Selected Rules" });
  } catch (error) {
    res.status(400).json({ code: `Error\n ${error}`});
  }
}
//! ------------------------------------------------- FIN FIREWALL GAME ------------------------------------------------------------ //
