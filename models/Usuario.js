const mongoose=require('mongoose');
const bcrypt=require('bcrypt');
//definir la esquema
const usuarioSchema=new mongoose.Schema({
        nombreUsuario: {
            type: String,
            require: true,
            unique: true
        },
        correo: {
            type: String,
            require: true,
            unique: true
        },
        contraseña: {
            type: String,
            require: true,
           
        }
       
        
    });


usuarioSchema.pre('save', async function (next){
    if (this.isModified('contraseña')) {
        this.contraseña=await bcrypt.hash(this.contraseña, 10);
    }
    next();
});
//comparar la contraseña 
usuarioSchema.methods.compararContraseña=async function(contraseñaComparar){
    return await bcrypt.compare(contraseñaComparar, this.contraseña);
};
const UsuarioModel = mongoose.model('Usuario', usuarioSchema,'usuario');
module.exports=UsuarioModel;
