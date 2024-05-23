//Importacion de librerias
const express=require("express");
const mongoose=require("mongoose");
const jwt=require('jsonwebtoken');
const authRutas=require('./rutas/authRutas');
const Usuario=require('./models/Usuario')
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

const autenticar=async(req, res, next)=>{
    try{
        const token=req.headers.authorization?.split(' ')[1];
        if (!token) 
            res.status(401).json({mensaje: 'No existe el token de autentificacion'})
        const decodificar=jwt.verify(token, 'clave_secreta');
        req.usuario=await Usuario.findById(decodificar.usuarioId);
        next();
        
    }
    catch(error){
        res.status(400).json({error: 'Token Invalido!!'});
    }
};

app.use('/auth', authRutas);
app.use('/pasaje',autenticar, PasajeRutas);

//utilizamos las rutas de recetas
//app.use('/pasaje', PasajeRutas);

