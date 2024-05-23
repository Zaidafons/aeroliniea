const express = require('express');
const rutas=express.Router();
const VueloModel=require('../models/Vuelo');
const Usuario = require('../models/Usuario');
const UsuarioModel = require('../models/Usuario');

//enpoint 1. traer todos los Vuelos
rutas.get('/traerVuelos',async (req,res)=>{
    try{
        const vuelo= await VueloModel.find();
        res.json(vuelo);
    }catch(error){
        res.status(500).json({mensaje:error.mensaje});
    }
});

//enpoint 2. Crear Vuelos
rutas.post('/crearVuelo', async(req, res) =>{
    const vuelo=new VueloModel({
        Capacidad: req.body.Capacidad,
        Modelo: req.body.Modelo,
        NumeroVuelo: req.body.NumeroVuelo,
        Compañia: req.body.Compañia,
        Estado: req.body.Estado,
        usuario:req.body.usuario
    })
    try{
        const nuevoVuelo= await vuelo.save();
        res.status(201).json(nuevoVuelo);
    }catch(error){
        res.status(400).json({mensaje: error.mensaje})
    }
   
})

//enpoint 3. Editar Vuelos
rutas.put('/editar/:id', async(req, res) =>{

    try{
       const vueloEditar = await VueloModel.findByIdAndUpdate(req.params.id, req.body, {new : true});
       if (!vueloEditar) 
            return res.status(404).json({mensaje: 'Vuelo no encontrado!!!'});
       else
            return res.json(vueloEditar);
       
    }catch(error){
        res.status(400).json({mensaje: error.mensaje})
    }
   
})

//enpoint 4. Eliminar Vuelo
rutas.delete('/eliminar/:id', async(req, res)=>{
    try{
        const vueloEliminar= await VueloModel.findByIdAndDelete(req.params.id);
        if(!vueloEliminar)
            return res.status(404).json({mensaje: 'Vuelo no encontrado!!!'});
        else
            return res.json({mensaje: 'Vuelo Eliminado'});
    }catch(error){
        res.status(500).json({mensaje:error.mensaje});
    }
})