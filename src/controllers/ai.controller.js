import { doMessage } from "../common/promps/OpenAI.service.js";

export const getAISuggestion = async (req, res) => {
    try {
        const { suggestion } = req.query;
        const response = await doMessage(suggestion);
        console.log(response);
        res.status(200).json(response);
    } catch (error) {
        res.status(500).json({ message: "Error al obtener sugerencia" });
    }
};