const express = require('express');
const request=require('supertest');
const PasajeRutas=require('../../rutas/PasajeRutas');
const PasajeModel=require('../../models/Pasaje');
const { default: mongoose } = require('mongoose');
const Test = require('supertest/lib/test');
const app=express();
app.use(express.json());
app.use('/pasaje', PasajeRutas);

describe('Prueba Unitarias para Pasajes', () =>{
    //se ejecuta antes de inicar las priebas
    beforeEach(async () => {
        await mongoose.connect('mongodb://127.0.0.1:27017/aerolinia',{
            useNewUrlParser : true,
        });
        await PasajeModel.deleteMany({});
    });
    //al finalizar las pruebas
    afterAll(() =>{
        return mongoose.connection.close();
    });

    //1° test
    test('Deberia mostrarme todos los pasajes metodo: GET: getPasaje', async() =>{
        await PasajeModel.create({Pasajero:"Carmen Chauca", Clase:"Ejecutivo", Asiento:"F12", 
        Origen:"Cochabamba", Destino:"La Paz", Precio:500, Fecha_llegada:"2024-05-10T10:30:00.000+00:00", Fecha_partida:"2024-05-10T12:00:00.000+00:00"});
        await PasajeModel.create({Pasajero:"Aracely Galarza", Clase:"Premiun", Asiento:"C12", 
        Origen:"La Paz", Destino:"Santa Cruz", Precio:650, Fecha_llegada:"2024-05-10T10:30:00.000+00:00", Fecha_partida:"2024-05-10T12:00:00.000+00:00"});
        //solicitud-request
        const res=await request(app).get('/pasaje/traerPasajes');
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveLength(2);
    }, 10000);

    test('Deneria agregar una nuevo pasaje: POST: /crear', async() =>{
        const nuevoPasaje = {
            Pasajero: 'Zaida Galarza',
            Clase: 'Ejecutivo',
            Asiento: 'D7',
            Origen: 'La Paz',
            Destino: 'Santa Cruz',
            Precio: 680,
            Fecha_llegada:"2024-05-10T10:30:00.000+00:00", 
            Fecha_partida:"2024-05-10T12:00:00.000+00:00"
        };
        const res=await request(app)
                                .post('/pasaje/crearPasaje')
                                .send(nuevoPasaje);
        expect(res.statusCode).toEqual(201);
        expect(res.body.Pasajero).toEqual(nuevoPasaje.Pasajero);
    });

    test('Deberia actualizar infromacion de los Pasajes que ya existen', async()=>{
        const pasajeCreado= await PasajeModel.create(
            {Pasajero:"Carmen Chauca", 
            Clase:"Ejecutivo", 
            Asiento:"F12", 
            Origen:"Cochabamba",
            Destino:"La Paz",
            Precio:500, 
            Fecha_llegada:"2024-05-10T10:30:00.000+00:00", 
            Fecha_partida:"2024-05-10T12:00:00.000+00:00"});
        const pasajeActualizar={
            Pasajero:"Carmen Chauca", 
            Clase:"Ejecutivo", 
            Asiento:"F10", 
            Origen:"Cochabamba",
            Destino:"La Paz",
            Precio:700, 
            Fecha_llegada:"2024-05-10T10:30:00.000+00:00", 
            Fecha_partida:"2024-05-10T12:00:00.000+00:00"
        };
        const res=await request(app)
                                .put('/pasaje/editar/'+pasajeCreado._id)
                                .send(pasajeActualizar);
        expect(res.statusCode).toEqual(200);
        expect(res.body.Pasajero).toEqual(pasajeActualizar.Pasajero);
    });

    test('Deberia eliminar un pasaje existente: DELETE /eliminar/:id', async()=>{
        const pasajeCreado= await PasajeModel.create(
            {Pasajero:"Carmen Chauca", 
            Clase:"Ejecutivo", 
            Asiento:"F12", 
            Origen:"Cochabamba",
            Destino:"La Paz",
            Precio:500, 
            Fecha_llegada:"2024-05-10T10:30:00.000+00:00", 
            Fecha_partida:"2024-05-10T12:00:00.000+00:00"});
        
            const res=await request(app)
                                    .delete('/pasaje/eliminar/'+pasajeCreado._id);
            expect(res.statusCode).toEqual(200);
            expect(res.body).toEqual({mensaje: 'Pasaje Eliminado'});
    });
});