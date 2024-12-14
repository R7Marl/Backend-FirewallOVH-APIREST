
import Server from "../models/Server.js";

export const getServerByUser = async (req, res) => {
    try {
        const { id } = req.user;
        
        const servers = await Server.findAll({ 
            where: { 
                userId: id 
            }
        });
        
        if (servers.length > 0) {
            res.status(200).json({servers});
        } else {
            res.status(404).json({ message: "No hay servidores asociados a este usuario" });
        }
    } catch (error) {
        console.error('Error en getServerByUser:', error);
        res.status(500).json({ 
            message: "Error al obtener servidores asociados a este usuario",
            error: error.message 
        });
    }
}

export const getServerById = async (req, res) => {
    try {
        const { id } = req.params;
        const { id: userId } = req.user; 
        
        const server = await Server.findOne({
            where: {
                id,
                userId 
            }
        });
        
        if (server) {
            res.status(200).json(server);
        } else {
            res.status(404).json({ message: "Servidor no encontrado o no tienes acceso" });
        }
    } catch (error) {
        console.error('Error en getServerById:', error);
        res.status(500).json({ 
            message: "Error al obtener el servidor",
            error: error.message 
        });
    }
}

export const createServer = async (req, res) => {
    try {
        const { ipBlock, name, ip, userId } = req.body;
        const server = await Server.create({ 
            ipBlock, 
            name, 
            ip,
            userId
        });
        
        res.status(201).json(server);
    } catch (error) {
        console.error('Error en createServer:', error);
        
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(400).json({ 
                message: "La IP ya está en uso por otro servidor" 
            });
        }
        
        res.status(500).json({ 
            message: "Error al crear servidor",
            error: error.message 
        });
    }
}

export const deleteServer = async (req, res) => {
    try {
        const { id } = req.params;
        const { id: userId } = req.user;
        
        const deleted = await Server.destroy({
            where: {
                id,
                userIdr
            }
        });
        
        if (deleted) {
            res.status(200).json({ message: "Servidor eliminado correctamente" });
        } else {
            res.status(404).json({ message: "Servidor no encontrado o no tienes acceso" });
        }
    } catch (error) {
        console.error('Error en deleteServer:', error);
        res.status(500).json({ 
            message: "Error al eliminar servidor",
            error: error.message 
        });
    }
}

export const getAllServers = async (req, res) => {
    try {
        const servers = await Server.findAll();
        res.status(200).json({servers});
    } catch (error) {
        console.error('Error en getAllServers:', error);
        res.status(500).json({ 
            message: "Error al obtener todos los servidores",
            error: error.message 
        });
    }
}