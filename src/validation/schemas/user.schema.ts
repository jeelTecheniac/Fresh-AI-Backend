import Joi from "joi";
import { commonPatterns } from "./common.schema.js";

export const registerUserSchema = Joi.object({
  email: commonPatterns.email.required(),
  password: commonPatterns.password.required(),
  firstName: commonPatterns.name.required(),
  lastName: commonPatterns.name.required(),
  avatar: commonPatterns.url.optional(),
}).strict();

export const loginSchema = Joi.object({
  email: commonPatterns.email.required(),
  password: Joi.string().required(),
}).strict();

export const updateProfileSchema = Joi.object({
  firstName: commonPatterns.name.optional(),
  lastName: commonPatterns.name.optional(),
  avatar: commonPatterns.url.optional(),
  metadata: commonPatterns.jsonObject.optional(),
})
  .strict()
  .min(1);

export const userIdParamSchema = Joi.object({
  id: commonPatterns.uuid.required(),
}).strict();

export const paginationQuerySchema = Joi.object({
  limit: commonPatterns.positiveInteger.max(100).default(10),
  offset: commonPatterns.nonNegativeInteger.default(0),
}).strict();

export default {
  registerUserSchema,
  loginSchema,
  updateProfileSchema,
  userIdParamSchema,
  paginationQuerySchema,
};
