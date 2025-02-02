import OpenAI from 'openai';
import * as dotenv from 'dotenv';
dotenv.config();
export const doMessage = async (message) => {
    const prompWithoutMessage = `
Toma como base este objeto
{ports: { from: startport, to: endport }},
protocol: protocol
Y solo devuelveme el JSON ARRAY con lo que el usuario te pida, sabiendo que los protocol son estos: 
arkSurvivalEvolved
arma
gtaMultiTheftAutoSanAndreas
gtaSanAndreasMultiplayerMod
hl2Source
minecraftJava
minecraftQuery
minecraftPocketEdition
mumble
other
rust
teamspeak2
teamspeak3
trackmaniaShootmania;
debes tener en cuenta que, counter strike, cs, es hl2Source, por las dudas, y si no encuentras algo, simplemente devuelve other y los puertos que te pidan o pon puertos random
Y si no te piden puertos, debes buscar que puerto default usa cada juego, ahora, el usuario te pide y respondele con un ARRAY CON OBJETOS EN JSON: `
    try {
        const openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY,
        })
        const response = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [{ role: "user", content: prompWithoutMessage + message }],
        });
        const reply = response.choices[0]?.message?.content || "No response received";
        return JSON.parse(reply);
    } catch (error) {
        console.log("ERROR FATAL EN OPENAI.SERVICE.JS", error)
        throw error
    }
}