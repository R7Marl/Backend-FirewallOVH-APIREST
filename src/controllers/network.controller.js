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

const getTimeDiff = async () => {
    try {
        const time = await new Promise((resolve, reject) => {
            client.request('GET', '/auth/time', {}, (err, time) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(time);
                }
            });
        });
        return time - Math.round(Date.now() / 1000);
    } catch (err) {
        console.error('Error fetching time from OVH:', err);
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
            console.error('Error getting time difference:', err);
            return; 
        }
        
        const timestamp = Math.round(Date.now() / 1000) + timeDiff;
        const httpMethod = 'GET';
        const host = 'ca.api.ovh.com';
        const path = `/v2/networkDefense/vac/traffic?${params.toString()}`;
        const reqBody = '';
        
        const signature = client.signRequest(httpMethod, `https://${host}${path}`, reqBody, timestamp);
        
        const response = await fetch(url, {
            method: httpMethod,
            headers: {
                'Content-Type': 'application/json',
                'X-Ovh-Application': process.env.APP_KEY,
                'X-Ovh-Consumer': process.env.CONSUMER_KEY,
                'X-Ovh-Signature': signature,
                'X-Ovh-Timestamp': timestamp
            },
        });
        
        if (!response.ok) {
            const errorResponse = await response.json();
            console.error('Error de la API de OVH:', errorResponse);
            return res.status(response.status).json(errorResponse);
        }
        
    /* client.requestPromised('GET', '/v2/networkDefense/vac/traffic?'+params, {
            after: startDate,
            before: endDate,
            subnet: `${server.ip}/32`,
       }).then(response => {
           console.log(response);
       }).catch(error => {
           console.error(error);
           res.status(500).json({ message: "Error al obtener las estadísticas de red" });
       });
*/
        const networkStatistics = await response.json();
        res.status(200).json(networkStatistics);
    } catch (error) {
        console.log(error)
        res.status(400).json({ code: error });
    }
}