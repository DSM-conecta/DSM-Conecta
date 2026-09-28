const formInteresse = document.querySelector('#formulario-interesse');

if (formInteresse) {
    const statusFormulario = document.querySelector('#status-formulario');

    formInteresse.addEventListener('submit', async (event) => {
        event.preventDefault();
        statusFormulario.textContent = 'Enviando sua mensagem…';
        statusFormulario.classList.remove('erro');

        const dados = Object.fromEntries(new FormData(formInteresse).entries());

        try {
            const resposta = await fetch('/formularios', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dados),
            });
            const resultado = await resposta.json();

            if (!resposta.ok) throw new Error(resultado.mensagem || 'Não foi possível enviar a mensagem.');

            formInteresse.reset();
            statusFormulario.textContent = 'Mensagem enviada. Obrigado por entrar em contato!';
        } catch (erro) {
            statusFormulario.classList.add('erro');
            statusFormulario.textContent = erro.message === 'Failed to fetch'
                ? 'Não foi possível conectar ao servidor. Tente novamente mais tarde.'
                : erro.message;
        }
    });
}
