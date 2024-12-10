import User from "../models/User.js";
import { hashPassword, comparePassword } from "../utils/bcrypt.js";
import { generateToken } from "../utils/jwt.js";
export const login = (req, res) => {
    const { email, password } = req.body;
    User.findOne({ email }).then((user) => {
        if(!user) return res.status(400).json({ message: "Usuario no encontrado" });
        const isPasswordCorrect = comparePassword(password, user.password);
        if(!isPasswordCorrect) return res.status(400).json({ message: "Contraseña incorrecta" });

        const token = generateToken(user);
        return res.status(200).json({ message: "Usuario logueado", token });
    })
}

export const register = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ 
                message: "Todos los campos son obligatorios" 
            });
        }

        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ 
                message: "El usuario ya existe" 
            });
        }

        const hashedPassword = hashPassword(password);

        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            role: role || 'user'
        });

        const token = generateToken(user);

        return res.status(201).json({
            message: "Usuario registrado exitosamente",
            token
        });

    } catch (error) {
        console.error('Error en registro:', error);
        return res.status(500).json({
            message: "Error al registrar usuario",
            error: error.message
        });
    }
}