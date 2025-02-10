import axios from "axios";
const RECAPTCHA_SECRET_KEY = "6Ld1GtIqAAAAAK9K95ug49-yvoyEnW3toT8k0uzc"
export const sleep = (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms));
  }


export const validateRecaptcha = async (req, res, next) => {
    const token = req.body.recaptchaToken;
  
    if (!token) {
      return res.status(400).json({ 
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
        return res.status(400).json({
          success: false,
          message: 'Validación de ReCAPTCHA fallida'
        });
      }

      next();
    } catch (error) {
      console.error('Error validando ReCAPTCHA:', error);
      return res.status(500).json({
        success: false,
        message: 'Error al validar ReCAPTCHA'
      });
    }
  };