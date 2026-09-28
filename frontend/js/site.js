const nomePagina = window.location.pathname.includes('/pages/')
    ? window.location.pathname.split('/').pop().replace('.html', '')
    : 'inicio';

fetch('/telemetria', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        plataforma: 'Web',
        setor: nomePagina,
        data: new Date().toISOString(),
        hora: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    }),
}).catch(() => {});

if (nomePagina === 'grade') {
    fetch('/painel/grade-atual')
        .then((resposta) => (resposta.ok ? resposta.json() : null))
        .then((grade) => {
            if (!grade?.texto) return;
            const listaMaterias = document.querySelector('.materias');
            const titulo = listaMaterias?.querySelector('h3');
            if (!listaMaterias || !titulo) return;
            listaMaterias.querySelectorAll('p').forEach((item) => item.remove());
            grade.texto.split('\n').filter(Boolean).forEach((materia) => {
                const item = document.createElement('p');
                item.textContent = materia;
                listaMaterias.append(item);
            });
        })
        .catch(() => {});
}
