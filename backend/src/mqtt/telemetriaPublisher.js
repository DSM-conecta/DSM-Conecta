const mqtt = require('mqtt');
const { BROKER_URL, opcoesConexao } = require('../config/mqtt');

let client = null;

function obterCliente() {
    if (!client) {
        client = mqtt.connect(BROKER_URL, opcoesConexao());

        if (client && typeof client.on === 'function') {
            client.on('connect', () => {
                console.log('[MQTT Publisher] Conectado ao broker!');
            });

            client.on('error', (err) => {
                console.error('[MQTT Publisher] Erro de conexão:', err.message);
            });
        }
    }
    return client;
}

/**
 * Publica uma mensagem de telemetria no broker MQTT.
 *
 * @param {string} topic Ex: 'dsm/prod/app/interacao/tela'
 * @param {Object} dados Objeto com as informações do evento
 */
function enviarMensagemBroker(topic, dados) {
    return new Promise((resolve, reject) => {
        const pubClient = obterCliente();

        const mensagem = JSON.stringify({
            plataforma: dados.plataforma || 'Web',
            setor: dados.setor || 'Geral',
            data: dados.data || new Date().toISOString(),
            hora: dados.hora || new Date().toLocaleTimeString('pt-BR'),
            ...dados
        });

        pubClient.publish(topic, mensagem, { qos: 1 }, (err) => {
            if (err) {
                console.error(`[MQTT] Falha ao publicar no tópico ${topic}:`, err);
                return reject(err);
            }
            console.log(`[MQTT] Payload publicado com sucesso -> Tópico: "${topic}"`);
            resolve();
        });
    });
}

if (require.main === module) {
    setTimeout(async () => {
        try {
            await enviarMensagemBroker('dsm/prod/app/interacao/tela', {
                evento: 'teste_via_script_node'
            });
            setTimeout(() => {
                if (client) client.end();
            }, 1000);
        } catch (err) {
            console.error(err);
            if (client) client.end();
        }
    }, 500);
}

module.exports = { enviarMensagemBroker };