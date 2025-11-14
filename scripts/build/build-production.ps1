# Build Production - Minify all assets

Write-Host "Building Production Version..." -ForegroundColor Cyan
Write-Host ""

# Create dist directory
$distDir = "..\dist"
if (Test-Path $distDir) {
    Remove-Item -Path $distDir -Recurse -Force
}
New-Item -ItemType Directory -Path $distDir | Out-Null
New-Item -ItemType Directory -Path "$distDir\src\js" | Out-Null
New-Item -ItemType Directory -Path "$distDir\src\styles" | Out-Null
New-Item -ItemType Directory -Path "$distDir\assets" | Out-Null

Write-Host "[1/4] Minifying HTML..." -NoNewline
html-minifier --collapse-whitespace --remove-comments --minify-css --minify-js ..\public\index.html -o $distDir\index.html
Write-Host " [OK]" -ForegroundColor Green

Write-Host "[2/4] Minifying JavaScript..." -NoNewline
terser ..\public\src\js\game.js -o $distDir\src\js\game.min.js -c -m
Write-Host " [OK]" -ForegroundColor Green

Write-Host "[3/4] Minifying CSS..." -NoNewline
cleancss -o $distDir\src\styles\styles.min.css ..\public\src\styles\styles.css
Write-Host " [OK]" -ForegroundColor Green

Write-Host "[4/4] Copying assets..." -NoNewline
Copy-Item -Path "..\public\assets" -Destination $distDir -Recurse -Force
Copy-Item -Path "..\public\favicon.svg" -Destination $distDir -Force
Copy-Item -Path "..\public\og-image.png" -Destination $distDir -Force
Copy-Item -Path "..\public\site.webmanifest" -Destination $distDir -Force
Write-Host " [OK]" -ForegroundColor Green

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "[BUILD COMPLETE]" -ForegroundColor Green
Write-Host ""

# Calculate sizes
$htmlOrig = (Get-Item "..\public\index.html").Length
$htmlMin = (Get-Item "$distDir\index.html").Length
$jsOrig = (Get-Item "..\public\src\js\game.js").Length
$jsMin = (Get-Item "$distDir\src\js\game.min.js").Length
$cssOrig = (Get-Item "..\public\src\styles\styles.css").Length
$cssMin = (Get-Item "$distDir\src\styles\styles.min.css").Length

$htmlSaved = [math]::Round((1 - $htmlMin/$htmlOrig) * 100, 1)
$jsSaved = [math]::Round((1 - $jsMin/$jsOrig) * 100, 1)
$cssSaved = [math]::Round((1 - $cssMin/$cssOrig) * 100, 1)

Write-Host "RESULTS:" -ForegroundColor Cyan
Write-Host "HTML: $([math]::Round($htmlOrig/1024)) KB => $([math]::Round($htmlMin/1024)) KB (-$htmlSaved%)" -ForegroundColor Yellow
Write-Host "JS:   $([math]::Round($jsOrig/1024)) KB => $([math]::Round($jsMin/1024)) KB (-$jsSaved%)" -ForegroundColor Yellow
Write-Host "CSS:  $([math]::Round($cssOrig/1024)) KB => $([math]::Round($cssMin/1024)) KB (-$cssSaved%)" -ForegroundColor Yellow
Write-Host ""
Write-Host "Build output: $distDir" -ForegroundColor Gray
Write-Host ""
Write-Host "NEXT: Update index.html to reference .min files" -ForegroundColor Cyan
