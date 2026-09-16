const { validarFormularioG } = require('../../src/validators/fgValidator');

describe('Validação do formulário geral', () => {

    test('deve aceitar um formulário preenchido corretamente', () => {

        const formulario = {
            name: 'Lucas Rossi',
            email: 'lucas@email.com',
            QG1: 'Sim, conhecia bem',
            QG2: '5',
            QG3: 'O curso',
            QG4: 'Muito fáceis',
            QG5: 'Sim',
            QG6: 'Muito boa',
            QG7: 'Sim',
            QG8: 'Gostei bastante do site',
            QG9: 'Poderia ter mais informações',
            QG10: 'Mais informações sobre o mercado de trabalho'
        };

        expect(validarFormularioG(formulario)).toBe(true);
    });

    test('deve rejeitar formulário sem nome', () => {
    const formulario = {
        name: '',
        email: 'lucas@email.com',
        QG1: 'Sim, conhecia bem',
        QG2: '5',
        QG3: 'O curso',
        QG4: 'Muito fáceis',
        QG5: 'Sim',
        QG6: 'Muito boa',
        QG7: 'Sim',
        QG8: 'Gostei bastante do site',
        QG9: 'Poderia ter mais informações',
        QG10: 'Mais informações sobre o mercado de trabalho'
    };

    expect(validarFormularioG(formulario)).toBe(false);
});

test('deve rejeitar formulário sem email', () => {

        const formulario = {
            name: 'lucas',
            email: '',
            QG1: 'Sim, conhecia bem',
            QG2: '5',
            QG3: 'O curso',
            QG4: 'Muito fáceis',
            QG5: 'Sim',
            QG6: 'Muito boa',
            QG7: 'Sim',
            QG8: 'Gostei bastante do site',
            QG9: 'Poderia ter mais informações',
            QG10: 'Mais informações sobre o mercado de trabalho'
        };

        expect(validarFormularioG(formulario)).toBe(false);
    });

    test('deve rejeitar email em formato inválido', () => {
    const formulario = {
        name: 'Lucas Rossi',
        email: 'lucas@email',
        QG1: 'Sim, conhecia bem',
        QG2: '5',
        QG3: 'O curso',
        QG4: 'Muito fáceis',
        QG5: 'Sim',
        QG6: 'Muito boa',
        QG7: 'Sim',
        QG8: 'Gostei bastante do site',
        QG9: 'Poderia ter mais informações',
        QG10: 'Mais informações sobre o mercado de trabalho'
    };

    expect(validarFormularioG(formulario)).toBe(false);
});

test('deve rejeitar QGC1 vazia', () => {
    const formulario = {
        name: 'Lucas Rossi',
        email: 'lucas@email.com',
        QG1: '',
        QG2: '5',
        QG3: 'O curso',
        QG4: 'Muito fáceis',
        QG5: 'Sim',
        QG6: 'Muito boa',
        QG7: 'Sim',
        QG8: 'Gostei bastante do site',
        QG9: 'Poderia ter mais informações',
        QG10: 'Mais informações sobre o mercado de trabalho'
    };

    expect(validarFormularioG(formulario)).toBe(false);
});


test('deve rejeitar QGC2 com nota menor que 1', () => {
    const formulario = {
        name: 'Lucas Rossi',
        email: 'lucas@email.com',
        QG1: 'Sim, conhecia bem',
        QG2: '0',
        QG3: 'O curso',
        QG4: 'Muito fáceis',
        QG5: 'Sim',
        QG6: 'Muito boa',
        QG7: 'Sim',
        QG8: 'Gostei bastante do site',
        QG9: 'Poderia ter mais informações',
        QG10: 'Mais informações sobre o mercado de trabalho'
    };

    expect(validarFormularioG(formulario)).toBe(false);
});


test('deve rejeitar QGC2 com nota maior que 5', () => {
    const formulario = {
        name: 'Lucas Rossi',
        email: 'lucas@email.com',
        QG1: 'Sim, conhecia bem',
        QG2: '6',
        QG3: 'O curso',
        QG4: 'Muito fáceis',
        QG5: 'Sim',
        QG6: 'Muito boa',
        QG7: 'Sim',
        QG8: 'Gostei bastante do site',
        QG9: 'Poderia ter mais informações',
        QG10: 'Mais informações sobre o mercado de trabalho'
    };

    expect(validarFormularioG(formulario)).toBe(false);
});


test('deve rejeitar QGC2 vazia', () => {
    const formulario = {
        name: 'Lucas Rossi',
        email: 'lucas@email.com',
        QG1: 'Sim, conhecia bem',
        QG2: '',
        QG3: 'O curso',
        QG4: 'Muito fáceis',
        QG5: 'Sim',
        QG6: 'Muito boa',
        QG7: 'Sim',
        QG8: 'Gostei bastante do site',
        QG9: 'Poderia ter mais informações',
        QG10: 'Mais informações sobre o mercado de trabalho'
    };

    expect(validarFormularioG(formulario)).toBe(false);
});

test('deve rejeitar QGC3 vazia', () => {
    const formulario = {
        name: 'Lucas Rossi',
        email: 'lucas@email.com',
        QG1: 'Sim, conhecia bem',
        QG2: '5',
        QG3: '',
        QG4: 'Muito fáceis',
        QG5: 'Sim',
        QG6: 'Muito boa',
        QG7: 'Sim',
        QG8: 'Gostei bastante do site',
        QG9: 'Poderia ter mais informações',
        QG10: 'Mais informações sobre o mercado de trabalho'
    };

    expect(validarFormularioG(formulario)).toBe(false);
});


test('deve rejeitar QGC4 vazia', () => {
    const formulario = {
        name: 'Lucas Rossi',
        email: 'lucas@email.com',
        QG1: 'Sim, conhecia bem',
        QG2: '5',
        QG3: 'O curso',
        QG4: '',
        QG5: 'Sim',
        QG6: 'Muito boa',
        QG7: 'Sim',
        QG8: 'Gostei bastante do site',
        QG9: 'Poderia ter mais informações',
        QG10: 'Mais informações sobre o mercado de trabalho'
    };

    expect(validarFormularioG(formulario)).toBe(false);
});


test('deve rejeitar QGC5 vazia', () => {
    const formulario = {
        name: 'Lucas Rossi',
        email: 'lucas@email.com',
        QG1: 'Sim, conhecia bem',
        QG2: '5',
        QG3: 'O curso',
        QG4: 'Muito fáceis',
        QG5: '',
        QG6: 'Muito boa',
        QG7: 'Sim',
        QG8: 'Gostei bastante do site',
        QG9: 'Poderia ter mais informações',
        QG10: 'Mais informações sobre o mercado de trabalho'
    };

    expect(validarFormularioG(formulario)).toBe(false);
});


test('deve rejeitar QGC6 vazia', () => {
    const formulario = {
        name: 'Lucas Rossi',
        email: 'lucas@email.com',
        QG1: 'Sim, conhecia bem',
        QG2: '5',
        QG3: 'O curso',
        QG4: 'Muito fáceis',
        QG5: 'Sim',
        QG6: '',
        QG7: 'Sim',
        QG8: 'Gostei bastante do site',
        QG9: 'Poderia ter mais informações',
        QG10: 'Mais informações sobre o mercado de trabalho'
    };

    expect(validarFormularioG(formulario)).toBe(false);
});


test('deve rejeitar QGC7 vazia', () => {
    const formulario = {
        name: 'Lucas Rossi',
        email: 'lucas@email.com',
        QG1: 'Sim, conhecia bem',
        QG2: '5',
        QG3: 'O curso',
        QG4: 'Muito fáceis',
        QG5: 'Sim',
        QG6: 'Muito boa',
        QG7: '',
        QG8: 'Gostei bastante do site',
        QG9: 'Poderia ter mais informações',
        QG10: 'Mais informações sobre o mercado de trabalho'
    };

    expect(validarFormularioG(formulario)).toBe(false);
});


test('deve rejeitar QGC8 vazia', () => {
    const formulario = {
        name: 'Lucas Rossi',
        email: 'lucas@email.com',
        QG1: 'Sim, conhecia bem',
        QG2: '5',
        QG3: 'O curso',
        QG4: 'Muito fáceis',
        QG5: 'Sim',
        QG6: 'Muito boa',
        QG7: 'Sim',
        QG8: '',
        QG9: 'Poderia ter mais informações',
        QG10: 'Mais informações sobre o mercado de trabalho'
    };

    expect(validarFormularioG(formulario)).toBe(false);
});


test('deve rejeitar QGC9 vazia', () => {
    const formulario = {
        name: 'Lucas Rossi',
        email: 'lucas@email.com',
        QG1: 'Sim, conhecia bem',
        QG2: '5',
        QG3: 'O curso',
        QG4: 'Muito fáceis',
        QG5: 'Sim',
        QG6: 'Muito boa',
        QG7: 'Sim',
        QG8: 'Gostei bastante do site',
        QG9: '',
        QG10: 'Mais informações sobre o mercado de trabalho'
    };

    expect(validarFormularioG(formulario)).toBe(false);
});


test('deve rejeitar QGC10 vazia', () => {
    const formulario = {
        name: 'Lucas Rossi',
        email: 'lucas@email.com',
        QG1: 'Sim, conhecia bem',
        QG2: '5',
        QG3: 'O curso',
        QG4: 'Muito fáceis',
        QG5: 'Sim',
        QG6: 'Muito boa',
        QG7: 'Sim',
        QG8: 'Gostei bastante do site',
        QG9: 'Poderia ter mais informações',
        QG10: ''
    };

    expect(validarFormularioG(formulario)).toBe(false);
});

});