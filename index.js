import express from 'express';
import { MONGOURI, PORT } from './config/env.js';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import { userRouter } from './routers/userRouter.js';
import { productRouter } from './routers/productRouter.js';

const app = express();
app.use(express.json());
app.use(cors())

// routers
app.use('/api/V1/user', userRouter)
app.use('/api/V1/product', productRouter)



await mongoose.connect(MONGOURI)
app.listen(PORT,()=>{
    console.log(`Server is running on port http://localhost:${PORT}`);
})