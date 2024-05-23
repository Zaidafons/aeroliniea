const {response}=require('express');
const jwt = require('jsonwebtoken');
const Usuario = require('../model/usuario');
const {tokenEnTokenBlacklist } = require('./revocacion_token');
const {validationResult}=require('express-validator');

const validarCampos=(req,res=response,next)=>{
    const errores= validationResult(req);
    if(!errores.isEmpty()) {
        return res.status(400).json({
            ok:false,
            errores:errores.mapped()
        })
    }
    //fltaba paraetro de next
    next();
}

const autenticar = (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
        return res.status(401).json({
            ok: false,
            msg: 'token no autenticado',
        });
    }

    if (tokenEnTokenBlacklist(token)) {
        return res.status(401).json({
            ok: false,
            msg: 'Token revocado',
        });
    }

    try {
        const decoded = jwt.verify(token, 'clave_secreta');
        req.usuarioId = decoded.usuarioId;
        next();
    } catch (error) {
        return res.status(401).json({
            ok: false,
            msg: 'Token no válido',
        });
    }
};




module.exports={
    validarCampos,
    autenticar
}