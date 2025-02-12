import { promisify } from "util";
import fetch from "node-fetch";
import Server from "../models/Server.js";
import ovh from "ovh";

export interface NetworkEnvVars {
  END_POINT: string;
  APP_KEY: string;
  APP_SECRET: string;
  CONSUMER_KEY: string;
}

const getEnv = (): NetworkEnvVars => {
  const { END_POINT, APP_KEY, APP_SECRET, CONSUMER_KEY } = process.env;

  if (!END_POINT) {
    throw new Error("[HOSTLY]: Falta END_POINT en .env");
  } else if (!APP_KEY) {
    throw new Error("[HOSTLY]: Falta APP_KEY en .env");
  } else if (!APP_SECRET) {
    throw new Error("[HOSTLY]: Falta APP_SECRET en .env");
  } else if (!CONSUMER_KEY) {
    throw new Error("[HOSTLY]: Falta CONSUMER_KEY en .env");
  }
  return { END_POINT, APP_KEY, APP_SECRET, CONSUMER_KEY };
};

const env = getEnv();

const client = ovh({
  endpoint: env.END_POINT,
  appKey: env.APP_KEY,
  appSecret: env.APP_SECRET,
  consumerKey: env.CONSUMER_KEY,
});

client.re = promisify(client.request);

const getTimeDiff = async () => {
  try {
    const time = await new Promise((resolve, reject) => {
      client.request("GET", "/auth/time", {}, (err, time) => {
        if (err) {
          reject(err);
        } else {
          resolve(time);
        }
      });
    });
    return time - Math.round(Date.now() / 1000);
  } catch (err) {
    console.error("Error fetching time from OVH:", err);
    throw err;
  }
};

export const getNetworkStatistics = async (req, res) => {
  const { serverId } = req.query;
  const { startDate, endDate } = req.query;
  try {
    const server = await Server.findByPk(serverId);
    const params = new URLSearchParams({
      after: startDate,
      before: endDate,
      subnet: `${server.ip}/32`,
    });
    const baseUrl = `https://ca.api.ovh.com/v2/networkDefense/vac/traffic`;
    const url = `${baseUrl}?${params.toString()}`;

    let timeDiff;
    try {
      timeDiff = await getTimeDiff();
    } catch (err) {
      console.error("Error getting time difference:", err);
      return;
    }

    const timestamp = Math.round(Date.now() / 1000) + timeDiff;
    const httpMethod = "GET";
    const host = "ca.api.ovh.com";
    const path = `/v2/networkDefense/vac/traffic?${params.toString()}`;
    const reqBody = "";

    const signature = client.signRequest(
      httpMethod,
      `https://${host}${path}`,
      reqBody,
      timestamp,
    );

    const response = await fetch(url, {
      method: httpMethod,
      headers: {
        "Content-Type": "application/json",
        "X-Ovh-Application": env.APP_KEY,
        "X-Ovh-Consumer": env.CONSUMER_KEY,
        "X-Ovh-Signature": signature,
        "X-Ovh-Timestamp": timestamp,
      },
    });

    if (!response.ok) {
      const errorResponse = await response.json();
      console.error("Error de la API de OVH:", errorResponse);
      return res.status(response.status).json(errorResponse);
    }

    const networkStatistics = await response.json();
    res.status(200).json(networkStatistics);
  } catch (error) {
    console.log(error);
    res.status(400).json({ code: error });
  }
};
