import { promisify } from "util";
import fetch from 'node-fetch'
import Server from "../models/Server.js";
import ovh from 'ovh';
const client = ovh({
    endpoint: process.env.END_POINT,
    appKey: process.env.APP_KEY,
    appSecret: process.env.APP_SECRET,
    consumerKey: process.env.CONSUMER_KEY,
})
client.re = promisify(client.request);
export const getNetworkStatistics = async (req, res) => {
    const { serverId } = req.query;
    const { startDate, endDate } = req.query;
    try {
        const server = await Server.findByPk(serverId);
        const baseUrl = `https://ca.api.ovh.com/v2/networkDefense/vac/traffic`;
        const params = new URLSearchParams({
            after: startDate,
            before: endDate,
            subnet: `${server.ip}/32`,
        });

        const url = `${baseUrl}?${params.toString()}`;

        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'accept': 'application/json',
                'authorization': `Bearer ${process.env.OVH_TOKEN}`,
            },
        });

        if (!response.ok) {
            const errorResponse = await response.json();
            console.error('Error de la API de OVH:', errorResponse);
            return res.status(response.status).json(errorResponse);
        }

        const networkStatistics = await response.json();
        res.status(200).json(networkStatistics);
    } catch (error) {
        res.status(400).json({ code: error });
    }
}