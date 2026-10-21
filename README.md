# SuporteHub 💜

Sistema de chamados com frontend HTML/CSS/JavaScript, API ASP.NET Core (.NET 10) e persistência no DynamoDB. O frontend e a API são servidos na mesma origem. HTML, CSS e JavaScript são incluídos na saída de compilação e publicação em `wwwroot/`; a página inicial funciona independentemente da pasta usada para iniciar a DLL.

## Começar agora

Na raiz do repositório preparado, execute:

```bash
./scripts/start.sh
```

O comando inicia o banco persistente DynamoDB Local e a aplicação na porta **5218**, sem credenciais AWS. Abra a tela de cadastro: se o banco estiver vazio, a primeira conta será a conta de suporte. Escolha seu nome, e-mail e senha. As contas seguintes serão clientes. Saia e crie outra conta para testar o fluxo do cliente e, depois, entre com a conta de suporte para atender o chamado.

O primeiro cadastro usa uma transação para permitir apenas uma conta inicial de suporte, inclusive com cadastros simultâneos. Essa regra existe somente no modo local; na AWS, o cadastro público continua criando apenas clientes.

Os dados ficam em `.local/` e são preservados ao reiniciar. A opção AWS permanece disponível em `./scripts/run-aws.sh`, mas não é necessária para executar o projeto localmente.

## Se a página retornar 404

Pare a execução anterior com `Ctrl+C` e, usando os arquivos atualizados deste projeto na raiz do repositório, execute:

```bash
dotnet clean backend/SuporteHub.API/SuporteHub.API.csproj
dotnet build backend/SuporteHub.API/SuporteHub.API.csproj
./scripts/start.sh
```

O terminal deve informar que a aplicação está ouvindo na porta **5218**. Abra a raiz do servidor no navegador da **mesma máquina** onde esses comandos foram executados. Acessar essa porta no seu computador não conecta ao servidor de um ambiente remoto. Este ambiente de configuração não fornece um endereço público de preview.

A saída compilada deve conter `backend/SuporteHub.API/bin/Debug/net10.0/wwwroot/index.html`. Os scripts de inicialização verificam esse arquivo e pedem uma nova compilação se ele estiver ausente. Para diagnosticar: a página inicial e `/api/health` devem responder 200; `/api/chamados` sem login responde 401, como esperado.

Para distribuir a aplicação, publique o projeto completo e mantenha sua pasta `wwwroot/` junto da DLL:

```bash
dotnet publish backend/SuporteHub.API/SuporteHub.API.csproj -o ./artifacts/app
```

O resultado da publicação foi validado executando a DLL a partir de uma pasta diferente do projeto. Esse comando gera arquivos; ele não hospeda nem publica o site na internet.

## Funcionalidades

- Cadastro de clientes, login com senha verificada e sessão em cookie HttpOnly.
- Criação de chamados, busca, filtros, paginação e consulta de detalhes.
- Histórico com respostas do cliente e do agente.
- Upload e download de PNG, JPG e PDF de até 10 MB, até 20 anexos por chamado.
- Atribuição e transferência para agentes, atualização de status e reabertura pelo agente.
- Painel com contagens reais, fila geral, fila pessoal, equipe e relatórios com filtro de período e exportação CSV.
- Autorização na API: clientes acessam apenas seus próprios chamados; agentes têm acesso à operação de suporte. O solicitante vem da sessão, nunca de um e-mail enviado no formulário.

Não há login Google nem envio de e-mails para recuperação de senha. Os controles de demonstração foram removidos para evitar simular autenticação ou operações que não existem.

## Preparar o SDK e compilar

Requisitos: SDK .NET 10. Para testes locais, Docker com Compose. O frontend não requer npm nem build.

No ambiente Codex preparado:

```bash
export DOTNET_ROOT=/workspace/.dotnet
export PATH="$DOTNET_ROOT:$PATH"
export DOTNET_CLI_HOME=/workspace/.cloud-setup/dotnet-home
export NUGET_PACKAGES=/workspace/.cloud-setup/nuget
```

Na raiz do repositório:

```bash
dotnet restore backend/SuporteHub.API/SuporteHub.API.csproj
dotnet build backend/SuporteHub.API/SuporteHub.API.csproj --no-restore
```

O sandbox de comandos deste ambiente exige execução aprovada fora do sandbox para os mutexes usados por `dotnet restore/build`. A execução direta da DLL funciona no sandbox.

## Opção: usar a tabela AWS existente

Configuração AWS preservada:

- Tabela: **suportehub-dev**
- Região: **sa-east-1** (São Paulo)
- Stack informada: **suportehub-dev**

Disponibilize uma identidade AWS válida ao SDK .NET, por exemplo uma role da máquina ou um perfil AWS montado de forma segura. Nunca coloque chaves no código, no repositório ou no chat. Valores substituídos por um proxy de segredos não equivalem a credenciais brutas para assinar requisições AWS SigV4.

A identidade precisa de `dynamodb:GetItem`, `dynamodb:PutItem`, `dynamodb:Query` e `dynamodb:UpdateItem` no ARN da tabela. O template existente já contempla essas ações. Libere o destino HTTPS `dynamodb.sa-east-1.amazonaws.com` na rede do ambiente. A aplicação não cria, limpa nem modifica o esquema de tabelas AWS durante a inicialização; faz uma leitura para confirmar acesso.

```bash
./scripts/run-aws.sh
```

A aplicação escuta por padrão na porta **5218**. Use HTTPS no acesso público, com o terminador TLS configurado para a implantação. Não sirva `frontend/` separadamente com Python: as rotas `/api` precisam estar na mesma origem.

**Situação neste ambiente:** a leitura AWS foi tentada, mas o SDK informou que não há perfil/identidade AWS utilizável. O acesso de rede ao endpoint também foi bloqueado; sua liberação foi salva no rascunho do ambiente. A validação com a tabela real depende de disponibilizar a identidade IAM e aplicar a configuração de rede. Os testes automatizados usam apenas DynamoDB Local.

### Contrato dos registros

A tabela deve ter chaves string `PK` e `SK`, como no template `infra/dynamodb.yml`. A implementação usa:

| PK | SK | Conteúdo |
|---|---|---|
| `USERS` | e-mail normalizado | Conta, nome, perfil e hash de senha |
| `TICKETS` | `TICKET#0000000001` | Chamado, histórico e metadados dos anexos |
| `META` | `TICKET_COUNTER` | Contador atômico `NextId` |

As entidades são armazenadas em `Data` (JSON) e `Version` (número). As atualizações usam condição de versão para evitar sobrescrever alterações concorrentes. O contador usa `UpdateItem` atômico. Nenhum dado existente é apagado ou migrado automaticamente. Registros anteriores com outro formato exigem uma migração separada; a estrutura atual da tabela real ainda não pôde ser inspecionada. Os GSIs do template ainda não são usados; esta versão consulta as partições `USERS` e `TICKETS` e filtra no servidor.

## Execução local e inicialização pelo IDE

O modo local é o padrão do comando `scripts/start.sh` e dos perfis de desenvolvimento do IDE. Também pode ser iniciado diretamente:

```bash
./scripts/run-local.sh
```

A imagem do DynamoDB é fixada por versão e digest no `compose.yml`. O banco usa um diretório persistente em `.local/dynamodb`; a porta 8000 é publicada apenas em loopback. O script configura `DynamoDb__ServiceUrl=http://127.0.0.1:8000` e a tabela **suportehub-local**. A API só aceita endpoint alternativo em loopback e com `ASPNETCORE_ENVIRONMENT=Development`.

O modo AWS nunca troca silenciosamente para o banco local. A tabela local é criada automaticamente; a tabela AWS precisa existir.

Os perfis `http` e `https` em `Properties/launchSettings.json` apontam para o mesmo banco local. Antes de usar `dotnet run` ou iniciar pelo IDE, execute `docker compose up -d dynamodb`. O script `start.sh` inicia o banco automaticamente e aproveita o SDK preparado no ambiente. Compile novamente se alterar o backend.

## Criar um agente

No banco local vazio, o primeiro cadastro pela interface cria a conta de suporte. Cadastros posteriores criam clientes. Para agentes adicionais ou para o primeiro agente na AWS, use o comando administrativo na pasta `backend/SuporteHub.API`, com as mesmas configurações de banco da API:

```bash
# Para AWS, deixe DynamoDb__ServiceUrl ausente e disponibilize a identidade IAM.
export DynamoDb__TableName=suportehub-dev
export DynamoDb__Region=sa-east-1
dotnet bin/Debug/net10.0/SuporteHub.API.dll --create-agent
```

O comando pede e-mail, nome e senha de 10 a 128 caracteres; a senha não é mostrada no terminal nem passada em argumentos. Ele não substitui uma conta existente.

Para criar um agente **local**, configure antes:

```bash
export ASPNETCORE_ENVIRONMENT=Development
export DynamoDb__ServiceUrl=http://127.0.0.1:8000
export DynamoDb__TableName=suportehub-local
```

Não existem contas ou senhas padrão. A conta inicial é criada por você. Os testes usam tabelas separadas e não criam contas no banco local da aplicação.

## Arquivos e sessões

As contas, chamados, respostas e metadados dos arquivos ficam no DynamoDB. Os bytes dos anexos ficam no diretório definido em `Storage__UploadsPath`; as chaves de proteção dos cookies ficam em `Storage__KeysPath`. Os scripts usam diretórios distintos para AWS e local dentro de `.local/`, ignorados pelo Git.

Esses diretórios precisam de armazenamento persistente e backup. Reiniciar a API preserva os dados, os anexos e as sessões quando o banco e esses diretórios são mantidos. Em múltiplas instâncias, os arquivos e as chaves precisam ser compartilhados; um bucket S3 para anexos e proteção das chaves em repouso são etapas de implantação ainda não implementadas. Não apague `.local/` para reiniciar a aplicação.

## API

| Método | Rota | Uso |
|---|---|---|
| GET | `/api/health` | Leitura de prontidão do DynamoDB |
| GET | `/api/auth/setup` | Informa se o modo local aguarda a primeira conta de suporte |
| POST | `/api/auth/cadastro` | Cadastro de cliente, ou primeira conta de suporte no banco local vazio |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Conta autenticada |
| POST | `/api/auth/logout` | Encerrar sessão |
| GET, POST | `/api/chamados` | Listar e criar |
| GET | `/api/chamados/{id}` | Detalhes autorizados |
| POST | `/api/chamados/{id}/respostas` | Adicionar resposta |
| PATCH | `/api/chamados/{id}/status` | Alterar status; cliente pode resolver seu chamado |
| PATCH | `/api/chamados/{id}/responsavel` | Atribuir agente (apenas agentes) |
| POST | `/api/chamados/{id}/anexos` | Upload multipart, campo `arquivo` |
| GET | `/api/chamados/{id}/anexos/{fileId}` | Download autorizado |
| GET | `/api/equipe` | Agentes cadastrados (apenas agentes) |

Requisições que modificam dados exigem o cabeçalho `X-Requested-With: SuporteHub`. Não há CORS para outras origens. O cookie é HttpOnly e SameSite Strict; é Secure quando a conexão usa HTTPS. O login possui limitação de tentativas. Senhas são armazenadas com o `PasswordHasher` do ASP.NET Core; senhas e tokens não ficam em web storage. O OpenAPI fica em `/openapi/v1.json` no ambiente Development.

## Testes reproduzíveis

Com o código compilado e DynamoDB Local iniciado:

```bash
docker compose up -d dynamodb
python3 tests/integration.py
node tests/browser.cjs
```

O teste de navegador exige Playwright e Chromium instalados (`/usr/bin/chromium`, configurável por `CHROMIUM_BIN`). Ambos os testes aceitam `DOTNET_BIN` para localizar o SDK. O teste Python usa apenas a biblioteca padrão. Eles criam tabelas locais descartáveis com nomes únicos e contas de teste, sem usar a tabela AWS nem credenciais de usuários. As tabelas de teste são retidas localmente para diagnóstico.

Os sete testes de integração cobrem inicialização da conta de suporte sem duplicidade, autenticação e autorização, isolamento entre clientes, respostas, arquivos, atribuição, status, IDs concorrentes e persistência após reinício. O navegador também valida busca, recuperação de erro, fila pessoal, equipe, relatórios e escape de HTML.

A compilação ainda emite NU1903 para `Microsoft.OpenApi` 2.0.0 ([GHSA-v5pm-xwqc-g5wc](https://github.com/advisories/GHSA-v5pm-xwqc-g5wc)); sua atualização permanece pendente.
