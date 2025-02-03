import i18n from "i18next";
import User from "@/models/User";
import { hashPassword, comparePassword } from "@/utils/bcrypt";
import { generateToken } from "@/utils/jwt";
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
export const login = async (req: Request, res: Response) => {
  console.log(req.body);
  try {
    handleValidationErrors(req, res);

    const { email, password } = req.body;

    // Rate limiting check
    try {
      const ipAddress = req.ip ?? "";
      await rateLimiter.consume(ipAddress);
    } catch (error) {
      return res.status(429).json({
        message: req.t("errors.rate-limit"),
      });
    }

    // Find user
    const user = await User.findOne({
      where: {
        email: email,
      },
    });
    if (!user) {
      return res.status(400).json({
        message: req.t("errors.invalid-credentials"),
      });
    }

    // Verify password
    const isPasswordCorrect = await comparePassword(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(400).json({
        message: req.t("errors.invalid-credentials"),
      });
    }

    // Generate JWT token
    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    return res.status(200).json({
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
    return res.status(500).json({
      message: req.t("errors.internal"),
    });
  }
};

/**
 * Register user
 * @param req - Express request object
 * @param res - Express response object
 */
export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: req.t("errors.fields-required"),
      });
    }

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({
        message: req.t("errors.already-exists"),
      });
    }

    const hashedPassword = hashPassword(password);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: role || "user",
    });

    const token = generateToken(user);

    return res.status(201).json({
      message: req.t("success.user-registered"),
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name,
      },
    });
  } catch (error) {
    console.error("Error in register:", error);
    return res.status(500).json({
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
export const getUsers = async (req: Request, res: Response) => {
  try {
    const users = await User.findAll();
    res.status(200).json(users);
  } catch (error) {
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
export const updatePassword = async (req: Request, res: Response) => {
  const { oldPassword, newPassword } = req.body;
  const { id } = req.user;
  const user = await User.findOne({ where: { id } });
  if (!user) {
    return res.status(401).json({
      message: req.t("errors.unauthorized"),
    });
  }
  if (!oldPassword || !newPassword) {
    return res.status(400).json({
      message: req.t("errors.fields-required"),
    });
  }
  try {
    const isPasswordCorrect = comparePassword(oldPassword, user.password);
    if (!isPasswordCorrect) {
      return res.status(400).json({
        message: req.t("errors.incorrect-old-password"),
      });
    }
    if (oldPassword === newPassword) {
      return res.status(400).json({
        message: req.t("errors.new-password-same-as-old"),
      });
    }
    const hashedPassword = hashPassword(newPassword);
    await User.update({ password: hashedPassword }, { where: { id: user.id } });
    return res.status(200).json({
      message: req.t("success.password-updated"),
    });
  } catch (error) {
    console.error("Error in updatePassword:", error);
    return res.status(500).json({
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
export const updateName = async (req: Request, res: Response) => {
  const { id } = req.user;
  const { name } = req.body;
  if (!id) {
    return res.status(401).json({
      message: req.t("errors.unauthorized"),
    });
  }
  if (!name) {
    return res.status(400).json({
      message: req.t("errors.fields-required"),
    });
  }
  try {
    await User.update({ name }, { where: { id: id } });
    const userUpdated = await User.findOne({ where: { id: id } });
    return res.status(200).json({
      message: req.t("success.name-updated"),
      user: userUpdated,
    });
  } catch (error) {
    console.error("Error in updateName:", error);
    return res.status(500).json({
      message: req.t("errors.updating-name"),
      error: error.message,
    });
  }
};

/**
 * Get user by ID
 * @param req - Express request object
 * @param res - Express response object
 */
export const getUser = async (req: Request, res: Response) => {
  const { id } = req.user;
  const user = await User.findOne({ where: { id } });
  if (!user) {
    return res.status(401).json({
      message: req.t("errors.unauthorized"),
    });
  }
  res.status(200).json(user);
};
