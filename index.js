import express from 'express';
import { MONGOURI, PORT } from './config/env.js';
import mongoose from 'mongoose';


const app = express();

app.use(express.json());





await mongoose.connect(MONGOURI)
app.listen(PORT,()=>{
    console.log(`Server is running on port http://localhost:${PORT}`);
})