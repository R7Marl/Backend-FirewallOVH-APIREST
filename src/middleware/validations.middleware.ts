import ip from "ip";
import { Request, Response, NextFunction } from "express";
function isValidIPBlock(ipBlock: string) {
  const parts = ipBlock.split("/");
  if (parts.length === 2) {
    const ipAddress = parts[0];
    const prefixLength = parseInt(parts[1]);

    return ip.isV4Format(ipAddress) && prefixLength >= 0 && prefixLength <= 32;
  }
  return false;
}
export const validatorIP = async (req: Request, res: Response, next: NextFunction) => {
  const { ipBlock, IP } = req.body;
  console.log(req.body);
  try {
    if (!req.body) {
      res.status(400).json({ error: "La solicitud está vacia." });
    }
    if (!isValidIPBlock(ipBlock) || !ip.isV4Format(IP)) {
      return res
        .status(400)
        .json({ error: "Dirección IP o bloque de IP no válidos." });
    }
    next();
  } catch (error) {
    res.status(400).json({ error: "Error interno del servidor:\n " + error });
  }
};
