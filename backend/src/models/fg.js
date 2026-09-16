const mongoose = require('mongoose');

const fgschema = new mongoose.Schema({
    name:{
        type: String,
        required: [true, "Qual o seu nome?"]
    },
    email:{
        type: String,
        required: [true, "Qual o seu email?"]
    },
    QG1:{
        type: String,
        required: [true,"Resposta necessaria!"]
    },
    QG2:{
        type: String,
        required: [true,"Resposta necessaria!"]
    },
    QG3:{
        type: String,
        required: [true,"Resposta necessaria!"]
    },
    QG4:{
        type: String,
        required: [true,"Resposta necessaria!"]
    },
    QG5:{
        type: String,
        required: [true,"Resposta necessaria!"]
    },
    QG6:{
        type: String,
        required: [true,"Resposta necessaria!"]
    },
    QG7:{
        type: String,
        required: [true,"Resposta necessaria!"]
    },
    QG8:{
        type: String,
        required: [true,"Resposta necessaria!"]
    },
    QG9:{
        type: String,
        required: [true,"Resposta necessaria!"]
    },
    QG10:{
        type: String,
        required: [true,"Resposta necessaria!"]
    }
})

module.exports = mongoose.model('FG', fgschema)