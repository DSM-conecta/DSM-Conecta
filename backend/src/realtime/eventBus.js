const { EventEmitter } = require('events');

// Barramento interno de eventos. Quem salva um dado (HTTP ou MQTT) emite aqui;
// o hub SSE escuta e repassa para os painéis administrativos conectados.
//
// Eventos usados: 'telemetria', 'formulario', 'painel'.
const eventBus = new EventEmitter();
eventBus.setMaxListeners(0);

module.exports = eventBus;
