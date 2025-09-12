import Joi from "joi";
import { commonPatterns } from "./common.schema.js";

export const registerUserSchema = Joi.object({
  fullName: commonPatterns.name.required(),
  userName: commonPatterns.username.required(),
  email: commonPatterns.email.required(),
  company: commonPatterns.name.required(),
  department: commonPatterns.name.required(),
  password: commonPatterns.password.optional(),
  avatar: commonPatterns.url.optional(),
  role: commonPatterns.uuid.optional(),
}).strict();

export const registeAdminUserSchema = Joi.object({
  fullName: commonPatterns.name.required(),
  userName: commonPatterns.username.required(),
  email: commonPatterns.email.required(),
  company: commonPatterns.name.required(),
  department: commonPatterns.name.required(),
  totalUserLicenses: commonPatterns.positiveInteger.optional(),
  maxPersonas: commonPatterns.positiveInteger.optional(),
  maxImageLimit: commonPatterns.positiveInteger.optional(),
  maxDocumentUpload: commonPatterns.positiveInteger.optional(),
  monthlyQueryLimit: commonPatterns.positiveInteger.optional(),
}).strict();

export const resendAdminPasswordEmailSchema = Joi.object({
  userId: commonPatterns.isString.uuid().required(),
});

export const loginSchema = Joi.object({
  email: commonPatterns.email.required(),
  password: commonPatterns.password.required(),
}).strict();

export const forgotPasswordSchema = Joi.object({
  email: commonPatterns.email.required(),
}).strict();

export const verifyResetPasswordToken = Joi.object({
  token: commonPatterns.token.required(),
});

export const resetPasswordSchema = Joi.object({
  token: commonPatterns.token.required(),
  password: commonPatterns.password.required(),
  confirmPassword: commonPatterns.password.required(),
});

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
  forgotPasswordSchema,
  updateProfileSchema,
  userIdParamSchema,
  paginationQuerySchema,
};
