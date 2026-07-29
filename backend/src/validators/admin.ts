import Joi from 'joi';

const adminLoginSchema = Joi.object({
  email: Joi.string().email().required().lowercase().messages({
    'string.email': 'Please provide a valid email',
    'string.empty': 'Email is required',
  }),
  password: Joi.string().required().messages({
    'string.empty': 'Password is required',
  }),
});

const productCreateSchema = Joi.object({
  name: Joi.string().required().trim().min(1).max(100),
  volume: Joi.string().required().trim().min(1).max(50),
  sellingPrice: Joi.number().required().min(0),
  marketPrice: Joi.number().required().min(0),
  unitsInStock: Joi.number().min(0).default(0),
  averageCostPrice: Joi.number().min(0).default(0),
  categories: Joi.array().items(Joi.string().trim()).default([]),
});

const productUpdateSchema = Joi.object({
  name: Joi.string().trim().min(1).max(100),
  volume: Joi.string().trim().min(1).max(50),
  sellingPrice: Joi.number().min(0),
  marketPrice: Joi.number().min(0),
  unitsInStock: Joi.number().min(0),
  averageCostPrice: Joi.number().min(0),
  categories: Joi.array().items(Joi.string().trim()),
});

const inventoryBatchCreateSchema = Joi.object({
  itemEnum: Joi.string().required().trim().lowercase(),
  numberOfUnits: Joi.number().required().min(1),
  totalCostPrice: Joi.number().required().min(0),
  marginPercent: Joi.number().required().min(0),
  vendorName: Joi.string().allow('').default(''),
});

const inventoryBatchUpdateSchema = Joi.object({
  marginPercent: Joi.number().required().min(0),
});

const inventoryBulkCreateSchema = Joi.object({
  vendorName: Joi.string().allow('').default(''),
  items: Joi.array()
    .items(
      Joi.object({
        itemEnum: Joi.string().required().trim().lowercase(),
        numberOfUnits: Joi.number().required().min(1),
        totalCostPrice: Joi.number().required().min(0),
        marginPercent: Joi.number().required().min(0),
      })
    )
    .min(1)
    .required(),
});

const orderItemSchema = Joi.object({
  enum: Joi.string().required(),
  unit: Joi.number().required().min(1),
  sellingPrice: Joi.number().required().min(0),
  costPrice: Joi.number().required().min(0),
  mrp: Joi.number().required().min(0),
});

const userAddressSchema = Joi.object({
  label: Joi.string().allow('').default(''),
  line1: Joi.string().allow('').default(''),
  line2: Joi.string().allow('').default(''),
  pincode: Joi.string().allow('').default(''),
  city: Joi.string().allow('').default(''),
  state: Joi.string().allow('').default(''),
  phone: Joi.string().allow('').default(''),
});

const orderCreateSchema = Joi.object({
  items: Joi.array().items(orderItemSchema).min(1).required(),
  userId: Joi.string().required(),
  totalAmount: Joi.number().required().min(0),
  userAddress: userAddressSchema.required(),
  paymentMethod: Joi.string().required().trim(),
  deliveryStatus: Joi.string()
    .valid('pending', 'processing', 'shipped', 'delivered', 'cancelled')
    .default('pending'),
  deliveredAt: Joi.date().optional(),
  invoiceLink: Joi.string().allow('').default(''),
});

const orderUpdateSchema = Joi.object({
  items: Joi.array().items(orderItemSchema).min(1),
  userId: Joi.string(),
  totalAmount: Joi.number().min(0),
  userAddress: userAddressSchema,
  paymentMethod: Joi.string().trim(),
  deliveryStatus: Joi.string().valid(
    'pending',
    'processing',
    'shipped',
    'delivered',
    'cancelled'
  ),
  deliveredAt: Joi.date().optional().allow(null),
  invoiceLink: Joi.string().allow(''),
});

const adminUserCreateSchema = Joi.object({
  name: Joi.string().required().trim().min(2).max(100),
  email: Joi.string().email().required().lowercase(),
  number: Joi.string()
    .required()
    .pattern(/^\d{10}$/)
    .messages({ 'string.pattern.base': 'Phone number must be exactly 10 digits' }),
  password: Joi.string().required().min(6).max(50),
  userRole: Joi.string().valid('admin', 'customer').default('customer'),
  addresses: Joi.array().items(userAddressSchema).default([]),
});

const adminUserUpdateSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100),
  email: Joi.string().email().lowercase(),
  number: Joi.string()
    .pattern(/^\d{10}$/)
    .messages({ 'string.pattern.base': 'Phone number must be exactly 10 digits' }),
  userRole: Joi.string().valid('admin', 'customer'),
  addresses: Joi.array().items(userAddressSchema),
});

export const validateAdminLogin = (data: unknown) =>
  adminLoginSchema.validate(data, { abortEarly: false });
export const validateProductCreate = (data: unknown) =>
  productCreateSchema.validate(data, { abortEarly: false });
export const validateProductUpdate = (data: unknown) =>
  productUpdateSchema.validate(data, { abortEarly: false });
export const validateInventoryBatchCreate = (data: unknown) =>
  inventoryBatchCreateSchema.validate(data, { abortEarly: false });
export const validateInventoryBatchUpdate = (data: unknown) =>
  inventoryBatchUpdateSchema.validate(data, { abortEarly: false });
export const validateInventoryBulkCreate = (data: unknown) =>
  inventoryBulkCreateSchema.validate(data, { abortEarly: false });
export const validateOrderCreate = (data: unknown) =>
  orderCreateSchema.validate(data, { abortEarly: false });
export const validateOrderUpdate = (data: unknown) =>
  orderUpdateSchema.validate(data, { abortEarly: false });
export const validateAdminUserCreate = (data: unknown) =>
  adminUserCreateSchema.validate(data, { abortEarly: false });
export const validateAdminUserUpdate = (data: unknown) =>
  adminUserUpdateSchema.validate(data, { abortEarly: false });
