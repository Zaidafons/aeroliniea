const mongoose=require('mongoose');
//definir la esquema
const pasajeSchema=new mongoose.Schema(
    {
        Pasajero: String,
        Clase: String,
        Asiento: String,
        Origen: String,
        Destino: String,
        Precio: Number,
        Fecha_partida: Date,
        Fecha_llegada: Date,
        vuelo:{type: mongoose.Schema.Types.ObjectId,ref:'Vuelo'},
        usuario:{type: mongoose.Schema.Types.ObjectId,ref:'Usuario'}
        
    }
);
const PasajeModel = mongoose.model('Pasaje', pasajeSchema,'pasaje');
module.exports=PasajeModel;
