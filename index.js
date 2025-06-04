// const express = require('express'); //Common JS
import express from 'express'; //ES module
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import veterinarianRouter from './routes/veterinarianRoutes.js'; //el export defaul pruede cambiar de nombre
import patientRouter from './routes/patientRoutes.js'

const app = express();
const PORT = process.env.PORT ?? 4000;

app.use(express.json()); //habilita el request 
dotenv.config();
connectDB();

app.use('/api/veterinarian', veterinarianRouter);
app.use('/api/patient', patientRouter);

app.listen(PORT, () => {
    console.log(`Server runing on the port ${PORT}`);
});