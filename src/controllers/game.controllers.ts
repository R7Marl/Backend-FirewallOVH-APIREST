import ovh from "ovh";
import { Request, Response } from "express";
import Server, { ServerAttributes } from "../models/Server.js";
import { promisify } from "util";
import { sleep } from "../common/utils.js";

const client = ovh({
  endpoint: process.env.END_POINT,
  appKey: process.env.APP_KEY,
  appSecret: process.env.APP_SECRET,
  consumerKey: process.env.CONSUMER_KEY,
});
client.re = promisify(client.request);

export const getFirewallGame = async (req: Request, res: Response): Promise<void> => {
  const serverId = req.query.serverId as string;
  try {
    const server = await Server.findByPk(serverId) as ServerAttributes | null;
    if (!server) {
      res.status(404).json({ code: "Server not found" });
      return;
    }

    const { ipBlock, ip } = server;
    try {
      let firewallGame: any[] = [];
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
    } catch (error: any) {
      res.status(400).json({ code: "Error " + error });
    }
  } catch (error: any) {
    res.status(500).json({ code: `Error fetching server: ${error.message}` });
  }
};

export const addGameRule = async (req: Request, res: Response): Promise<void> => {
  const serverId = req.query.serverId as string;
  const { startport, endport, protocol } = req.body;
  try {
    const server = await Server.findOne({ where: { id: serverId } }) as ServerAttributes | null;
    if (!server) {
      res.status(404).json({ code: "Server not found" });
      return;
    }

    const { ipBlock, ip } = server;
    try {
      await client.re(
        "POST",
        `/ip/${encodeURIComponent(ipBlock)}/game/${ip}/rule`,
        {
          ports: { from: startport, to: endport },
          protocol: protocol,
        }
      );
      res.status(200).json({ code: "Successfully Added Rule" });
    } catch (error: any) {
      res.status(400).json({ code: `Error\n ${error}` });
    }
  } catch (error: any) {
    res.status(500).json({ code: `Error fetching server: ${error.message}` });
  }
};

export const enableGameFirewall = async (req: Request, res: Response): Promise<void> => {
  const serverId = req.query.serverId as string;
  const { gameMitigation } = req.body;

  try {
    const server = await Server.findOne({ where: { id: serverId } }) as ServerAttributes | null;
    if (!server) {
      res.status(404).json({ code: "Server not found" });
      return;
    }

    const { ipBlock, ip } = server;
    await client.re('PUT', `/ip/${ipBlock}/game/${ip}`, {
      firewallModeEnabled: gameMitigation
    });
    res.status(200).json({ code: `Status game firewall is on: ${gameMitigation ? "ACTIVE" : "DISABLED"}` });
  } catch (error: any) {
    res.status(400).json({ code: `Error\n ${error}` });
  }
};

export const bulkDeleteGameRule = async (req: Request, res: Response): Promise<void> => {
  const { serverId } = req.query as { serverId: string };
  if (!serverId) {
    res.status(400).json({ code: "ServerId is required" });
    return;
  }
  if (!req.body) {
    res.status(400).json({ code: "Rules are required" });
    return;
  }

  try {
    const server = await Server.findOne({ where: { id: serverId } }) as ServerAttributes | null;
    if (!server) {
      res.status(404).json({ code: "Server not found" });
      return;
    }

    const { ipBlock, ip } = server;
    const rules = req.body;
    for (let i = 0; i < rules.length; i++) {
      await client.re('DELETE', `/ip/${encodeURIComponent(ipBlock)}/game/${ip}/rule/${rules[i]}`);
      await sleep(1500);
    }

    res.status(200).json({ code: "Successfully Deleted Selected Rules" });
  } catch (error: any) {
    res.status(400).json({ code: `Error\n ${error}` });
  }
};