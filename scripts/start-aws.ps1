# Run from Windows PowerShell with .NET 10 and AWS CLI v2 installed.
[CmdletBinding()]
param(
    [string]$AwsProfile = 'suportehub',
    [switch]$CheckOnly,
    [switch]$CreateAdmin,
    [switch]$PromoteAdmin
)
$ErrorActionPreference = 'Stop'
if ($CreateAdmin -and $PromoteAdmin) { throw 'Use somente -CreateAdmin ou -PromoteAdmin.' }
if (-not (Get-Command aws -ErrorAction SilentlyContinue)) {
    throw 'Instale a AWS CLI v2 e abra um novo PowerShell. Consulte docs/AWS.md.'
}
if (-not (Get-Command dotnet -ErrorAction SilentlyContinue)) { throw 'Instale o SDK .NET 10.' }
$repoRoot = Split-Path -Parent $PSScriptRoot
$env:AWS_PROFILE = $AwsProfile
$env:AWS_PAGER = ''
$env:AWS_EC2_METADATA_DISABLED = 'true'
Write-Host "Verificando identidade do perfil $AwsProfile..."
aws sts get-caller-identity --profile $AwsProfile --region sa-east-1 --query Arn --output text
if ($LASTEXITCODE -ne 0) { throw 'Perfil AWS indisponivel ou sessao expirada. Configure o perfil ou renove o login SSO. Consulte docs/AWS.md.' }

# Read-only preflight: never creates a table, modifies schema or copies local data.
$tableJson = aws dynamodb describe-table --profile $AwsProfile --region sa-east-1 --table-name suportehub-dev --query 'Table.{KeySchema:KeySchema,AttributeDefinitions:AttributeDefinitions,TableStatus:TableStatus}' --output json
if ($LASTEXITCODE -ne 0) { throw 'Nao foi possivel inspecionar suportehub-dev em sa-east-1. Confira a tabela e a permissao DescribeTable.' }
$table = ($tableJson -join "`n") | ConvertFrom-Json
$hash = @($table.KeySchema | Where-Object { $_.KeyType -eq 'HASH' })
$range = @($table.KeySchema | Where-Object { $_.KeyType -eq 'RANGE' })
$pk = @($table.AttributeDefinitions | Where-Object { $_.AttributeName -eq 'PK' -and $_.AttributeType -eq 'S' })
$sk = @($table.AttributeDefinitions | Where-Object { $_.AttributeName -eq 'SK' -and $_.AttributeType -eq 'S' })
if ($hash.Count -ne 1 -or $range.Count -ne 1 -or $hash[0].AttributeName -ne 'PK' -or $range[0].AttributeName -ne 'SK' -or $pk.Count -ne 1 -or $sk.Count -ne 1) {
    throw 'Tabela incompativel: a API requer PK (String, particao) e SK (String, ordenacao). A tabela existente nao foi modificada.'
}
if ($table.TableStatus -notin @('ACTIVE', 'UPDATING')) { throw 'Aguarde a tabela ficar disponivel.' }
Write-Host 'Tabela e identidade verificadas. Nenhum registro foi escrito nesta verificacao.'
if ($CheckOnly) { return }
Push-Location $repoRoot
try {
    $runArgs = @('run', '--project', 'backend/SuporteHub.API/SuporteHub.API.csproj', '--launch-profile', 'aws')
    if ($CreateAdmin) { $runArgs += @('--', '--create-admin') }
    if ($PromoteAdmin) { $runArgs += @('--', '--promote-admin') }
    & dotnet @runArgs
    if ($LASTEXITCODE -ne 0) { throw 'A API nao iniciou. Confira a mensagem acima.' }
} finally { Pop-Location }
