const loginView = document.querySelector('#tela-login');
const painelView = document.querySelector('#painel');
const loginForm = document.querySelector('#form-login');
const loginError = document.querySelector('#erro-login');
const adminTokenKey = 'dsm-admin-token';
const adminUserKey = 'dsm-admin-user';
const defaultGrade = [
    'Algoritmo e Lógica de Programação',
    'Modelagem de Banco de Dados',
    'Sistemas Operacionais e Redes de Computadores',
    'Design Digital',
    'Engenharia de Software I',
    'Desenvolvimento Web I',
    'Matemática para Computação',
].join('\n');

function getUser() {
    try { return JSON.parse(sessionStorage.getItem(adminUserKey) || '{}'); }
    catch { return {}; }
}

function showPanel(user = getUser()) {
    loginView.hidden = true;
    painelView.hidden = false;
    document.querySelector('#boas-vindas').textContent = user.nome ? `Olá, ${user.nome}. Aqui está o resumo do site.` : 'Gerencie o conteúdo e acompanhe a atividade do site.';
    refreshDashboard();
}

function showLogin() {
    sessionStorage.removeItem(adminTokenKey);
    sessionStorage.removeItem(adminUserKey);
    painelView.hidden = true;
    loginView.hidden = false;
}

async function api(url, options = {}) {
    const headers = new Headers(options.headers || {});
    const token = sessionStorage.getItem(adminTokenKey);
    if (token) headers.set('Authorization', `Bearer ${token}`);
    if (options.body && !headers.has('Content-Type')) headers.set('Content-Type', 'application/json');

    const response = await fetch(url, { ...options, headers });
    if (response.status === 401) {
        showLogin();
        throw new Error('Sua sessão expirou. Entre novamente.');
    }
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.mensagem || 'Não foi possível carregar os dados.');
    return data;
}

loginForm?.addEventListener('submit', async (event) => {
    event.preventDefault();
    const button = loginForm.querySelector('button[type="submit"]');
    button.disabled = true;
    loginError.textContent = 'Verificando acesso…';
    try {
        const dados = Object.fromEntries(new FormData(loginForm).entries());
        const response = await fetch('/administradores/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dados),
        });
        const result = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(result.mensagem || 'E-mail ou senha inválidos.');
        sessionStorage.setItem(adminTokenKey, result.token);
        sessionStorage.setItem(adminUserKey, JSON.stringify({ _id: result._id, nome: result.nome, email: result.email }));
        loginError.textContent = '';
        loginForm.reset();
        showPanel(result);
    } catch (error) {
        loginError.textContent = error.message === 'Failed to fetch'
            ? 'Não foi possível conectar ao servidor. Abra o site pelo servidor da aplicação.'
            : error.message;
    } finally {
        button.disabled = false;
    }
});

document.querySelector('#botao-sair')?.addEventListener('click', showLogin);

document.querySelectorAll('.aba-painel').forEach((button) => {
    button.addEventListener('click', () => {
        document.querySelectorAll('.aba-painel').forEach((aba) => aba.classList.toggle('ativa', aba === button));
        document.querySelectorAll('.conteudo-aba').forEach((conteudo) => {
            conteudo.hidden = conteudo.id !== `aba-${button.dataset.aba}`;
        });
    });
});

document.querySelectorAll('[data-atualizar]').forEach((button) => button.addEventListener('click', refreshDashboard));
document.querySelector('#salvar-grade')?.addEventListener('click', saveGrade);

async function refreshDashboard() {
    const errorBox = document.querySelector('#erro-painel');
    errorBox.textContent = '';
    const results = await Promise.allSettled([loadStats(), loadGrade(), loadForms()]);
    const failed = results.find((result) => result.status === 'rejected');
    if (failed) errorBox.textContent = `${failed.reason.message} Confira se o servidor e o banco de dados estão disponíveis.`;
}

async function loadStats() {
    const registros = await api('/telemetria');
    const acessos = Array.isArray(registros) ? registros : [];
    const porPagina = acessos.reduce((resultado, acesso) => {
        const pagina = acesso.setor || 'outras';
        resultado[pagina] = (resultado[pagina] || 0) + 1;
        return resultado;
    }, {});
    document.querySelector('#total-acessos').textContent = acessos.length.toLocaleString('pt-BR');
    document.querySelector('#paginas-visitadas').textContent = Object.keys(porPagina).length.toLocaleString('pt-BR');
    document.querySelector('#status-acessos').textContent = 'Atualizado agora';
    const container = document.querySelector('#grafico-acessos');
    container.replaceChildren();
    const paginasOrdenadas = Object.entries(porPagina).sort((a, b) => b[1] - a[1]);
    if (!paginasOrdenadas.length) {
        container.innerHTML = '<p class="estado-vazio">Ainda não há visitas registradas.</p>';
        return;
    }
    const maximo = paginasOrdenadas[0][1];
    paginasOrdenadas.forEach(([pagina, quantidade]) => {
        const linha = document.createElement('div');
        linha.className = 'linha-grafico';
        const rotulo = document.createElement('span');
        rotulo.className = 'rotulo-grafico';
        rotulo.textContent = pagina === 'inicio' ? 'Tela inicial' : pagina.replaceAll('-', ' ');
        const trilho = document.createElement('div');
        trilho.className = 'trilho-grafico';
        const barra = document.createElement('div');
        barra.className = 'barra-grafico';
        barra.style.width = `${Math.max(4, Math.round(quantidade / maximo * 100))}%`;
        trilho.append(barra);
        const valor = document.createElement('span');
        valor.className = 'valor-grafico';
        valor.textContent = quantidade;
        linha.append(rotulo, trilho, valor);
        container.append(linha);
    });
}

async function loadGrade() {
    const registros = await api('/painel?setor=grade-curricular');
    const historico = Array.isArray(registros) ? registros : [];
    document.querySelector('#conteudo-grade').value = historico[0]?.texto || defaultGrade;
    const container = document.querySelector('#historico-grade');
    container.replaceChildren();
    if (!historico.length) {
        container.innerHTML = '<p class="estado-vazio">Nenhuma alteração publicada ainda.</p>';
        return;
    }
    historico.slice(0, 5).forEach((registro) => {
        const item = document.createElement('div');
        item.className = 'item-historico';
        const resumo = document.createElement('strong');
        resumo.textContent = `${registro.texto.split('\n').filter(Boolean).length} disciplinas na grade`;
        const data = document.createElement('time');
        data.dateTime = registro.createdAt || '';
        data.textContent = registro.createdAt ? new Date(registro.createdAt).toLocaleString('pt-BR') : 'Data indisponível';
        item.append(resumo, data);
        container.append(item);
    });
}

async function saveGrade() {
    const user = getUser();
    const button = document.querySelector('#salvar-grade');
    const status = document.querySelector('#status-grade');
    const texto = document.querySelector('#conteudo-grade').value.split('\n').map((linha) => linha.trim()).filter(Boolean).join('\n');
    status.textContent = '';
    if (!texto) {
        status.textContent = 'Adicione pelo menos uma disciplina antes de salvar.';
        return;
    }
    button.disabled = true;
    try {
        await api('/painel', {
            method: 'POST',
            body: JSON.stringify({ setor: 'grade-curricular', texto, imagemUrl: '/assets/imgs/Fatec_zona_sul.jpg', administrador: user._id }),
        });
        status.style.color = '#c8f2d2';
        status.textContent = 'Grade publicada com sucesso.';
        await loadGrade();
    } catch (error) {
        status.style.color = '#ffb8b8';
        status.textContent = error.message;
    } finally {
        button.disabled = false;
    }
}

async function loadForms() {
    const registros = await api('/formularios');
    const respostas = Array.isArray(registros) ? registros : [];
    document.querySelector('#total-mensagens').textContent = respostas.length.toLocaleString('pt-BR');
    document.querySelector('#resumo-formularios').textContent = `${respostas.length.toLocaleString('pt-BR')} mensagem(ns) recebida(s)`;
    const container = document.querySelector('#lista-formularios');
    container.replaceChildren();
    if (!respostas.length) {
        container.innerHTML = '<p class="estado-vazio">Nenhuma mensagem recebida até agora.</p>';
        return;
    }
    respostas.forEach((resposta) => {
        const item = document.createElement('article');
        item.className = 'item-formulario';
        const topo = document.createElement('div');
        topo.className = 'item-formulario-topo';
        const identificacao = document.createElement('div');
        const nome = document.createElement('h4');
        nome.textContent = resposta.nome;
        const meta = document.createElement('div');
        meta.className = 'form-meta';
        const email = document.createElement('a');
        email.href = `mailto:${resposta.email}`;
        email.textContent = resposta.email;
        const assunto = document.createElement('span');
        assunto.className = 'indicador-atualizacao';
        assunto.textContent = resposta.assunto;
        meta.append(email, assunto);
        identificacao.append(nome, meta);
        const data = document.createElement('time');
        data.dateTime = resposta.createdAt || '';
        data.textContent = resposta.createdAt ? new Date(resposta.createdAt).toLocaleString('pt-BR') : '';
        topo.append(identificacao, data);
        const mensagem = document.createElement('p');
        mensagem.textContent = resposta.mensagem;
        item.append(topo, mensagem);
        container.append(item);
    });
}

if (sessionStorage.getItem(adminTokenKey)) showPanel();
