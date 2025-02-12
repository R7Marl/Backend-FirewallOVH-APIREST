import axios from "axios";
import { Request, Response, NextFunction } from "express";
const RECAPTCHA_SECRET_KEY: string = "6Ld1GtIqAAAAAK9K95ug49-yvoyEnW3toT8k0uzc";




export const sleep = (ms: number): Promise<void> => {
    return new Promise(resolve => setTimeout(resolve, ms));
  }


export const validateRecaptcha = async (req: Request, res: Response, next: NextFunction) => {
    const token = req.body?.recaptchaToken as string;
  
    if (!token) {
      res.status(400).json({ 
        success: false, 
        message: 'No se proporcionó token de ReCAPTCHA' 
      });
    }
  
    try {
      const response = await axios.post(
        'https://www.google.com/recaptcha/api/siteverify',
        null,
        {
          params: {
            secret: RECAPTCHA_SECRET_KEY,
            response: token
          }
        }
      );
  
      const { success } = response.data;
      if (!success) {
        res.status(400).json({
          success: false,
          message: 'Validación de ReCAPTCHA fallida'
        });
      }

      next();
    } catch (error) {
      console.error('Error validando ReCAPTCHA:', error);
      res.status(500).json({
        success: false,
        message: 'Error al validar ReCAPTCHA'
      });
    }
  };