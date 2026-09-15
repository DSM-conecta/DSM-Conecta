const { validarFormulario } = require('../../src/validators/fgValidator');

describe('Validação do formulário geral', () => {

    test('deve aceitar um formulário preenchido corretamente', () => {

        const formulario = {
            name: 'Lucas Rossi',
            email: 'lucas@email.com',
            QGC1: 'Sim, conhecia bem',
            QGC2: '5',
            QGC3: 'O curso',
            QGC4: 'Muito fáceis',
            QGC5: 'Sim',
            QGC6: 'Muito boa',
            QGC7: 'Sim',
            QGC8: 'Gostei bastante do site',
            QGC9: 'Poderia ter mais informações',
            QGC10: 'Mais informações sobre o mercado de trabalho'
        };

        expect(validarFormulario(formulario)).toBe(true);
    });

    test('deve rejeitar formulário sem nome', () => {
    const formulario = {
        name: '',
        email: 'lucas@email.com',
        QGC1: 'Sim, conhecia bem',
        QGC2: '5',
        QGC3: 'O curso',
        QGC4: 'Muito fáceis',
        QGC5: 'Sim',
        QGC6: 'Muito boa',
        QGC7: 'Sim',
        QGC8: 'Gostei bastante do site',
        QGC9: 'Poderia ter mais informações',
        QGC10: 'Mais informações sobre o mercado de trabalho'
    };

    expect(validarFormulario(formulario)).toBe(false);
});

test('deve rejeitar formulário sem email', () => {

        const formulario = {
            name: 'lucas',
            email: '',
            QGC1: 'Sim, conhecia bem',
            QGC2: '5',
            QGC3: 'O curso',
            QGC4: 'Muito fáceis',
            QGC5: 'Sim',
            QGC6: 'Muito boa',
            QGC7: 'Sim',
            QGC8: 'Gostei bastante do site',
            QGC9: 'Poderia ter mais informações',
            QGC10: 'Mais informações sobre o mercado de trabalho'
        };

        expect(validarFormulario(formulario)).toBe(false);
    });

    test('deve rejeitar email em formato inválido', () => {
    const formulario = {
        name: 'Lucas Rossi',
        email: 'lucas@email',
        QGC1: 'Sim, conhecia bem',
        QGC2: '5',
        QGC3: 'O curso',
        QGC4: 'Muito fáceis',
        QGC5: 'Sim',
        QGC6: 'Muito boa',
        QGC7: 'Sim',
        QGC8: 'Gostei bastante do site',
        QGC9: 'Poderia ter mais informações',
        QGC10: 'Mais informações sobre o mercado de trabalho'
    };

    expect(validarFormulario(formulario)).toBe(false);
});

test('deve rejeitar QGC1 vazia', () => {
    const formulario = {
        name: 'Lucas Rossi',
        email: 'lucas@email.com',
        QGC1: '',
        QGC2: '5',
        QGC3: 'O curso',
        QGC4: 'Muito fáceis',
        QGC5: 'Sim',
        QGC6: 'Muito boa',
        QGC7: 'Sim',
        QGC8: 'Gostei bastante do site',
        QGC9: 'Poderia ter mais informações',
        QGC10: 'Mais informações sobre o mercado de trabalho'
    };

    expect(validarFormulario(formulario)).toBe(false);
});


test('deve rejeitar QGC2 com nota menor que 1', () => {
    const formulario = {
        name: 'Lucas Rossi',
        email: 'lucas@email.com',
        QGC1: 'Sim, conhecia bem',
        QGC2: '0',
        QGC3: 'O curso',
        QGC4: 'Muito fáceis',
        QGC5: 'Sim',
        QGC6: 'Muito boa',
        QGC7: 'Sim',
        QGC8: 'Gostei bastante do site',
        QGC9: 'Poderia ter mais informações',
        QGC10: 'Mais informações sobre o mercado de trabalho'
    };

    expect(validarFormulario(formulario)).toBe(false);
});


test('deve rejeitar QGC2 com nota maior que 5', () => {
    const formulario = {
        name: 'Lucas Rossi',
        email: 'lucas@email.com',
        QGC1: 'Sim, conhecia bem',
        QGC2: '6',
        QGC3: 'O curso',
        QGC4: 'Muito fáceis',
        QGC5: 'Sim',
        QGC6: 'Muito boa',
        QGC7: 'Sim',
        QGC8: 'Gostei bastante do site',
        QGC9: 'Poderia ter mais informações',
        QGC10: 'Mais informações sobre o mercado de trabalho'
    };

    expect(validarFormulario(formulario)).toBe(false);
});


test('deve rejeitar QGC2 vazia', () => {
    const formulario = {
        name: 'Lucas Rossi',
        email: 'lucas@email.com',
        QGC1: 'Sim, conhecia bem',
        QGC2: '',
        QGC3: 'O curso',
        QGC4: 'Muito fáceis',
        QGC5: 'Sim',
        QGC6: 'Muito boa',
        QGC7: 'Sim',
        QGC8: 'Gostei bastante do site',
        QGC9: 'Poderia ter mais informações',
        QGC10: 'Mais informações sobre o mercado de trabalho'
    };

    expect(validarFormulario(formulario)).toBe(false);
});

test('deve rejeitar QGC3 vazia', () => {
    const formulario = {
        name: 'Lucas Rossi',
        email: 'lucas@email.com',
        QGC1: 'Sim, conhecia bem',
        QGC2: '5',
        QGC3: '',
        QGC4: 'Muito fáceis',
        QGC5: 'Sim',
        QGC6: 'Muito boa',
        QGC7: 'Sim',
        QGC8: 'Gostei bastante do site',
        QGC9: 'Poderia ter mais informações',
        QGC10: 'Mais informações sobre o mercado de trabalho'
    };

    expect(validarFormulario(formulario)).toBe(false);
});


test('deve rejeitar QGC4 vazia', () => {
    const formulario = {
        name: 'Lucas Rossi',
        email: 'lucas@email.com',
        QGC1: 'Sim, conhecia bem',
        QGC2: '5',
        QGC3: 'O curso',
        QGC4: '',
        QGC5: 'Sim',
        QGC6: 'Muito boa',
        QGC7: 'Sim',
        QGC8: 'Gostei bastante do site',
        QGC9: 'Poderia ter mais informações',
        QGC10: 'Mais informações sobre o mercado de trabalho'
    };

    expect(validarFormulario(formulario)).toBe(false);
});


test('deve rejeitar QGC5 vazia', () => {
    const formulario = {
        name: 'Lucas Rossi',
        email: 'lucas@email.com',
        QGC1: 'Sim, conhecia bem',
        QGC2: '5',
        QGC3: 'O curso',
        QGC4: 'Muito fáceis',
        QGC5: '',
        QGC6: 'Muito boa',
        QGC7: 'Sim',
        QGC8: 'Gostei bastante do site',
        QGC9: 'Poderia ter mais informações',
        QGC10: 'Mais informações sobre o mercado de trabalho'
    };

    expect(validarFormulario(formulario)).toBe(false);
});


test('deve rejeitar QGC6 vazia', () => {
    const formulario = {
        name: 'Lucas Rossi',
        email: 'lucas@email.com',
        QGC1: 'Sim, conhecia bem',
        QGC2: '5',
        QGC3: 'O curso',
        QGC4: 'Muito fáceis',
        QGC5: 'Sim',
        QGC6: '',
        QGC7: 'Sim',
        QGC8: 'Gostei bastante do site',
        QGC9: 'Poderia ter mais informações',
        QGC10: 'Mais informações sobre o mercado de trabalho'
    };

    expect(validarFormulario(formulario)).toBe(false);
});


test('deve rejeitar QGC7 vazia', () => {
    const formulario = {
        name: 'Lucas Rossi',
        email: 'lucas@email.com',
        QGC1: 'Sim, conhecia bem',
        QGC2: '5',
        QGC3: 'O curso',
        QGC4: 'Muito fáceis',
        QGC5: 'Sim',
        QGC6: 'Muito boa',
        QGC7: '',
        QGC8: 'Gostei bastante do site',
        QGC9: 'Poderia ter mais informações',
        QGC10: 'Mais informações sobre o mercado de trabalho'
    };

    expect(validarFormulario(formulario)).toBe(false);
});


test('deve rejeitar QGC8 vazia', () => {
    const formulario = {
        name: 'Lucas Rossi',
        email: 'lucas@email.com',
        QGC1: 'Sim, conhecia bem',
        QGC2: '5',
        QGC3: 'O curso',
        QGC4: 'Muito fáceis',
        QGC5: 'Sim',
        QGC6: 'Muito boa',
        QGC7: 'Sim',
        QGC8: '',
        QGC9: 'Poderia ter mais informações',
        QGC10: 'Mais informações sobre o mercado de trabalho'
    };

    expect(validarFormulario(formulario)).toBe(false);
});


test('deve rejeitar QGC9 vazia', () => {
    const formulario = {
        name: 'Lucas Rossi',
        email: 'lucas@email.com',
        QGC1: 'Sim, conhecia bem',
        QGC2: '5',
        QGC3: 'O curso',
        QGC4: 'Muito fáceis',
        QGC5: 'Sim',
        QGC6: 'Muito boa',
        QGC7: 'Sim',
        QGC8: 'Gostei bastante do site',
        QGC9: '',
        QGC10: 'Mais informações sobre o mercado de trabalho'
    };

    expect(validarFormulario(formulario)).toBe(false);
});


test('deve rejeitar QGC10 vazia', () => {
    const formulario = {
        name: 'Lucas Rossi',
        email: 'lucas@email.com',
        QGC1: 'Sim, conhecia bem',
        QGC2: '5',
        QGC3: 'O curso',
        QGC4: 'Muito fáceis',
        QGC5: 'Sim',
        QGC6: 'Muito boa',
        QGC7: 'Sim',
        QGC8: 'Gostei bastante do site',
        QGC9: 'Poderia ter mais informações',
        QGC10: ''
    };

    expect(validarFormulario(formulario)).toBe(false);
});

});