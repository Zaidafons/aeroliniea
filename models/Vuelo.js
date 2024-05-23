const mongoose=require('mongoose');
//definir la esquema
const vueloSchema=new mongoose.Schema(
    {
        Capacidad: Number,
        Modelo: String,
        NumeroVuelo: Number,
        Compañia: String,
        Estado: String,
        usuario:{type: mongoose.Schema.Types.ObjectId,ref:'Usuario'}
    }
);
const VueloModel = mongoose.model('Vuelo', vueloSchema,'vuelo');
module.exports=VueloModel;



