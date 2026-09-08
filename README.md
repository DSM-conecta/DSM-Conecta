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

Configure as variáveis de ambiente necessárias para a conexão com o MongoDB e o MQTT.

Depois, execute o projeto:

```bash
npm start
```

## Variáveis de ambiente

As configurações sensíveis do projeto devem ser armazenadas em um arquivo `.env`.

Exemplo:

```env
MONGODB_URI=sua_string_de_conexao
MQTT_BROKER=seu_broker
MQTT_PORT=sua_porta
```

O arquivo `.env` não deve ser enviado para o repositório quando contiver senhas, chaves ou outras informações privadas.

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

[https://github.com/DSM-conecta/DSM-Conecta](https://github.com/DSM-conecta/DSM-Conecta)

```
```
