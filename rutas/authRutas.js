const express = require('express');
const rutas=express.Router();
const Usuario = require('../models/Usuario');
const {agregarATokenBlacklist } = require('../middlewares/revocacion_token');
const bcrypt=require('bcrypt');
const jwt=require('jsonwebtoken');
const JWT_SECRET = 'tu_secreto'

//registro
rutas.post('/registro', async (req, res) => {
    try{
        const{nombreUsuario, correo, contraseña}=req.body;
        const usuario=new Usuario({nombreUsuario, correo, contraseña});
        await usuario.save();
        res.status(201).json({mensaje: 'Usuario Registrado'});
    }
    catch(error){
        res.status(500).json({mensaje: error.mensaje});
    }
});

//inicio de sesion
rutas.post('/iniciosesion', async (req, res)=>{
    try{
        const {correo, contraseña}= req.body;
        const usuario= await Usuario.findOne({correo});
        if (!usuario) 
            return res.status(401).json({error: 'Correo Invalido!!!'});
        const validarContraseña=await usuario.compararContraseña(contraseña);
        if(!validarContraseña)
            return res.status(401).json({error: 'Contraseña Invalida!!!'});
        //validacion de token
        const token=jwt.sign({usuarioId: usuario._id},'clave_secreta',{expiresIn: '1h'});
        res.json({token});
    }
    catch(error){
        res.status(500).json({mensaje: error.mensaje});
    }
});

rutas.post('/cerrarsesion', async (req, res) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');

        if (token) {
            agregarATokenBlacklist(token);
            //console.log(`Token revocado: ${token}`);

            res.status(200).json({
                ok: true,
                msg: 'sesion cerrada',
                tokenRevocado: token
            });
        } else {
            // Si no se proporcionó ningún token en la cabecera de autorización
            res.status(400).json({
                ok: false,
                msg: 'sesion no iniciada o token no autenticado'
            });
        }
    } catch (error) {
        res.status(500).json({ mensaje: error.message });
    }
});

rutas.get('/protected', async (req, res) => {
    res.status(201).json({ message: 'Esta es una ruta protegida.' });
  });
  
module.exports=rutas;