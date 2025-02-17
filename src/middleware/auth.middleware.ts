import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import User from "../models/User";
export const authMiddleware = async (
    req: Request, 
    res: Response, 
    next: NextFunction
) => {
    const token = req.headers.authorization;
    if (!token) {
        res.status(401).json({ message: "No autorizado" });
        return;
    }

    const [type, tokenValue] = token.split(" ");
    if (type !== "Bearer") {
        res.status(401).json({ message: "No autorizado" });
        return;
    }

    try {
        const decoded = jwt.verify(tokenValue, process.env.SECRET_KEY as string);
        const user = await User.findOne({ where: { id: decoded.user.id } });
        if (!user) {
            res.status(401).json({ message: "No autorizado" });
            return;
        }
        req.user = user;
        next();
    } catch (error: any) {
        console.log(error)
        res.status(401).json({ message: "No autorizadasdasdo" });
        return;
    }
};

export const adminMiddleware = async (
    req: Request, 
    res: Response, 
    next: NextFunction
) => {
    const token = req.headers.authorization;
    if (!token) {
        res.status(401).json({ message: "No autorizado" });
        return;
    }

    const [type, tokenValue] = token.split(" ");
    if (type !== "Bearer") {
        res.status(401).json({ message: "No autorizado" });
        return;
    }

    try {
        const decoded = jwt.verify(tokenValue, process.env.SECRET_KEY as string);
        const user = await User.findOne({ where: { id: decoded.user.id } });
        if (!user) {
            res.status(401).json({ message: "No autorizado" });
            return;
        }
        if (user.role === "admin" || user.role === "superadmin") {
            next();
        } else {
            res.status(403).json({ message: "Acceso denegado" });
            return;
        }
} catch (error: any) {
    res.status(401).json({ message: "No autorizado" });
    return;
}
};