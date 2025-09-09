import Joi from "joi";

export const createRoleSchema = Joi.object({
  name: Joi.string()
    .min(2)
    .max(100)
    .trim()
    .pattern(/^[a-zA-Z0-9._\-\s]+$/)
    .message(
      "Role name can contain letters, numbers, spaces, dots, underscores, hyphens"
    )
    .required(),
}).strict();

export default { createRoleSchema };
