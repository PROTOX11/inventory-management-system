import { z } from 'zod';

export const productCreateSchema = z.object({
  sku: z.string().min(1, 'SKU is required').max(50, 'SKU must be less than 50 characters'),
  name: z.string().min(1, 'Product name is required').max(255, 'Name must be less than 255 characters'),
  description: z.string().max(1000, 'Description must be less than 1000 characters').optional().default(''),
  price: z.number().positive('Price must be greater than 0'),
  quantity: z.number().int().nonnegative('Quantity cannot be negative').optional(),
  initial_quantity: z.number().int().nonnegative('Initial quantity cannot be negative'),
});

export const productUpdateSchema = productCreateSchema.partial();

export type ProductCreate = z.infer<typeof productCreateSchema>;
export type ProductUpdate = z.infer<typeof productUpdateSchema>;

export const customerCreateSchema = z.object({
  email: z.string().email('Invalid email address'),
  name: z.string().min(1, 'Customer name is required').max(255, 'Name must be less than 255 characters'),
  phone: z.string().min(1, 'Phone number is required').max(20, 'Phone must be less than 20 characters'),
  address: z.string().min(1, 'Address is required').max(500, 'Address must be less than 500 characters'),
});

export const customerUpdateSchema = customerCreateSchema.partial();

export type CustomerCreate = z.infer<typeof customerCreateSchema>;
export type CustomerUpdate = z.infer<typeof customerUpdateSchema>;

export const orderItemSchema = z.object({
  product_id: z.string().min(1, 'Product ID is required'),
  quantity: z.number().int().positive('Quantity must be greater than 0'),
  price: z.number().positive('Price must be greater than 0'),
});

export const orderCreateSchema = z.object({
  customer_id: z.string().min(1, 'Customer ID is required'),
  items: z.array(orderItemSchema).min(1, 'At least one item is required'),
});

export const orderUpdateSchema = z.object({
  status: z.enum(['pending', 'confirmed', 'shipped', 'delivered', 'cancelled']),
});

export type OrderCreate = z.infer<typeof orderCreateSchema>;
export type OrderUpdate = z.infer<typeof orderUpdateSchema>;
