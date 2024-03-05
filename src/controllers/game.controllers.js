import ovh from "ovh";
const client = ovh({
  endpoint: process.env.END_POINT,
  appKey: process.env.APP_KEY,
  appSecret: process.env.APP_SECRET,
  consumerKey: process.env.CONSUMER_KEY,
});
import { promisify } from "util";
client.re = promisify(client.request);

// Comienzo de rutas.

//! -------------------------------------------------- RUTAS DE FIREWALL GAME -------------------------------------------------------- //
export const getFirewallGame = async (req, res) => {
  const { ipBlock, IP } = req.body;
  let firewallGame = [];
  try {
    let getIP = await client.re(
      "GET",
      `/ip/${encodeURIComponent(ipBlock)}/game/${IP}/rule`
    );
    for (let i = 0; i < getIP.length; i++) {
      firewallGame.push(
        await client.re(
          "GET",
          `/ip/${encodeURIComponent(ipBlock)}/game/${IP}/rule/${getIP[i]}`
        )
      );
    }

    res.status(200).json({ firewallGame });
  } catch (error) {
    res.status(400).json({ code: "Error "+error})
  }
};

export const addGameRule = async (req, res) => {
  const { ipBlock, IP, startport, endport, protocol } = req.body;

  try {
    let postRule = await client.re(
      "POST",
      `/ip/${encodeURIComponent(ipBlock)}/game/${IP}/rule`,
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
    const { ipBlock, IP, gameMitigation } = req.body;

    try {
        await client.re('PUT', `/ip/${ipBlock}/game/${IP}`, {
            firewallModeEnabled: gameMitigation
        });
    res.status(200).json({ code: "Status game firewall is on: "+gameMitigation ? "ACTIVE" : "DISABLED"});
    } catch (error) {
    res.status(400).json({ code: `Error\n ${error}`});
    }
}
//! ------------------------------------------------- FIN FIREWALL GAME ------------------------------------------------------------ //
