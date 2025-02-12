import Server from "@/models/Server.js";
import { Request, Response } from "express";

/**
 * Retrieves all servers associated with a specific user.
 *
 * @param {Request} req - The request object, expecting req.user.id.
 * @param {Response} res - The response object.
 * @returns {Promise<Response>} - A JSON response with servers or an error message.
 */
export const getServerByUser = async (
  req: Request,
  res: Response,
): Promise<Response> => {
  try {
    const { id: userId } = req.user;
    const servers = await Server.findAll({ where: { userId } });

    if (!servers.length) {
      return res.status(404).json({ message: req.t("server.no_servers") });
    }

    return res.status(200).json({ servers });
  } catch (error) {
    console.error("Error in getServerByUser:", error);
    return res.status(500).json({
      message: req.t("server.error_fetch"),
      error: error.message,
    });
  }
};

/**
 * Retrieves a specific server by its ID, ensuring the user has access.
 *
 * @param {Request} req - The request object, expecting req.params.id and req.user.id.
 * @param {Response} res - The response object.
 * @returns {Promise<Response>} - A JSON response with the server or an error message.
 */
export const getServerById = async (
  req: Request,
  res: Response,
): Promise<Response> => {
  try {
    const { id } = req.params;
    const { id: userId } = req.user;

    const server = await Server.findOne({ where: { id, userId } });

    if (!server) {
      return res.status(404).json({ message: req.t("server.not_found") });
    }

    return res.status(200).json(server);
  } catch (error) {
    console.error("Error in getServerById:", error);
    return res.status(500).json({
      message: req.t("server.error_fetch_one"),
      error: error.message,
    });
  }
};

/**
 * Creates a new server entry in the database.
 *
 * @param {Request} req - The request object containing ipBlock, name, ip, and userId in the body.
 * @param {Response} res - The response object.
 * @returns {Promise<Response>} - A JSON response with the created server or an error message.
 */
export const createServer = async (
  req: Request,
  res: Response,
): Promise<Response> => {
  try {
    const { ipBlock, name, ip, userId } = req.body;
    const server = await Server.create({ ipBlock, name, ip, userId });

    return res.status(201).json(server);
  } catch (error) {
    console.error("Error in createServer:", error);

    if (error.name === "SequelizeUniqueConstraintError") {
      return res.status(400).json({ message: req.t("server.ip_in_use") });
    }

    return res.status(500).json({
      message: req.t("server.error_create"),
      error: error.message,
    });
  }
};

/**
 * Deletes a server by its ID.
 *
 * @param {Request} req - The request object containing serverId in the query params.
 * @param {Response} res - The response object.
 * @returns {Promise<Response>} - A JSON response confirming deletion or an error message.
 */
export const deleteServer = async (
  req: Request,
  res: Response,
): Promise<Response> => {
  try {
    const { serverId } = req.query;

    if (!serverId) {
      return res.status(400).json({ message: req.t("server.id_required") });
    }

    const deleted = await Server.destroy({ where: { id: serverId } });

    if (!deleted) {
      return res.status(404).json({ message: req.t("server.not_found") });
    }

    return res.status(200).json({ message: req.t("server.deleted_success") });
  } catch (error) {
    console.error("Error in deleteServer:", error);
    return res.status(500).json({
      message: req.t("server.error_delete"),
      error: error.message,
    });
  }
};

/**
 * Retrieves all servers in the database.
 *
 * @param {Request} req - The request object.
 * @param {Response} res - The response object.
 * @returns {Promise<Response>} - A JSON response with all servers or an error message.
 */
export const getAllServers = async (
  req: Request,
  res: Response,
): Promise<Response> => {
  try {
    const servers = await Server.findAll();
    return res.status(200).json({ servers });
  } catch (error) {
    console.error("Error in getAllServers:", error);
    return res.status(500).json({
      message: req.t("server.error_fetch_all"),
      error: error.message,
    });
  }
};
