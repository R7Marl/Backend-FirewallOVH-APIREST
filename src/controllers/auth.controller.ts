import i18n from "i18next";
import User from "../models/User.js";
import { hashPassword, comparePassword } from "../utils/bcrypt.js";
import { generateToken } from "../utils/jwt.js";
import { body, validationResult } from "express-validator";
import { RateLimiterMemory } from "rate-limiter-flexible";
import { Request, Response } from "express";

// Define rate limiter
const rateLimiter = new RateLimiterMemory({
  points: 999, // Number of allowed attempts
  duration: 3600, // 1 hour in seconds
});

/**
 * Helper function to handle validation errors
 * @param req - Express request object
 * @param res - Express response object
 * @returns Response with validation errors if any
 */
const handleValidationErrors = (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: req.t("validation.error"),
      errors: errors.array(),
    });
  }
};

/**
 * Login user
 * @param req - Express request object
 * @param res - Express response object
 */
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    handleValidationErrors(req, res);

    const { email, password } = req.body;

    // Rate limiting check
    try {
      const ipAddress = req.ip ?? "";
      await rateLimiter.consume(ipAddress);
    } catch (error) {
      res.status(429).json({
        message: req.t("errors.rate-limit"),
      });
      return;
    }

    // Find user
    const user = await User.findOne({
      where: {
        email: email,
      },
    });
    if (!user) {
      res.status(400).json({
        message: req.t("errors.invalid-credentials"),
      });
      return;
    }

    // Verify password
    const isPasswordCorrect = await comparePassword(password, user.password);
    if (!isPasswordCorrect) {
      res.status(400).json({
        message: req.t("errors.invalid-credentials"),
      });
      return;
    }

    // Generate JWT token
    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    res.status(200).json({
      message: req.t("success.login"),
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name,
      },
    });
  } catch (error) {
    console.error("Error in login:", error);
    res.status(500).json({
      message: req.t("errors.internal"),
    });
  }
};

/**
 * Register user
 * @param req - Express request object
 * @param res - Express response object
 */
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      res.status(400).json({
        message: req.t("errors.fields-required"),
      });
      return;
    }

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      res.status(400).json({
        message: req.t("errors.already-exists"),
      });
      return;
    }

    const hashedPassword = hashPassword(password);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: role || "user",
    });

    const token = generateToken(user);

    res.status(201).json({
      message: req.t("success.user-registered"),
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name,
      },
    });
  } catch (error: any) {
    console.error("Error in register:", error);
    res.status(500).json({
      message: req.t("errors.registering-user"),
      error: error.message,
    });
  }
};

/**
 * Get all users
 * @param req - Express request object
 * @param res - Express response object
 */
export const getUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const users = await User.findAll();
    res.status(200).json(users);
  } catch (error: any) {
    console.error("Error in getUsers:", error);
    res.status(500).json({
      message: req.t("errors.fetching-users"),
      error: error.message,
    });
  }
};

/**
 * Update user password
 * @param req - Express request object
 * @param res - Express response object
 */
export const updatePassword = async (req: Request, res: Response): Promise<void> => {
  const { oldPassword, newPassword } = req.body;
  const { id } = req.user as { id: string };
  const user = await User.findOne({ where: { id } });
  if (!user) {
    res.status(401).json({
      message: req.t("errors.unauthorized"),
    });
    return;
  }
  if (!oldPassword || !newPassword) {
    res.status(400).json({
      message: req.t("errors.fields-required"),
    });
    return;
  }
  try {
    const isPasswordCorrect = comparePassword(oldPassword, user.password);
    if (!isPasswordCorrect) {
      res.status(400).json({
        message: req.t("errors.incorrect-old-password"),
      });
      return;
    }
    if (oldPassword === newPassword) {
      res.status(400).json({
        message: req.t("errors.new-password-same-as-old"),
      });
      return;
    }
    const hashedPassword = hashPassword(newPassword);
    await User.update({ password: hashedPassword }, { where: { id: user.id } });
    res.status(200).json({
      message: req.t("success.password-updated"),
    });
  } catch (error: any) {
    console.error("Error in updatePassword:", error);
    res.status(500).json({
      message: req.t("errors.updating-password"),
      error: error.message,
    });
  }
};

/**
 * Update user name
 * @param req - Express request object
 * @param res - Express response object
 */
export const updateName = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.user as { id: string };
  const { name } = req.body;
  if (!id) {
    res.status(401).json({
      message: req.t("errors.unauthorized"),
    });
    return;
  }
  if (!name) {
    res.status(400).json({
      message: req.t("errors.fields-required"),
    });
    return;
  }
  try {
    await User.update({ name }, { where: { id: id } });
    const userUpdated = await User.findOne({ where: { id: id } });
    res.status(200).json({
      message: req.t("success.name-updated"),
      user: userUpdated,
    });
  } catch (error: any) {
    console.error("Error in updateName:", error);
    res.status(500).json({
      message: req.t("errors.updating-name"),
      error: error.message,
    });
  }
};

export const updateUserRole = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.query;
  const { role } = req.body;
  if (!role || !id) {
    res.status(400).json({
      message: req.t("errors.fields-required"),
    });
    return;
  }
  try {
    await User.update({ role: role as "user" | "admin" | "superadmin" }, { where: { id: id as string } });
    const userUpdated = await User.findOne({ where: { id: id as string } });
    res.status(200).json({
      message: req.t("success.role-updated"),
      user: userUpdated,
    });
  } catch (error: any) {
    console.error("Error in updateUserRole:", error);
    res.status(500).json({
      message: req.t("errors.updating-role"),
      error: error.message,
    });
  }
};

/**
 * Get user by ID
 * @param req - Express request object
 * @param res - Express response object
 */
export const getUser = async (req: Request, res: Response): Promise<void> => {
  const { id } = req?.user as { id: string };
  const user = await User.findOne({ where: { id } });
  if (!user) {
    res.status(401).json({
      message: req.t("errors.unauthorized"),
    });
    return;
  }
  res.status(200).json(user);
};