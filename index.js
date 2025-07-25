// const express = require('express'); //Common JS
import express from 'express'; //ES module
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db.js';
import veterinarianRouter from './routes/veterinarianRoutes.js'; //el export defaul pruede cambiar de nombre
import patientRouter from './routes/patientRoutes.js'

const app = express();
const PORT = process.env.PORT ?? 4000;

app.use(express.json()); //habilita el request 
dotenv.config();
connectDB();


const whiteList = ['http://localhost:5173'];
const coreOptions = {
    origin: function(origin, callback) {
        if(whiteList.indexOf(origin) !== -1) {
            //El origne del request esta permitido
            callback(null, true);
        }else {
            callback(new Error('Petición bloqueada por CORS'));
        }
    }
}
// Middleware
app.use(cors(coreOptions)); // Habilita CORS para permitir peticiones desde tu app de React

app.use(express.json()); // Para parsear el body de las peticiones JSON

//Rutas base de la API
app.use('/api/veterinarian', veterinarianRouter);
app.use('/api/patient', patientRouter);

app.listen(PORT, () => {
    console.log(`Server runing on the port ${PORT}`);
});