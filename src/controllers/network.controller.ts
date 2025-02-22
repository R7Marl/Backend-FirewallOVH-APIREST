import { Request, Response } from "express";
import { promisify } from "util";
import fetch from "node-fetch";
import { Op } from "sequelize";
import Server from "../models/Server.js";
import ovh from "ovh";
import { OVHClient } from "../common/types/index.js";

const client: OVHClient = ovh({
  endpoint: process.env.END_POINT,
  appKey: process.env.APP_KEY,
  appSecret: process.env.APP_SECRET,
  consumerKey: process.env.CONSUMER_KEY,
});

const getTimeDiff = async (): Promise<number> => {
  try {
    const time: number = await new Promise((resolve, reject) => {
      client.request("GET", "/auth/time", {}, (err: Error | null, time?: number) => {
        if (err) {
          reject(err);
        } else {
          resolve(time as number);
        }
      });
    });
    return time - Math.round(Date.now() / 1000);
  } catch (err) {
    console.error("Error fetching time from OVH:", err);
    throw err;
  }
};

export const getNetworkStatistics = async (req: Request, res: Response): Promise<void> => {
  try {
    const { serverId, startDate, endDate } = req.query as { serverId: string; startDate: string; endDate: string };

    const server = await Server.findByPk(serverId);
    if (!server) {
      res.status(404).json({ message: "Servidor no encontrado" });
      return;
    }

    const params = new URLSearchParams({
      after: startDate,
      before: endDate,
      subnet: `${server.ip}/32`,
    });

    const baseUrl = `https://ca.api.ovh.com/v2/networkDefense/vac/traffic`;
    const url = `${baseUrl}?${params.toString()}`;

    let timeDiff: number;
    try {
      timeDiff = await getTimeDiff();
    } catch (err) {
      console.error("Error getting time difference:", err);
      res.status(500).json({ message: "Error al obtener la diferencia de tiempo con OVH" });
      return;
    }

    const timestamp: number = Math.round(Date.now() / 1000) + timeDiff;
    const httpMethod = "GET";
    const host = "ca.api.ovh.com";
    const path = `/v2/networkDefense/vac/traffic?${params.toString()}`;
    const reqBody = "";

    const signature = client.signRequest(httpMethod, `https://${host}${path}`, reqBody, timestamp);

    const response = await fetch(url, {
      method: httpMethod,
      headers: {
        "Content-Type": "application/json",
        "X-Ovh-Application": process.env.APP_KEY as string,
        "X-Ovh-Consumer": process.env.CONSUMER_KEY as string,
        "X-Ovh-Signature": signature,
        "X-Ovh-Timestamp": timestamp.toString(),
      },
    });

    if (!response.ok) {
      const errorResponse = await response.json();
      console.error("Error de la API de OVH:", errorResponse);
      res.status(response.status).json(errorResponse);
      return;
    }

    const networkStatistics = await response.json();
    res.status(200).json(networkStatistics);
  } catch (error) {
    console.error("Error en getNetworkStatistics:", error);
    res.status(500).json({ message: "Error al obtener estadísticas de red", error: (error as Error).message });
  }
};
