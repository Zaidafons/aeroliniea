const express = require('express');
const rutas=express.Router();
const PasajeModel=require('../models/Pasaje');

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
        Fecha_llegada: req.body.Fecha_llegada
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


module.exports = rutas; 
