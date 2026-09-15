const emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validarFormulario(dados) {
    if (!dados.name || dados.name.trim() === '') {
        return false;
    }

    if (!dados.email || dados.email.trim() === '') {
        return false;
    }

    if (!emailValido.test(dados.email)) {
        return false;
    }

     // QGC1
    if (!dados.QGC1 || dados.QGC1.trim() === '') {
        return false;
    }

    // QGC2 - nota de 1 a 5
    const nota = Number(dados.QGC2);

    if (!dados.QGC2 || !Number.isInteger(nota) || nota < 1 || nota > 5) {
        return false;
    }

    // QGC3 até QGC7
    if (!dados.QGC3 || dados.QGC3.trim() === '') {
        return false;
    }

    if (!dados.QGC4 || dados.QGC4.trim() === '') {
        return false;
    }

    if (!dados.QGC5 || dados.QGC5.trim() === '') {
        return false;
    }

    if (!dados.QGC6 || dados.QGC6.trim() === '') {
        return false;
    }

    if (!dados.QGC7 || dados.QGC7.trim() === '') {
        return false;
    }

    // QGC8 até QGC10
    if (!dados.QGC8 || dados.QGC8.trim() === '') {
        return false;
    }

    if (!dados.QGC9 || dados.QGC9.trim() === '') {
        return false;
    }

    if (!dados.QGC10 || dados.QGC10.trim() === '') {
        return false;
    }

    return true;
}

module.exports = { validarFormulario };