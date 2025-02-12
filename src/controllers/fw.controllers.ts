import ovh from 'ovh';
import { Request, Response } from 'express';
import Server from '../models/Server';
import { AddFirewallRuleBody, BulkDeleteFirewallRulesBody } from '../common/types';
const client = ovh({
  endpoint: process.env.END_POINT,
  appKey: process.env.APP_KEY,
  appSecret: process.env.APP_SECRET,
  consumerKey: process.env.CONSUMER_KEY,
});

import { promisify } from 'util';
client.re = promisify(client.request);

//! ------------------------------------------------- FIREWALL --------------------------------------------------------------------- //

export const getFirewall = async (req: Request, res: Response): Promise<void> => {
  const { serverId } = req.query as { serverId: string };
  if (!serverId) {
    res.status(400).json({ code: 'ServerId is required' });
    return;
  }

  try {
    const server = await Server.findOne({ where: { id: serverId } });
    if (!server) {
      res.status(404).json({ code: 'Server not found' });
      return;
    }

    const ipBlock = server.ipBlock;
    const IP = server.ip;
    let firewall: any[] = [];
    
    const get = await client.re(
      'GET',
      `/ip/${encodeURIComponent(ipBlock)}/firewall/${IP}/rule`
    );
    for (let i = 0; i < get.length; i++) {
      firewall.push(
        await client.re(
          'GET',
          `/ip/${encodeURIComponent(ipBlock)}/firewall/${IP}/rule/${get[i]}`
        )
      );
    }
    res.status(200).json(firewall);
  } catch (error: any) {
    res.status(400).json({ code: error.message });
  }
};

export const addFirewallRule = async (req: Request, res: Response): Promise<void> => {
  const { action, sequence, destination, protocol, sourceip, sorceport }: AddFirewallRuleBody = req.body;
  const { serverId } = req.query as { serverId: string };
  if (!serverId) {
    res.status(400).json({ code: 'ServerId is required' });
    return;
  }

  try {
    const server = await Server.findOne({ where: { id: serverId } });
    if (!server) {
      res.status(404).json({ code: 'Server not found' });
      return;
    }

    const ipBlock = server.ipBlock;
    const IP = server.ip;

    await client.re(
      'POST',
      `/ip/${encodeURIComponent(ipBlock)}/firewall/${IP}/rule`,
      {
        action,
        destinationPort: destination,
        protocol,
        sequence,
        source: sourceip,
        sourcePort: sorceport,
        tcpOption: null,
      }
    );
    res.status(200).json({ code: 'Successfully rule added!' });
  } catch (error: any) {
    res.status(400).json({ code: error.message });
  }
};

export const deleteFirewallRule = async (req: Request, res: Response): Promise<void> => {
  const { serverId, ruleId } = req.query as { serverId: string, ruleId: string };
  if (!serverId || !ruleId) {
    res.status(400).json({ code: 'ServerId and RuleId are required' });
    return;
  }

  try {
    const server = await Server.findOne({ where: { id: serverId } });
    if (!server) {
      res.status(404).json({ code: 'Server not found' });
      return;
    }

    const ipBlock = server.ipBlock;
    const IP = server.ip;

    await client.re(
      'DELETE',
      `/ip/${encodeURIComponent(ipBlock)}/firewall/${IP}/rule/${ruleId}`
    );
    res.status(200).json({ code: 'Successfully rule deleted!' });
  } catch (error: any) {
    res.status(400).json({ code: error.message });
  }
};

// Nueva función para eliminar reglas en lote
export const bulkDeleteFirewallRules = async (req: Request, res: Response): Promise<void> => {
  const { serverId } = req.query as { serverId: string };
  if (!serverId) {
    res.status(400).json({ code: 'ServerId is required' });
    return;
  }

  const { ruleIds }: BulkDeleteFirewallRulesBody = req.body;
  if (!ruleIds || !Array.isArray(ruleIds)) {
    res.status(400).json({ code: 'RuleIds must be an array' });
    return;
  }

  try {
    const server = await Server.findOne({ where: { id: serverId } });
    if (!server) {
      res.status(404).json({ code: 'Server not found' });
      return;
    }

    const ipBlock = server.ipBlock;
    const IP = server.ip;

    // Eliminando las reglas de firewall en lote
    for (let i = 0; i < ruleIds.length; i++) {
      await client.re(
        'DELETE',
        `/ip/${encodeURIComponent(ipBlock)}/firewall/${IP}/rule/${ruleIds[i]}`
      );
    }

    res.status(200).json({ code: 'Successfully deleted selected firewall rules' });
  } catch (error: any) {
    res.status(400).json({ code: error.message });
  }
};

export const deleteFirewallGameRule = async (req: Request, res: Response): Promise<void> => {
  const { serverId, ruleId } = req.query as { serverId: string, ruleId: string };
  if (!serverId || !ruleId) {
    res.status(400).json({ code: 'ServerId and RuleId are required' });
    return;
  }

  try {
    const server = await Server.findOne({ where: { id: serverId } });
    if (!server) {
      res.status(404).json({ code: 'Server not found' });
      return;
    }

    const ipBlock = server.ipBlock;
    const IP = server.ip;

    await client.re(
      'DELETE',
      `/ip/${encodeURIComponent(ipBlock)}/game/${IP}/rule/${ruleId}`
    );
    res.status(200).json({ code: 'Successfully rule deleted!' });
  } catch (error: any) {
    res.status(400).json({ code: error.message });
  }
};

//! ------------------------------------------------- FIN FIREWALL --------------------------------------------------------------------- //
