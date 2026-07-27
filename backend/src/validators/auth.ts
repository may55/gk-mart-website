import Joi from 'joi';

const signupSchema = Joi.object({
  name: Joi.string()
    .required()
    .trim()
    .min(2)
    .max(100)
    .messages({
      'string.empty': 'Name is required',
      'string.min': 'Name must be at least 2 characters',
      'string.max': 'Name must not exceed 100 characters',
    }),
  email: Joi.string()
    .email()
    .required()
    .lowercase()
    .messages({
      'string.email': 'Please provide a valid email',
      'string.empty': 'Email is required',
    }),
  number: Joi.string()
    .required()
    .pattern(/^\d{10}$/)
    .messages({
      'string.pattern.base': 'Phone number must be exactly 10 digits',
      'string.empty': 'Phone number is required',
    }),
  password: Joi.string()
    .required()
    .min(6)
    .max(50)
    .messages({
      'string.min': 'Password must be at least 6 characters',
      'string.max': 'Password must not exceed 50 characters',
      'string.empty': 'Password is required',
    }),
});

const loginSchema = Joi.object({
  identifier: Joi.string()
    .required()
    .messages({
      'string.empty': 'Email or phone number is required',
    }),
  password: Joi.string()
    .required()
    .messages({
      'string.empty': 'Password is required',
    }),
});

const validateSignup = (data: any) => {
  return signupSchema.validate(data, { abortEarly: false });
};

const validateLogin = (data: any) => {
  return loginSchema.validate(data, { abortEarly: false });
};

export { validateSignup, validateLogin };
