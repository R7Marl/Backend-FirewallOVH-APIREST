import jwt from "jsonwebtoken";
export const authMiddleware = (req, res, next) => {
    const token = req.headers.authorization;
    if (!token) return res.status(401).json({ message: "No autorizado" });
    const [type, tokenValue] = token.split(' ');
    if (type !== 'Bearer') return res.status(401).json({ message: "No autorizado" });
    try {
        const decoded = jwt.verify(tokenValue, process.env.SECRET_KEY);
        req.user = decoded.user;
        next();
    } catch (error) {
        res.status(401).json({ message: "No autorizado" });
    }
}

export const adminMiddleware = (req, res, next) => {
    const token = req.headers.authorization;
    if (!token) return res.status(401).json({ message: "No autorizado" });
    const [type, tokenValue] = token.split(' ');
    if (type !== 'Bearer') return res.status(401).json({ message: "No autorizado" });
    try {
        const decoded = jwt.verify(tokenValue, process.env.SECRET_KEY);
        if (decoded.user.role === "admin" || decoded.user.role === "superadmin") {
            next();
        } else {
            res.status(401).json({ message: "No autorizado" });
        }
    } catch (error) {
        res.status(401).json({ message: "No autorizado" });
    }
}