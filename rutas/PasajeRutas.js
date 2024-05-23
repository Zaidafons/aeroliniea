const express = require('express');
const rutas=express.Router();
const PasajeModel=require('../models/Pasaje');
const Vuelo=require('../models/Vuelo');
const VueloModel=require('../models/Vuelo');
const Usuario = require('../models/Usuario');
const UsuarioModel = require('../models/Usuario');

//enpoint 1. traer todos los Pasajes
rutas.get('/traerPasajes',async (req,res)=>{
    try{
        const pasaje= await PasajeModel.find();
        res.json(pasaje);
    }catch(error){
        res.status(500).json({mensaje:error.mensaje});
    }
});

//enpoint 2. Crear Pasajes
rutas.post('/crearPasaje', async(req, res) =>{
    const pasaje=new PasajeModel({
        Pasajero: req.body.Pasajero,
        Clase: req.body.Clase,
        Asiento: req.body.Asiento,
        Origen: req.body.Origen,
        Destino: req.body.Destino,
        Precio: req.body.Precio,
        Fecha_partida: req.body.Fecha_partida,
        Fecha_llegada: req.body.Fecha_llegada,
        vuelo:req.body.vuelo,
        usuario:req.body.usuario //asignar al usuario
    })
    try{
        const nuevoPasaje = await pasaje.save();
        res.status(201).json(nuevoPasaje);
    }catch(error){
        res.status(400).json({mensaje: error.mensaje})
    }
   
})

//enpoint 3. Editar Pasaje
rutas.put('/editar/:id', async(req, res) =>{

    try{
       const pasajeEditar = await PasajeModel.findByIdAndUpdate(req.params.id, req.body, {new : true});
       if (!pasajeEditar) 
            return res.status(404).json({mensaje: 'Pasaje no encontrado!!!'});
       else
            return res.json(pasajeEditar);
       
    }catch(error){
        res.status(400).json({mensaje: error.mensaje})
    }
   
})

//enpoint 4. Eliminar Pasaje
rutas.delete('/eliminar/:id', async(req, res)=>{
    try{
        const pasajeEliminar= await PasajeModel.findByIdAndDelete(req.params.id);
        if(!pasajeEliminar)
            return res.status(404).json({mensaje: 'Pasaje no encontrado!!!'});
        else
            return res.json({mensaje: 'Pasaje Eliminado'});
    }catch(error){
        res.status(500).json({mensaje:error.mensaje});
    }
})

//enpoint 5. Contar la cantidad de pasajeros por clase y origen
rutas.get('/informePasajeroClaseOrigen', async (req, res) => {
    try {
        const contarPasajeros = await PasajeModel.aggregate([
            { $group: { _id: { Clase: "$Clase", Origen: "$Origen" }, total_pasajeros: { $sum: 1 } } }
        ]);
        return res.json(contarPasajeros);
    } catch (error) {
        res.status(500).json({ mensaje: error.message });
    }
});

//enpoint 6. Obtener la suma total de precios y vuelos vendidos por destino
rutas.get('/informeTotalPasajerosPorDestino', async (req, res) => {
    try {
        const informePasajeros = await PasajeModel.aggregate([
            { $group: { _id: "$Destino", Total_precio: { $sum: "$Precio" }, Total_pasajeros: { $sum: 1 } } }
        ]);
        return res.json(informePasajeros);
    } catch (error) {
        res.status(500).json({ mensaje: error.message });
    }
});

//enpoint 7. Encontrar pasajeros que hayan pagado un precio superior al promedio en su clase de vuelo
rutas.get('/pasajerosPorPrecioMayorPromedio', async (req, res) => {
    try {
        const { clase_de_vuelo, precio_promedio_en_clase } = req.body;
        const pasajerosMayorPromedio = await PasajeModel.find({ 
            Clase: clase_de_vuelo, 
            Precio: { $gt: precio_promedio_en_clase } 
        });
            return res.json(pasajerosMayorPromedio);
    } catch (error) {
        res.status(500).json({ mensaje: error.message });
    }
});
  
//enpoint 8. Calcular la duración promedio de los vuelos por destino
rutas.get('/duracionDeVuelo', async (req, res) => {
    try {
        const duracion= await PasajeModel.aggregate([
            { $project: { _id: 0, Destino: 1, DuracionVuelo: { $divide: [{ $subtract: ["$Fecha_llegada", "$Fecha_partida"] }, 1000 * 60 * 60 ]}}},
            { $group: { _id: "$Destino", duracionPromedio: { $avg: "$DuracionVuelo" } } }
        ]);
        return res.json(duracion);
    } catch (error) {
        res.status(500).json({ mensaje: error.message });
    }
});

//enpoint 9. Obtener la lista de pasajeros que han viajado más de una vez
rutas.get('/masViajes', async (req, res) => {
    try {
        const pasajeros = await PasajeModel.aggregate([
            { $group: { _id: "$Pasajero", totalViajes: { $sum: 1 } } }, 
            { $match: { totalViajes: { $gt: 1 } } } 
        ]);
        return res.json(pasajeros);
    } catch (error) {
        res.status(500).json({ mensaje: error.message });
    }
});

//REPORTES 1
rutas.get('/pasajePorUsuario/:usuarioId', async(peticion, respuesta)=>{
    const {usuarioId}=peticion.params;
    try {
       const usuario=await UsuarioModel.findById(usuarioId);
       if(!usuario)
        return res.status(404).json({mesaje: 'Usuario no Encontrado'});
        const pasajes=await PasajeModel.find({usuario:usuarioId}).populate('usuario');
        respuesta.json(pasajes);
    } catch (error) {
        res.status(500).json({ mensaje: error.message });
    }
})

//REPORTES 2 
//SUMAR EL GASTO TOTAL DE COMPRA DE PASAJES POR USUARIO
rutas.get('/gastoPorUsuario', async(req, res)=>{
    try {
        const usuarios=await UsuarioModel.find();
        const reporte=await Promise.all(
            usuarios.map(async(usuario1)=>{
                const pasaje=await PasajeModel.find({usuario:usuario1._id});
                const totalGasto=pasaje.reduce((sum, pasaje)=>sum + pasaje.Precio, 0);
                return{
                    usuario:{
                        _id: usuario1._id,
                        Pasajero: usuario1.Pasajero
                    },
                    totalGasto,
                    pasaje: pasaje.map(r => ({
                        _id: r._id,
                        nombre: r.Pasajero,
                        precio:r.Precio

                    }))
                }
            })
        )
        res.json(reporte);
     } catch (error) {
         res.status(500).json({ mensaje: error.message });
     }
});

//REPORTE 3
//Obtener todos los pasajeros de un vuelo específico
rutas.get('/cantidadPasajerosPorVuelo/:numeroVuelo', async (req, res) => {
    try {
        const numeroVuelo = req.params.numeroVuelo; // Obtener el número de vuelo de la solicitud

        // Obtener información del vuelo desde VueloModel
        const vuelo = await VueloModel.findOne({ NumeroVuelo: numeroVuelo });
        console.log('Número de vuelo:', numeroVuelo); // Añadir esto para verificar el número de vuelo
        
        // Utilizar la agregación para contar los pasajeros por vuelo
        const resultado = await PasajeModel.aggregate([
            // Filtrar por el número de vuelo
            { $group: { _id: numeroVuelo, cantidadPasajeros: { $sum: 1 } } } // Sumar los pasajeros por vuelo
           
        ]);

        console.log('Resultado de la agregación:', resultado); // Agregar esto para ver el resultado de la agregación

        if (resultado.length === 0) {
            return res.status(404).json({ mensaje: 'No se encontraron pasajeros para el vuelo especificado' });
        }

        const { cantidadPasajeros } = resultado[0]; // Obtener la cantidad de pasajeros del resultado de la agregación

        res.json({ 
            numeroVuelo,
            cantidadPasajeros,
            modelo: vuelo.Modelo,
            compañia: vuelo.Compañia
        });
    } catch (error) {
        res.status(500).json({ mensaje: error.message });
    }
});


//REPORTE 4
//venta de pasjes por vuelo 
rutas.get('/ingresoPorVuelo', async(req, res)=>{
    try {
        const vuelos=await VueloModel.find();
        const reporte=await Promise.all(
            vuelos.map(async(vuelo1)=>{
                const pasaje=await PasajeModel.find({vuelo:vuelo1._id});
                const totalIngreso=pasaje.reduce((sum, pasaje)=>sum + pasaje.Precio, 0);
                return{
                    vuelo:{
                        _id: vuelo1._id,
                        Vuelo: vuelo1.Vuelo
                    },
                    totalIngreso,
                    pasaje: pasaje.map(r => ({
                        _id: r._id,
                        nombre: r.Pasajero,
                        precio:r.Precio
                    }))
                }
            })
        )
        res.json(reporte);
     } catch (error) {
         res.status(500).json({ mensaje: error.message });
     }
});
  
module.exports = rutas; 
