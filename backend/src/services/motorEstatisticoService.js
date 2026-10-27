const estatisticasCache = new Map();

function calcularMediaMovel(valores) {
    const soma = valores.reduce((acc, val) => acc + val, 0);
    return soma / valores.length;
}

function calcularDesvio(valores, media) {
    const variancia = valores.reduce((acc, val) => acc + Math.pow(val - media, 2), 0) / valores.length;
    return Math.sqrt(variancia);
}

function processar(topic, valor) {
    if (!estatisticasCache.has(topic)) {
        estatisticasCache.set(topic, []);
    }

    const valores = estatisticasCache.get(topic);

    let mediaMovel;
    let desvio;

    if (valores.length > 0) {
        mediaMovel = calcularMediaMovel(valores);
        desvio = calcularDesvio(valores, mediaMovel);
    } else {
        mediaMovel = valor;
        desvio = 0;
    }

    const limiteTolerancia = desvio === 0 ? 5 : desvio * 1.5;
    const ehAnomalia = valores.length >= 3 ? Math.abs(valor - mediaMovel) > limiteTolerancia : false;

    valores.push(valor);
    if (valores.length > 10) {
        valores.shift();
    }

    return {
        mediaMovel: Number(mediaMovel.toFixed(2)),
        desvio: Number(desvio.toFixed(2)),
        ehAnomalia
    };
}

module.exports = { processar };