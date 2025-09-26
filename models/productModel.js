import { model, Schema } from "mongoose";
import normalize from 'normalize-mongoose';

export const productModel = new Schema({
    // Core Product Information
    name: {
        type: String,
        required: [true, 'Please enter product name'],
        trim: true,
        maxlength: [100, 'Product name cannot exceed 100 characters']
    },
    description: {
        type: String,
        required: [true, 'Please enter product description']
    },
    price: {
        type: Number,
        required: [true, 'Please enter product price'],
        default: 0.0,
    },
    images: [String],
    category: {
        type: String,
        required: [true, 'Please select a category'],
        // Using an enum to enforce valid categories is a good practice
        enum: [
            'Electronics',
            'Apparel',
            'Home Goods',
            'Books',
            'Toys',
            'Others'
        ]
    },

    // Inventory Management
    stock: {
        type: Number,
        required: [true, 'Please enter product stock'],
        default: 0
    },
    supplier: {
        type: String,
        // Optional, but useful for tracking
    },
    location: {
        type: String,
        // Optional, for multi-warehouse setups
    },
    reorderLevel: {
        type: Number,
        default: 0
    },
    costOfGoodsSold: {
        type: Number,
        default: 0
    },

    // Product Variations & Details
    size: {
        type: String,
        trim: true,
    },
    color: {
        type: String,
        trim: true,
    },
    materials: {
        type: String,
        trim: true,
    },
    weight: {
        type: Number,
        default: 0,
    },

    // Marketing & User Feedback
    keywords: [String], // An array of strings for search optimization
    ratings: {
        type: Number,
        default: 0,
    },
    reviews:{
        type: Number,
        default: 0,
    }
},{timestamps: true});
productModel.plugin(normalize)

export const Product = model("Product", productModel);