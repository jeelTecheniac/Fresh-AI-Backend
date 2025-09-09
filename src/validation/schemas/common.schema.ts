import Joi from "joi";

export const commonPatterns = {
  email: Joi.string().email().max(255).trim().lowercase(),
  password: Joi.string()
    .min(6)
    .max(128)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .message(
      "Password must contain at least one lowercase letter, one uppercase letter, and one number"
    ),
  uuid: Joi.string().uuid({ version: "uuidv4" }),
  name: Joi.string()
    .min(2)
    .max(100)
    .trim()
    .pattern(/^[a-zA-Z\s'-]+$/)
    .message("Name can only contain letters, spaces, hyphens, and apostrophes"),
  username: Joi.string()
    .min(3)
    .max(30)
    .trim()
    .pattern(/^[a-zA-Z0-9._-]+$/)
    .message(
      "Username can contain letters, numbers, dots, underscores, and hyphens"
    ),
  url: Joi.string().uri().max(500),
  positiveInteger: Joi.number().integer().positive(),
  nonNegativeInteger: Joi.number().integer().min(0),
  jsonObject: Joi.object().unknown(true),
  timestamp: Joi.date().iso(),
  isBoolean: Joi.boolean(),
  isNumber: Joi.number(),
  token: Joi.string(),
};

export default commonPatterns;
