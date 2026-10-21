# SuporteHub | IT Service Management

**Sistema de gerenciamento de chamados e suporte técnico, desenvolvido com C#, ASP.NET Core e infraestrutura AWS.**

O **SuporteHub** é uma solução web voltada à centralização, organização e acompanhamento de solicitações de suporte de Tecnologia da Informação. O projeto foi idealizado para facilitar a comunicação entre usuários e equipes de TI, melhorar a rastreabilidade dos atendimentos e contribuir para uma gestão de chamados mais eficiente.

O desenvolvimento combina conceitos de **IT Service Management (ITSM)**, desenvolvimento Full Stack, APIs RESTful e computação em nuvem, com foco em escalabilidade, organização e evolução contínua.

## Tecnologias utilizadas

### Backend

- **C# / .NET 10** — Desenvolvimento da aplicação.
- **ASP.NET Core Web API** — Construção de endpoints REST.
- **AWS SDK for .NET** — Integração planejada com serviços AWS.
- **JSON** — Estrutura de comunicação entre frontend e backend.

### Frontend

- **HTML5** — Estrutura das páginas.
- **CSS3** — Estilização e interface.
- **JavaScript** — Interatividade e comunicação com a API.

### Cloud & DevOps

- **Amazon DynamoDB** — Banco de dados NoSQL provisionado na AWS.
- **AWS CloudFormation** — Infraestrutura como código (IaC).
- **AWS IAM** — Gerenciamento de identidades e permissões.
- **AWS CLI** — Administração e implantação de recursos.
- **Git & GitHub** — Versionamento e gerenciamento do código-fonte.

## Funcionalidades

O SuporteHub está sendo desenvolvido de forma modular, permitindo a implementação progressiva de novas funcionalidades.

**Implementadas na estrutura inicial:**

- API REST para gerenciamento de chamados.
- Criação de chamados por requisições HTTP.
- Consulta de chamados cadastrados.
- Consulta individual de chamados por identificador.
- Estrutura de frontend para interação com o sistema.
- Provisionamento de infraestrutura DynamoDB na AWS.

**Em desenvolvimento ou planejadas:**

- Persistência dos chamados no Amazon DynamoDB.
- Autenticação e gerenciamento de usuários.
- Dashboard de acompanhamento dos atendimentos.
- Atualização de status e gerenciamento do ciclo de vida dos chamados.
- Filtros e organização de solicitações.
- Controle de permissões por perfil de usuário.
- Indicadores operacionais para a equipe de TI.
- Automação de processos de suporte.

## Arquitetura do projeto

O sistema adota uma arquitetura organizada em camadas, separando interface, regras de aplicação, acesso aos dados e infraestrutura.

```text
SuporteHub/
│
├── backend/
│   └── SuporteHub.API/
│       ├── Controllers/
│       ├── DTOs/
│       ├── Models/
│       ├── Repositories/
│       ├── Services/
│       ├── Properties/
│       ├── infra/
│       │   └── dynamodb.yml
│       ├── Program.cs
│       └── SuporteHub.API.csproj
│
├── frontend/
│   ├── assets/
│   ├── css/
│   │   └── style.css
│   ├── js/
│   │   ├── app.js
│   │   ├── auth.js
│   │   ├── chamados.js
│   │   └── dashboard.js
│   └── index.html
│
├── .gitignore
└── README.md
```

### Fluxo arquitetural previsto

```text
Usuário
   │
   ▼
Frontend Web
HTML + CSS + JavaScript
   │
   ▼
ASP.NET Core Web API
   │
   ├── Controllers
   ├── Services
   └── Repositories
          │
          ▼
     AWS DynamoDB
```

A infraestrutura DynamoDB já foi provisionada. A integração de persistência entre a API e o banco de dados faz parte da próxima etapa de desenvolvimento.

## API REST

A estrutura inicial disponibiliza endpoints para gerenciamento de chamados.

| Método | Endpoint             | Descrição                       |
| ------ | -------------------- | ------------------------------- |
| `GET`  | `/api/chamados`      | Lista os chamados cadastrados.  |
| `GET`  | `/api/chamados/{id}` | Consulta um chamado específico. |
| `POST` | `/api/chamados`      | Registra um novo chamado.       |

**Observação:** na implementação inicial, os chamados são mantidos em memória. A persistência no DynamoDB está em desenvolvimento.

## Infraestrutura AWS

O projeto utiliza infraestrutura como código para provisionar recursos na AWS de maneira padronizada.

| Recurso                    | Configuração            |
| -------------------------- | ----------------------- |
| Cloud Provider             | Amazon Web Services     |
| Região                     | `sa-east-1` — São Paulo |
| Banco de dados             | Amazon DynamoDB         |
| Tabela                     | `suportehub-dev`        |
| Stack CloudFormation       | `suportehub-dev`        |
| Infraestrutura como código | YAML / CloudFormation   |

A configuração contempla uma tabela DynamoDB com chaves de partição e ordenação, índices secundários globais, criptografia e recursos de recuperação de dados.

## Como executar o projeto

### Pré-requisitos

- .NET SDK 10
- Visual Studio Code ou Visual Studio
- Git
- AWS CLI, para operações relacionadas à infraestrutura AWS

### 1. Clonar o repositório

```bash
git clone https://github.com/nathalySene/AWS.git
```

### 2. Acessar a pasta da API

```powershell
cd AWS\backend\SuporteHub.API
```

### 3. Restaurar dependências

```powershell
dotnet restore
```

### 4. Compilar o projeto

```powershell
dotnet build
```

### 5. Executar a aplicação

```powershell
dotnet run
```

A API será iniciada no endereço local informado pelo terminal.

### 6. Testar os endpoints

Exemplo de consulta:

```http
GET http://localhost:PORTA/api/chamados
```

Substitua `PORTA` pela porta apresentada na inicialização da aplicação.

**Segurança:** credenciais AWS não devem ser armazenadas no código-fonte. A integração com serviços AWS deve utilizar identidades IAM e mecanismos seguros de autenticação.

## Objetivos do projeto

O SuporteHub busca aplicar conhecimentos práticos de desenvolvimento de software e infraestrutura em nuvem para construir uma solução de suporte técnico que possa evoluir para um ambiente corporativo.

Entre os principais objetivos estão a centralização dos atendimentos, a redução de processos manuais, a melhoria da organização operacional e a criação de uma base tecnológica para futuras automações.

## Roadmap

- [x] Estrutura inicial do frontend e backend.
- [x] Implementação inicial da API REST.
- [x] Modelagem básica dos chamados.
- [x] Provisionamento do DynamoDB com CloudFormation.
- [x] Configuração do repositório Git.
- [ ] Integração da API com DynamoDB.
- [ ] Autenticação e autorização.
- [ ] Dashboard operacional integrado.
- [ ] Gestão completa do ciclo de vida dos chamados.
- [ ] Testes automatizados.
- [ ] Implantação da aplicação em ambiente cloud.

## Desenvolvedora

**Nathaly Sene**

Técnica em Desenvolvimento de Sistemas pela ETEC e estudante de Análise e Desenvolvimento de Sistemas na FIAP, com atuação em infraestrutura, suporte técnico e desenvolvimento web.

O SuporteHub representa a aplicação prática de conhecimentos em desenvolvimento Full Stack, administração de sistemas e serviços em nuvem, reunindo diferentes áreas da Tecnologia da Informação em um único projeto.

**Conecte-se comigo:**

- [GitHub](https://github.com/nathalySene)
- [LinkedIn](https://www.linkedin.com/in/nathalysene)
- [Instagram](https://www.instagram.com/neruu0)

---

**SuporteHub — Tecnologia aplicada à eficiência do suporte de TI.**

*Projeto em desenvolvimento contínuo.*
