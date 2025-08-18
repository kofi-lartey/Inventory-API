import axios from 'axios';
import { PayStack_Test_Secret_Key } from '../config/env.js';


export const paystack = axios.create({
    baseURL: 'https://api.paystack.co',
    headers: {
        Authorization: `Bearer ${PayStack_Test_Secret_Key}`,
        'Content-Type': 'application/json'
    }
});