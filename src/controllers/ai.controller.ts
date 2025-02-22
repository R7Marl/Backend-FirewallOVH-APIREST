import { doMessage } from "../common/promps/OpenAI.service.js";
import { Request, Response } from "express";

export const getAISuggestion = async (req: Request, res: Response) => {
    try {
        const { suggestion } = req.query as { suggestion: string };
        const response = await doMessage(suggestion);
        res.status(200).json(response);
    } catch (error: any) {
        res.status(500).json({ message: "Error al obtener sugerencia" });
    }
};