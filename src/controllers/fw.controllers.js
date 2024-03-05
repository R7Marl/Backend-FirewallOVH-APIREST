import ovh from "ovh";
const client = ovh({
    endpoint: process.env.END_POINT,
    appKey: process.env.APP_KEY,
    appSecret: process.env.APP_SECRET,
    consumerKey: process.env.CONSUMER_KEY,
  });
import { promisify } from "util";
client.re = promisify(client.request);

//! ------------------------------------------------- FIREWALL --------------------------------------------------------------------- //

export const getFirewall = async (req, res) => {
  const { ipBlock, IP } = req.body;
  let firewall = [];
  try {
    let get = await client.re(
      "GET",
      `/ip/${encodeURIComponent(ipBlock)}/firewall/${IP}/rule`
    );
    for (let i = 0; i < get.length; i++) {
      firewall.push(
        await client.re(
          "GET",
          `/ip/${encodeURIComponent(ipBlock)}/firewall/${IP}/rule/${get[i]}`
        )
      );
    }
    res.status(200).json({ firewall });
  } catch (error) {
    res.status(400).json({ code: error });
  }
};

export const addFirewallRule = async (req, res) => {
  const {
    ipBlock,
    IP,
    action,
    sequence,
    destination,
    protocol,
    sourceip,
    sorceport,
  } = req.body;

  try {
    await client.re(
      "POST",
      `/ip/${encodeURIComponent(ipBlock)}/firewall/${IP}/rule`,
      {
        action: action,
        destinationPort: destination,
        protocol: protocol,
        sequence: sequence,
        source: sourceip,
        sourcePort: sorceport,
        tcpOption: null,
      }
    );
    res.status(200).json({ code: "Successfully rule added!" });
  } catch (error) {
    res.status(400).json({ code: error });
  }
};

//! ------------------------------------------------- FIN FIREWALL --------------------------------------------------------------------- //
