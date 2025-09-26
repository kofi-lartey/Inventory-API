import Joi from 'joi';

export const productSchema = Joi.object({
    // Core Product Information
    name: Joi.string()
        .trim()
        .max(100)
        .required()
        .messages({
            'string.empty': 'Please enter a product name',
            'string.max': 'Product name cannot exceed 100 characters',
            'any.required': 'Product name is required',
        }),
    description: Joi.string()
        .required()
        .messages({
            'string.empty': 'Please enter a product description',
            'any.required': 'Product description is required',
        }),
    price: Joi.number()
        .min(0)
        .precision(2) // allows float values with up to 2 decimal places
        .required()
        .messages({
            'number.base': 'Please enter a valid price',
            'number.min': 'Price must be a positive number',
            'any.required': 'Product price is required',
        }),
    images: Joi.array()
        .items(Joi.string())
        .messages({
            'array.base': 'Images must be an array of strings',
        }),
    category: Joi.string()
        .valid('Electronics', 'Apparel', 'Home Goods', 'Books', 'Toys', 'Others')
        .required()
        .messages({
            'any.only': 'Please select a valid category',
            'any.required': 'Product category is required',
        }),

    // Inventory Management
    stock: Joi.number()
        .integer()
        .min(0)
        .required()
        .messages({
            'number.base': 'Stock must be a number',
            'number.integer': 'Stock must be an integer',
            'number.min': 'Stock cannot be a negative number',
            'any.required': 'Product stock is required',
        }),
    supplier: Joi.string()
        .allow(null, ''), // Allows the field to be optional
    location: Joi.string()
        .allow(null, ''),
    reorderLevel: Joi.number()// at what stock level to reorder
        .integer()
        .min(0)
        .default(0),
    costOfGoodsSold: Joi.number()
        .min(0)
        .default(0),

    // Product Variations & Details
    size: Joi.string()
        .trim()
        .allow(null, ''),
    color: Joi.string()
        .trim()
        .allow(null, ''),
    materials: Joi.string()
        .trim()
        .allow(null, ''),
    weight: Joi.number()
        .min(0)
        .default(0),

    // Marketing & User Feedback
    keywords: Joi.array()
        .items(Joi.string()),
    ratings: Joi.number()
        .min(0)
        .max(5)
        .default(0),
    reviews: Joi.number()
        .integer()
        .min(0)
        .default(0),
});