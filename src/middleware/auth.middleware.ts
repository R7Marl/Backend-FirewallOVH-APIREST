import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import { TokenUser } from "../common/types";

export const authMiddleware = (
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
        const decoded = jwt.verify(tokenValue, process.env.SECRET_KEY as string) as TokenUser;
        req.user = decoded;
        next();
    } catch (error: any) {
        res.status(401).json({ message: "No autorizado" });
        return;
    }
};

export const adminMiddleware = (
    req: Request, 
    res: Response, 
    next: NextFunction
) => {
    if (!req.user) {
        res.status(401).json({ message: "No autorizado" });
        return;
    }

    if (req.user.role === "admin" || req.user.role === "superadmin") {
        next();
    } else {
        res.status(403).json({ message: "Acceso denegado" });
        return;
    }
};