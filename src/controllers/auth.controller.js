import { validateCaptcha } from "../common/utils.js";
import User from "../models/User.js";
import { hashPassword, comparePassword } from "../utils/bcrypt.js";
import { generateToken } from "../utils/jwt.js";
import { body, validationResult } from 'express-validator';
import { RateLimiterMemory } from 'rate-limiter-flexible';

// Rate limiter setup
const rateLimiter = new RateLimiterMemory({
  points: 999, // Número de intentos
  duration: 3600, // 1 hora en segundos
});

// Middleware de validación
const validateLoginInput = [
  body('email')
    .trim()
    .isEmail()
    .normalizeEmail()
    .withMessage('Por favor ingrese un email válido'),
  body('password')
    .trim()
    .notEmpty()
    .withMessage('La contraseña es requerida'),
];

// Handler de login
export const login = async (req, res) => {
    console.log(req.body)
  try {
    // Validar input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Error de validación', 
        errors: errors.array() 
      });
    }

    const { email, password } = req.body;

    // Rate limiting check
    try {
      const ipAddress = req.ip;
      await rateLimiter.consume(ipAddress);
    } catch (error) {
      return res.status(429).json({
        message: 'Demasiados intentos de login. Por favor intente más tarde'
      });
    }

    // Buscar usuario
    const user = await User.findOne({ where: {
        email: email
    }});
    if (!user) {
      return res.status(400).json({ 
        message: 'Credenciales inválidas'
      });
    }

    // Verificar contraseña
    const isPasswordCorrect = await comparePassword(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(400).json({
        message: 'Credenciales inválidas'
      });
    }

    // Generar token JWT
    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role
    });

    // Enviar respuesta
    return res.status(200).json({
      message: 'Login exitoso',
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name
      }
    });

  } catch (error) {
    console.error('Error en login:', error);
    return res.status(500).json({
      message: 'Error interno del servidor'
    });
  }
};


export const register = async (req, res) => {
    try {
        const { name, email, password, role, token } = req.body;

        if (!name || !email || !password || !token) {
            return res.status(400).json({ 
                message: "Todos los campos son obligatorios" 
            });
        }
        const captcha = await validateCaptcha(token);
        if(!captcha) {
          return res.status(400).json({ 
            message: "El token de captcha no es válido" 
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

        const tokenJwt = generateToken(user);

        return res.status(201).json({
            message: "Usuario registrado exitosamente",
            tokenJwt,
            user: {
                id: user.id,
                email: user.email,
                role: user.role,
                name: user.name
            }
        });

    } catch (error) {
        console.error('Error en registro:', error);
        return res.status(500).json({
            message: "Error al registrar usuario",
            error: error.message
        });
    }
}

export const getUsers = async (req, res) => {
    try {
        const users = await User.findAll();
        res.status(200).json(users);
    } catch (error) {
        console.error('Error en getUsers:', error);
        res.status(500).json({ 
            message: "Error al obtener todos los usuarios",
            error: error.message 
        });
    }
}

export const updatePassword = async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const { id } = req.user;
  const user = await User.findOne({ where: { id } });
  if (!user) {
    return res.status(401).json({ 
      message: "No autorizado" 
    });
  }
  if (!oldPassword || !newPassword) {
    return res.status(400).json({ 
      message: "You must provide all fields"
    });
  }
  try {
    const isPasswordCorrect = comparePassword(oldPassword, user.password);
    if (!isPasswordCorrect) {
      return res.status(400).json({ 
        message: "Incorrect old password"
      });
    }
    if(oldPassword === newPassword) {
      return res.status(400).json({ 
        message: "The new password must be different from the old one"
      });
    }
    const hashedPassword = hashPassword(newPassword);
    await User.update({ password: hashedPassword }, { where: { id: user.id } });
    return res.status(200).json({ 
      message: "Password updated successfully"
    });
  } catch (error) {
    console.error('Error en updatePassword:', error);
    return res.status(500).json({ 
      message: "Error updating password",
      error: error.message 
    });
  }
  }
  export const updateName = async (req, res) => {
    const { id } = req.user;
    const { name } = req.body;
    if(!id) {
      return res.status(401).json({ 
        message: "You are not authorized" 
      });
    }
    if (!name) {
      return res.status(400).json({ 
        message: "You must provide all fields"
      });
    }
    try {
     await User.update({ name }, { where: { id: id } });
     const userUpdated = await User.findOne({ where: { id: id } });
      return res.status(200).json({ 
        message: "Name updated successfully",
        user: userUpdated
      });
    } catch (error) {
      console.error('Error en updateName:', error);
      return res.status(500).json({ 
        message: "Error updating name",
        error: error.message 
      });
    }
  }

export const getUser = async (req, res) => {
  const { id } = req.user;
  const user = await User.findOne({ where: { id } });
  if (!user) {
    return res.status(401).json({ 
      message: "You are not authorized" 
    });
  }
  res.status(200).json(user);
}