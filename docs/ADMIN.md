# Área do administrador

A área segue as telas enviadas em PNG: lista de chamados, chamado e solicitante, atendidos e relatórios. Não inclui avaliação, estrelas, notas de satisfação ou seus indicadores. Os nomes e números mostrados vêm do banco; os exemplos do desenho não são cadastrados automaticamente.

## Acessar no Windows

Se já possui uma conta, pare a aplicação com `Ctrl+C`. Na raiz que contém `backend`, execute no PowerShell:

```powershell
dotnet run --project backend/SuporteHub.API/SuporteHub.API.csproj --launch-profile http -- --promote-admin
```

Informe o e-mail da conta existente no terminal. Esse comando altera somente o perfil dessa conta no banco configurado, preservando senha e chamados. Não há promoção de perfil pelo cadastro público ou por uma rota HTTP.

Inicie a aplicação novamente:

```powershell
dotnet run --project backend/SuporteHub.API/SuporteHub.API.csproj --launch-profile http
```

Abra `http://localhost:5218`, saia de qualquer sessão anterior e entre com seu e-mail e senha. O menu mostrará **Área do administrador**, com Painel, Chamados, Atendidos, Relatórios e Equipe.

Se ainda não tem conta, faça o cadastro antes de executar a promoção. A primeira conta de um banco local Development vazio continua sendo de suporte; as demais são clientes. Contas existentes não recebem administração automaticamente.

Para criar um administrador novo, sem substituir uma conta existente:

```powershell
dotnet run --project backend/SuporteHub.API/SuporteHub.API.csproj --launch-profile http -- --create-admin
```

Informe e-mail, nome e uma senha de 10 a 128 caracteres. A senha fica oculta na entrada interativa. Se o e-mail já existir, use `--promote-admin`. Esses comandos exigem acesso ao servidor; não existem credenciais padrão.

## Funções

- **Chamados:** todos, pendentes (abertos e aguardando), em andamento e atendidos; busca por número, assunto, nome ou e-mail; filtros por prioridade, responsável e período; paginação de seis itens; exportação CSV dos resultados filtrados.
- **Novo chamado:** seleção de um solicitante já cadastrado, assunto, categoria, prioridade, descrição e anexos. O histórico identifica quem abriu o chamado em nome do solicitante.
- **Detalhe:** descrição, anexos, conversa, informações reais do solicitante e suas contagens de chamados. O layout não inventa cargo, departamento, telefone ou unidade, pois esses dados não são coletados no cadastro atual.
- **Gerenciar:** responsável, prioridade e status são salvos juntos em uma escrita condicionada à versão do registro, com histórico das alterações. Resolver e reabrir são ações rápidas. Reabrir limpa a última data de resolução; resolver novamente registra a nova conclusão.
- **Conversa:** resposta pública e nota interna são ações separadas. Notas internas ficam disponíveis apenas para suporte e administração e não aparecem nas respostas da API para clientes. Respostas e anexos de chamados resolvidos exigem reabertura; notas internas ainda podem ser acrescentadas.
- **Atendidos:** contagem, tempo médio de resolução, solicitante, pessoa que resolveu, data, duração, filtros, paginação e CSV. A pessoa que resolveu fica registrada independentemente de transferências posteriores.
- **Relatórios:** quantidade aberta no período, tempo médio até a primeira resposta da equipe, taxa de resolução, atendimentos por integrante, status, categorias, assuntos e série diária. Exportação CSV e **Exportar PDF**, que abre a impressão do navegador; escolha **Salvar como PDF** como destino.
- **Equipe:** carga atual, quantidade resolvida e cadastro de agentes com senha inicial. Esta tela cria somente agentes, sem conceder administração.

Os relatórios usam a data de abertura como filtro do conjunto. A taxa de resolução é o número de chamados atualmente resolvidos dividido pelo total aberto no período. O gráfico diário mostra as aberturas e últimas resoluções desse conjunto nos últimos sete dias. O ranking contabiliza quem efetivamente resolveu; resoluções pelo próprio cliente não são atribuídas a um agente.

Datas de resolução e autoria das respostas passam a ser registradas a partir desta versão. Registros antigos sem esses dados mostram `—` e não entram nas médias de tempo. Atendidos antigos sem data aparecem ao selecionar **Todo o período**. Não é usada a data da última alteração como substituta da resolução.

## Banco e permissões

O modo local continua usando `.local/suportehub.db`, sem Docker ou serviços Google/e-mail. Os campos novos são armazenados no JSON de cada chamado; registros anteriores continuam legíveis e não precisam de migração destrutiva. Faça backup de `.local/` com a aplicação parada antes de atualizar.

As rotas `/api/admin/*`, `/api/chamados/{id}/gerenciar` e `/api/chamados/{id}/notas` exigem o perfil `admin`. Clientes mantêm acesso apenas aos seus próprios chamados. Agentes continuam com os fluxos de suporte anteriores e podem consultar notas internas; não podem cadastrar equipe nem usar rotas administrativas. Senhas e hashes não são retornados nos dados de usuários.

A opção AWS continua disponível, mas esses comandos só afetam a AWS se o processo estiver explicitamente configurado para DynamoDB e tiver uma identidade IAM válida. Os testes desta implementação usam SQLite temporário; a tabela AWS existente não foi modificada ou validada.

## Verificar

```bash
dotnet build backend/SuporteHub.API/SuporteHub.API.csproj
python3 tests/integration.py
node tests/browser.cjs
python3 tests/admin.py
```

`tests/admin.py` exige Python Playwright e Chromium. Ele testa permissões, notas privadas, histórico, resolução/reabertura, persistência, cadastro da equipe e o fluxo real no navegador, incluindo CSV, impressão PDF e tela móvel. Usa banco e contas temporários separados dos dados reais. `DOTNET_BIN` e `CHROMIUM_BIN` permitem indicar os executáveis.
