import axios from "axios";

export const sleep = (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms));
  }


export const validateCaptcha = async (token) => {
  try {
    const response = await axios.post(
      "https://hcaptcha.com/siteverify",
      new URLSearchParams({
        secret: "0xf7..",
        response: token,
      })
    );
    return response.data.success;
  } catch (error) {
    console.error("Error validando hCaptcha:", error);
    return false;
  }
};