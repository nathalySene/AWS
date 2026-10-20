# SuporteHub 💜

Sistema de chamados de suporte com área do cliente e painel do agente.

## Estrutura

```
suporte-hub/
├── frontend/
│   ├── index.html          # Ponto de entrada (carrega CSS e JS)
│   ├── css/style.css       # Estilos e temas (claro/escuro)
│   ├── js/
│   │   ├── app.js          # Helpers, estado global, layout (shell) e rotas
│   │   ├── auth.js         # Tela de login
│   │   ├── chamados.js     # Novo chamado, listagem, detalhe + dados mock
│   │   └── dashboard.js    # Painel do agente
│   └── assets/             # Imagens, ícones, fontes locais
├── backend/
│   └── SuporteHub.API/     # API .NET (a implementar)
│       ├── Controllers/
│       ├── Models/
│       ├── DTOs/
│       ├── Services/
│       └── Repositories/
└── README.md
```

## Rodando o frontend

Não precisa de build. Sirva a pasta `frontend/` com qualquer servidor estático:

```bash
cd frontend
python3 -m http.server 8080
# abra http://localhost:8080
```

> Os scripts são carregados com `defer`, **nesta ordem**: `app.js` → `auth.js` → `chamados.js` → `dashboard.js`.
> Eles compartilham o escopo global (sem módulos ES), então mantenha a ordem no `index.html`.

### Login de demonstração

Qualquer e-mail e senha funcionam. E-mails que começam com `carlos`, `suporte` ou `agente` entram como **agente**; os demais entram como **cliente**.

## Rotas (hash)

| Rota               | Perfil  | Arquivo        |
|--------------------|---------|----------------|
| `#/login`          | todos   | `auth.js`      |
| `#/novo`           | cliente | `chamados.js`  |
| `#/chamados`       | cliente | `chamados.js`  |
| `#/chamado/:id`    | ambos   | `chamados.js`  |
| `#/painel`         | agente  | `dashboard.js` |

## Próximos passos

- **Backend:** criar o projeto em `backend/SuporteHub.API` (Controllers, Models, DTOs, Services, Repositories) com endpoints de autenticação, chamados e métricas.
- **Frontend:** trocar o array mock `T` em `chamados.js` e os números fixos de `dashboard.js` por chamadas `fetch` à API; mover o controle de sessão em `auth.js` para token (JWT).
