import { Product } from "../models/productModel.js";
import { productSchema } from "../schema/productSchema.js";


export const product = async (req, res) => {
    try {
        const { error, value } = productSchema.validate(req.body);
        if (error) {
            return res.status(400).json({ message: error.details[0].message });
        }
        // Extract image URLs from uploaded files.
        const imageUrls = req.files?.map(file => file.path) || [];
        const product = await Product.create({
            ...value,
            images: imageUrls
        });
        return res.status(201).json({ message: "Product created successfully", product });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}