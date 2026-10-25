// Estado de execução do canal MQTT. É atualizado pelo subscriber e lido pelos
// endpoints /saude, /tempo-real/status e /metricas/resumo.
const estado = {
  mqtt: {
    habilitado: false,
    conectado: false,
    broker: null,
    topico: null,
    mensagensRecebidas: 0,
    mensagensSalvas: 0,
    ultimaMensagemEm: null,
    ultimoErro: null,
  },
};

function atualizarMqtt(parcial) {
  Object.assign(estado.mqtt, parcial);
}

function obterEstadoMqtt() {
  return { ...estado.mqtt };
}

module.exports = { atualizarMqtt, obterEstadoMqtt };
