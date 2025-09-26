import { Router } from "express";
import { product } from "../controllers/productController.js";


export const productRouter = Router();

productRouter.post('/create', product)