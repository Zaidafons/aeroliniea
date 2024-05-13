//Importacion de librerias
const express=require("express");
const mongoose=require("mongoose");
require('dotenv').config();
const app=express();
//ruta
const PasajeRutas = require ('./rutas/PasajeRutas');
const PORT=process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI;

// MANEJANDO LOS JSON
app.use(express.json());

//CONEXION DE MONGODB
mongoose.connect(MONGO_URI).then(
    ()=>{
        console.log('Conexion exitosa')
        app.listen(PORT,()=>{console.log("Servidor express corriendo en el puerto "+ PORT)})
    }
).catch(error=>console.log('Error de Conexion', error));

//utilizamos las rutas de recetas
app.use('/pasaje', PasajeRutas);

