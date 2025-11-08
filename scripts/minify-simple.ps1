# Simple and Safe Minification

Write-Host "=== MINIFICATION ===" -ForegroundColor Cyan
Write-Host ""

# Create dist
Write-Host "[1/5] Creating directories..." -NoNewline
$distDir = "..\dist"
if (Test-Path $distDir) { Remove-Item -Path $distDir -Recurse -Force }
New-Item -ItemType Directory -Path "$distDir\src\js" -Force | Out-Null
New-Item -ItemType Directory -Path "$distDir\src\styles" -Force | Out-Null
Write-Host " OK" -ForegroundColor Green

# Minify HTML
Write-Host "[2/5] Minifying HTML..." -NoNewline
$htmlOrig = (Get-Item "..\public\index.html").Length
html-minifier --collapse-whitespace --remove-comments ..\public\index.html -o $distDir\index.html 2>&1 | Out-Null
if (Test-Path "$distDir\index.html") {
    $htmlMin = (Get-Item "$distDir\index.html").Length
    $htmlPercent = [math]::Round((1 - $htmlMin/$htmlOrig) * 100, 1)
    Write-Host " OK (-$htmlPercent%)" -ForegroundColor Green
} else {
    Write-Host " FAILED" -ForegroundColor Red
    exit 1
}

# Minify JS
Write-Host "[3/5] Minifying JavaScript..." -NoNewline
$jsOrig = (Get-Item "..\public\src\js\game.js").Length
terser ..\public\src\js\game.js -o $distDir\src\js\game.min.js -c -m 2>&1 | Out-Null
if (Test-Path "$distDir\src\js\game.min.js") {
    $jsMin = (Get-Item "$distDir\src\js\game.min.js").Length
    $jsPercent = [math]::Round((1 - $jsMin/$jsOrig) * 100, 1)
    Write-Host " OK (-$jsPercent%)" -ForegroundColor Green
} else {
    Write-Host " FAILED" -ForegroundColor Red
    exit 1
}

# Minify CSS
Write-Host "[4/5] Minifying CSS..." -NoNewline
$cssOrig = (Get-Item "..\public\src\styles\styles.css").Length
cleancss -o $distDir\src\styles\styles.min.css ..\public\src\styles\styles.css 2>&1 | Out-Null
if (Test-Path "$distDir\src\styles\styles.min.css") {
    $cssMin = (Get-Item "$distDir\src\styles\styles.min.css").Length
    $cssPercent = [math]::Round((1 - $cssMin/$cssOrig) * 100, 1)
    Write-Host " OK (-$cssPercent%)" -ForegroundColor Green
} else {
    Write-Host " FAILED" -ForegroundColor Red
    exit 1
}

# Copy assets
Write-Host "[5/5] Copying assets..." -NoNewline
Copy-Item -Path "..\public\assets" -Destination $distDir -Recurse -Force
Copy-Item -Path "..\public\favicon.svg" -Destination $distDir -Force
Copy-Item -Path "..\public\og-image.png" -Destination $distDir -Force
Copy-Item -Path "..\public\site.webmanifest" -Destination $distDir -Force
Write-Host " OK" -ForegroundColor Green

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "SUCCESS!" -ForegroundColor Green
Write-Host ""
Write-Host "Savings:" -ForegroundColor Cyan
Write-Host "  HTML: $([math]::Round($htmlOrig/1024)) KB => $([math]::Round($htmlMin/1024)) KB (-$htmlPercent%)" -ForegroundColor Yellow
Write-Host "  JS:   $([math]::Round($jsOrig/1024)) KB => $([math]::Round($jsMin/1024)) KB (-$jsPercent%)" -ForegroundColor Yellow
Write-Host "  CSS:  $([math]::Round($cssOrig/1024)) KB => $([math]::Round($cssMin/1024)) KB (-$cssPercent%)" -ForegroundColor Yellow
$totalOrig = $htmlOrig + $jsOrig + $cssOrig
$totalMin = $htmlMin + $jsMin + $cssMin
$totalPercent = [math]::Round((1 - $totalMin/$totalOrig) * 100, 1)
Write-Host "  TOTAL: $([math]::Round($totalOrig/1024)) KB => $([math]::Round($totalMin/1024)) KB (-$totalPercent%)" -ForegroundColor Green
Write-Host ""
Write-Host "Output: dist/" -ForegroundColor Gray
