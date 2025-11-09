# Script de Verificação de Autor
# Execute este script para verificar se o nome está correto

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   VERIFICAÇÃO DE AUTOR - Gabriel Lima" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$CORRECT_NAME = "Gabriel Lima"
$CORRECT_EMAIL = "lima.ehg@gmail.com"

# Verificar configuração local
Write-Host "📋 CONFIGURAÇÃO LOCAL:" -ForegroundColor Yellow
$localName = git config user.name
$localEmail = git config user.email

Write-Host "   Nome:  " -NoNewline
if ($localName -eq $CORRECT_NAME) {
    Write-Host "✅ $localName" -ForegroundColor Green
} else {
    Write-Host "❌ $localName (ERRADO!)" -ForegroundColor Red
}

Write-Host "   Email: " -NoNewline
if ($localEmail -eq $CORRECT_EMAIL) {
    Write-Host "✅ $localEmail" -ForegroundColor Green
} else {
    Write-Host "❌ $localEmail (ERRADO!)" -ForegroundColor Red
}

Write-Host ""

# Verificar configuração global
Write-Host "🌍 CONFIGURAÇÃO GLOBAL:" -ForegroundColor Yellow
$globalName = git config --global user.name
$globalEmail = git config --global user.email

Write-Host "   Nome:  " -NoNewline
if ($globalName -eq $CORRECT_NAME) {
    Write-Host "✅ $globalName" -ForegroundColor Green
} else {
    Write-Host "❌ $globalName (ERRADO!)" -ForegroundColor Red
}

Write-Host "   Email: " -NoNewline
if ($globalEmail -eq $CORRECT_EMAIL) {
    Write-Host "✅ $globalEmail" -ForegroundColor Green
} else {
    Write-Host "❌ $globalEmail (ERRADO!)" -ForegroundColor Red
}

Write-Host ""

# Verificar últimos commits
Write-Host "📊 ÚLTIMOS 10 COMMITS:" -ForegroundColor Yellow
$commits = git log --pretty=format:"%h - %an (%ae) - %s" -10
$wrongCommits = 0

foreach ($commit in $commits) {
    if ($commit -match "Eduardo Lima") {
        Write-Host "   ❌ " -NoNewline -ForegroundColor Red
        Write-Host $commit -ForegroundColor Red
        $wrongCommits++
    } else {
        Write-Host "   ✅ " -NoNewline -ForegroundColor Green
        Write-Host $commit -ForegroundColor White
    }
}

Write-Host ""

# Verificar hook
Write-Host "🛡️  HOOK DE PRE-COMMIT:" -ForegroundColor Yellow
$hookPath = ".git\hooks\pre-commit.ps1"
if (Test-Path $hookPath) {
    Write-Host "   ✅ Hook instalado em: $hookPath" -ForegroundColor Green
} else {
    Write-Host "   ❌ Hook NÃO encontrado!" -ForegroundColor Red
}

Write-Host ""

# Resumo
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   RESUMO" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

$allCorrect = $true

if ($localName -ne $CORRECT_NAME -or $localEmail -ne $CORRECT_EMAIL) {
    Write-Host "❌ Configuração LOCAL precisa ser corrigida" -ForegroundColor Red
    $allCorrect = $false
}

if ($globalName -ne $CORRECT_NAME -or $globalEmail -ne $CORRECT_EMAIL) {
    Write-Host "❌ Configuração GLOBAL precisa ser corrigida" -ForegroundColor Red
    $allCorrect = $false
}

if ($wrongCommits -gt 0) {
    Write-Host "❌ $wrongCommits commit(s) com nome ERRADO encontrado(s)" -ForegroundColor Red
    $allCorrect = $false
}

if ($allCorrect) {
    Write-Host "✅ TUDO CORRETO! Você está usando: Gabriel Lima" -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "🔧 COMO CORRIGIR:" -ForegroundColor Yellow
    Write-Host "   1. Execute: git config user.name `"Gabriel Lima`"" -ForegroundColor White
    Write-Host "   2. Execute: git config user.email `"lima.ehg@gmail.com`"" -ForegroundColor White
    Write-Host "   3. Execute: git config --global user.name `"Gabriel Lima`"" -ForegroundColor White
    Write-Host "   4. Execute: git config --global user.email `"lima.ehg@gmail.com`"" -ForegroundColor White
    Write-Host ""
    Write-Host "   Para corrigir commits antigos, veja: VERIFY-AUTHOR.md" -ForegroundColor White
}

Write-Host ""
Write-Host "Pressione qualquer tecla para fechar..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey('NoEcho,IncludeKeyDown')
