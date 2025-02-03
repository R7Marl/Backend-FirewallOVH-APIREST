import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import { JWTEnvVars, DecodedToken } from "@/interfaces/jwt";

/**
 * Retrieves the environment variables required for JWT operations.
 * @throws Will throw an error if SECRET_KEY is not found in the environment variables.
 * @returns {JWTEnvVars} The environment variables required for JWT operations.
 */
const getEnv = (): JWTEnvVars => {
  const { SECRET_KEY } = process.env;
  if (!SECRET_KEY) {
    throw new Error("[HOSTLY]: Falta SECRET_KEY en .env");
  }
  return { SECRET_KEY };
};

const env = getEnv();

/**
 * Middleware to authenticate requests using JWT.
 * @param {Request} req - The request object.
 * @param {Response} res - The response object.
 * @param {NextFunction} next - The next middleware function.
 */
const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers?.authorization;
  if (!token)
    return res.status(401).json({ message: req.t("errors.unauthorized") });

  const [type, tokenValue] = token.split(" ");
  if (type !== "Bearer")
    return res.status(401).json({ message: req.t("errors.unauthorized") });

  try {
    const decoded = jwt.verify(tokenValue, env.SECRET_KEY) as DecodedToken;
    req.user = decoded.user;
    next();
  } catch (error) {
    res.status(401).json({ message: req.t("errors.unauthorized") });
  }
};

/**
 * Middleware to authorize admin requests using JWT.
 * @param {Request} req - The request object.
 * @param {Response} res - The response object.
 * @param {NextFunction} next - The next middleware function.
 */
const adminMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers?.authorization;
  if (!token)
    return res.status(401).json({ message: req.t("errors.unauthorized") });

  const [type, tokenValue] = token.split(" ");
  if (type !== "Bearer")
    return res.status(401).json({ message: req.t("errors.unauthorized") });

  try {
    const decoded = jwt.verify(tokenValue, env.SECRET_KEY) as DecodedToken;
    req.user = decoded.user;

    if (decoded.user?.role === "admin" || decoded.user?.role === "superadmin") {
      next();
    } else {
      res.status(401).json({ message: req.t("errors.unauthorized") });
    }
  } catch (error) {
    res.status(401).json({ message: req.t("errors.unauthorized") });
  }
};

export { authMiddleware, adminMiddleware };
