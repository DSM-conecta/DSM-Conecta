// Configuração única do broker MQTT, compartilhada por publisher e subscriber.
// Os valores vêm do .env (veja .env.example).
const MQTT_BROKER = process.env.MQTT_BROKER || 'localhost';
const MQTT_PORT = process.env.MQTT_PORT || 1883;

module.exports = {
  BROKER_URL: `mqtt://${MQTT_BROKER}:${MQTT_PORT}`,
  // Árvore de tópicos assinada pelo backend. Ex.: dsm/prod/app/interacao/tela
  TOPICO_TELEMETRIA: process.env.MQTT_TOPICO || 'dsm/#',
  opcoesConexao() {
    return {
      username: process.env.MQTT_USER || 'dsm-mosquitto',
      password: process.env.MQTT_PASSWORD || '12345',
      reconnectPeriod: 2000,
    };
  },
};
