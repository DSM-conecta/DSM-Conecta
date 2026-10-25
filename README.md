# DSM Conecta

Projeto desenvolvido por estudantes do curso de **Desenvolvimento de Software Multiplataforma (DSM)** da FATEC.

O **DSM Conecta** tem como proposta desenvolver uma aplicação integrada, utilizando tecnologias de desenvolvimento web, banco de dados e comunicação por mensagens.

## Tecnologias utilizadas

### Backend
- Node.js
- JavaScript
- MongoDB
- MQTT

### Frontend
- HTML
- CSS
- JavaScript

### Ferramentas
- Git
- GitHub
- Visual Studio Code

## Estrutura do projeto

```text
DSM-Conecta/
│
├── backend/
│   ├── src/
│   │   └── config/
│   ├── package.json
│   └── package-lock.json
│
├── frontend/
│
└── README.md
````

## Backend

O backend é responsável pela lógica da aplicação, pelo gerenciamento das informações e pela comunicação com os serviços utilizados no projeto.

O desenvolvimento é realizado utilizando **Node.js**, permitindo a criação e execução dos serviços necessários para o funcionamento da aplicação.

## Banco de dados

O projeto utiliza o **MongoDB** para armazenamento dos dados da aplicação.

A conexão com o banco de dados deve ser configurada por meio das variáveis de ambiente do projeto.

## Comunicação MQTT

O **MQTT** é utilizado para realizar a comunicação por mensagens entre os componentes do sistema.

A utilização desse protocolo permite o envio e recebimento de informações de forma eficiente e assíncrona.

## Como executar o projeto

### Pré-requisitos

Para executar o projeto, é necessário ter instalado:

* Node.js
* npm
* Git
* MongoDB
* Um broker MQTT

### Clonar o repositório

```bash
git clone https://github.com/DSM-conecta/DSM-Conecta.git
```

Depois, entre na pasta do projeto:

```bash
cd DSM-Conecta
```

### Executar o Backend

Entre na pasta do backend:

```bash
cd backend
```

Instale as dependências:

```bash
npm install
```

Copie `.env.example` para `.env` e preencha as variáveis (veja abaixo).

Depois, execute o projeto (`npm run dev` reinicia sozinho ao salvar arquivos):

```bash
npm start
```

O front-end é servido pelo backend. Com o servidor ativo, a página inicial fica em `http://localhost:5000/`, o acesso administrativo em `http://localhost:5000/admin` e a documentação da API em `http://localhost:5000/api/docs`.

Para criar a primeira conta administrativa, configure `MONGODB_URI` e execute `npm run admin:create`. O comando solicita nome, e-mail e senha no terminal. Configure também `ADMIN_TOKEN_SECRET` com um valor privado e estável para manter as sessões válidas entre reinicializações.

## Variáveis de ambiente

As configurações sensíveis do projeto ficam em `backend/.env` (copie `backend/.env.example`).

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/dsmconecta
ADMIN_TOKEN_SECRET=troque-por-um-valor-longo-e-aleatorio
MQTT_BROKER=localhost
MQTT_PORT=1883
MQTT_USER=dsm-mosquitto
MQTT_PASSWORD=senha-do-mosquitto
MQTT_TOPICO=dsm/#
MQTT_HABILITADO=true
```

O arquivo `.env` não deve ser enviado para o repositório quando contiver senhas, chaves ou outras informações privadas.

## Subindo banco e broker com Docker

```bash
# 1) cria o arquivo de senhas do Mosquitto (uma vez; ele não vai para o Git)
docker run --rm -v "$PWD":/work eclipse-mosquitto:2.0 \
  mosquitto_passwd -c -b /work/mosquitto_passwords.txt dsm-mosquitto SUA_SENHA

# 2) sobe MongoDB + Mosquitto
docker compose up -d
```

Use o mesmo usuário e senha em `MQTT_USER` e `MQTT_PASSWORD`.

## API REST (documentada e autenticada)

- **Documentação interativa (Swagger UI):** `http://localhost:5000/api/docs`
- **Especificação OpenAPI (JSON):** `http://localhost:5000/api/openapi.json` (código em `backend/src/docs/openapi.js`)
- **Prefixo:** `/api/...`. Os endereços sem `/api` continuam funcionando por compatibilidade.

**Autenticação:** `POST /api/administradores/login` devolve um token; envie-o em `Authorization: Bearer <token>` (vale 8 h). No Swagger UI use o botão **Authorize**. Rotas com cadeado na documentação exigem o token.

| Grupo | Endpoints principais | Acesso |
|---|---|---|
| Conteúdo | `GET /painel/grade-atual`, `GET/POST/PUT/DELETE /painel`, `POST/GET /formularios` | leitura da grade e envio de mensagem são públicos; o resto exige token |
| Métricas | `GET /metricas/resumo`, `GET /metricas/acessos?dias=&setor=&plataforma=` | token |
| Tempo real | `GET /tempo-real/eventos` (SSE), `GET /tempo-real/status` | token |
| Telemetria | `POST /telemetria` (público), `GET/PUT/DELETE /telemetria` | leitura/alteração exige token |
| Pesquisas | `POST /fg`, `POST /fgc` (públicos); leitura/alteração exige token | misto |
| Administradores | `/administradores` | token (login é público) |
| Sistema | `GET /saude` | público |

Ao criar uma rota nova, documente-a em `openapi.js`: o teste `tests/api/docs.test.js` confere se tudo que está documentado existe e se as rotas marcadas como protegidas realmente recusam quem não tem token.

Resumo completo das mudanças, mapa front-end ↔ back-end e pendências: [`docs/API-E-TEMPO-REAL.md`](docs/API-E-TEMPO-REAL.md).

## Canal em tempo real

```text
site/app ──MQTT──► Mosquitto ──► backend (subscriber dsm/#) ──► MongoDB
site ──HTTP POST /api/telemetria──────────────┘                    │
                                                                   ▼
                              painel administrativo ◄── SSE ◄── barramento de eventos
```

- **MQTT:** o backend assina `dsm/#` assim que sobe (`MQTT_HABILITADO=false` desliga). Para testar, com o servidor rodando: `node src/mqtt/telemetriaPublisher.js` (dentro de `backend/`).
- **SSE:** `GET /api/tempo-real/eventos` envia os eventos `status`, `telemetria`, `formulario` e `painel` assim que acontecem. O painel administrativo usa esse fluxo: contadores, gráfico e lista de mensagens atualizam sozinhos, e o selo "Tempo real ativo" mostra se o MQTT está conectado.
- **Verificar se está em operação:** `GET /api/saude` (público) mostra `mqtt.conectado`; `GET /api/tempo-real/status` (token) mostra também quantos painéis estão ligados.

## Desenvolvimento

O projeto está sendo desenvolvido de forma incremental, com as funcionalidades sendo implementadas ao longo das iterações definidas para o projeto.

A separação entre `frontend` e `backend` facilita a organização do código e o desenvolvimento das diferentes partes da aplicação.

## Equipe

* Daniela Pereira Bosco
* Emanuelly Araújo de Jesus
* Lucas Rossi de Oliveira
* Vitória Alejandra Bandeira dos Santos
* Welber Eugenio dos Santos Junior

## Status do projeto

🚧 **Em desenvolvimento**

O projeto está em processo de desenvolvimento e novas funcionalidades serão adicionadas ao longo das próximas etapas.

## Repositório

```
https://github.com/DSM-conecta/DSM-Conecta
```
