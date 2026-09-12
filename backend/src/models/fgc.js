const mongoose = require('mongoose');

const fgcschema = new mongoose.Schema({
    name:{
        type: String,
        required: [true, "Qual o seu nome?"]
    },
    email:{
        type: String,
        required: [true, "Qual o seu email?"]
    },
    QGC1:{
        type: String,
        required: [true,"Resposta necessaria!"]
    },
    QGC2:{
        type: String,
        required: [true,"Resposta necessaria!"]
    },
    QGC3:{
        type: String,
        required: [true,"Resposta necessaria!"]
    },
    QGC4:{
        type: String,
        required: [true,"Resposta necessaria!"]
    },
    QGC5:{
        type: String,
        required: [true,"Resposta necessaria!"]
    },
    QGC6:{
        type: String,
        required: [true,"Resposta necessaria!"]
    },
    QGC7:{
        type: String,
        required: [true,"Resposta necessaria!"]
    },
    QGC8:{
        type: String,
        required: [true,"Resposta necessaria!"]
    },
    QGC9:{
        type: String,
        required: [true,"Resposta necessaria!"]
    },
    QGC10:{
        type: String,
        required: [true,"Resposta necessaria!"]
    }
})

module.exports = mongoose.module('FGC', fgcschema)