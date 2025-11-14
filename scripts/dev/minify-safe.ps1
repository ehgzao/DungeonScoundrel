# Safe Minification Script
# Shows progress and handles errors gracefully

Write-Host "=== SAFE MINIFICATION ===" -ForegroundColor Cyan
Write-Host ""

# Step 1: Check tools
Write-Host "[CHECK] Verifying tools..." -ForegroundColor Yellow

$tools = @{
    "html-minifier" = $false
    "terser" = $false
    "cleancss" = $false
}

foreach ($tool in $tools.Keys) {
    try {
        $null = Get-Command $tool -ErrorAction Stop
        $tools[$tool] = $true
        Write-Host "  [OK] $tool found" -ForegroundColor Green
    } catch {
        Write-Host "  [MISSING] $tool not found" -ForegroundColor Red
    }
}

if ($tools.Values -contains $false) {
    Write-Host ""
    Write-Host "[ERROR] Some tools are missing!" -ForegroundColor Red
    Write-Host "Run: npm install -g html-minifier terser clean-css-cli" -ForegroundColor Yellow
    exit 1
}

Write-Host ""

# Step 2: Create dist directory
Write-Host "[STEP 1/5] Creating dist directory..." -ForegroundColor Yellow
$distDir = "..\dist"

if (Test-Path $distDir) {
    Write-Host "  Cleaning existing dist..." -ForegroundColor Gray
    Remove-Item -Path $distDir -Recurse -Force
}

New-Item -ItemType Directory -Path $distDir -Force | Out-Null
New-Item -ItemType Directory -Path "$distDir\src\js" -Force | Out-Null
New-Item -ItemType Directory -Path "$distDir\src\styles" -Force | Out-Null
Write-Host "  [OK] Directories created" -ForegroundColor Green
Write-Host ""

# Step 3: Minify HTML
Write-Host "[STEP 2/5] Minifying HTML..." -ForegroundColor Yellow
$htmlInput = "..\public\index.html"
$htmlOutput = "$distDir\index.html"

if (-not (Test-Path $htmlInput)) {
    Write-Host "  [ERROR] Input file not found: $htmlInput" -ForegroundColor Red
    exit 1
}

try {
    $htmlOrigSize = (Get-Item $htmlInput).Length
    Write-Host "  Original size: $([math]::Round($htmlOrigSize/1024, 2)) KB" -ForegroundColor Gray
    
    $result = html-minifier --collapse-whitespace --remove-comments --minify-css true --minify-js true $htmlInput -o $htmlOutput 2>&1
    
    if (Test-Path $htmlOutput) {
        $htmlMinSize = (Get-Item $htmlOutput).Length
        $htmlSaved = [math]::Round((1 - $htmlMinSize/$htmlOrigSize) * 100, 1)
        Write-Host "  Minified size: $([math]::Round($htmlMinSize/1024, 2)) KB" -ForegroundColor Gray
        Write-Host "  [OK] Saved $htmlSaved%" -ForegroundColor Green
    } else {
        Write-Host "  [ERROR] Output file not created" -ForegroundColor Red
        Write-Host "  Error: $result" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "  [ERROR] $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}
Write-Host ""

# Step 4: Minify JavaScript
Write-Host "[STEP 3/5] Minifying JavaScript..." -ForegroundColor Yellow
$jsInput = "..\public\src\js\game.js"
$jsOutput = "$distDir\src\js\game.min.js"

if (-not (Test-Path $jsInput)) {
    Write-Host "  [ERROR] Input file not found: $jsInput" -ForegroundColor Red
    exit 1
}

try {
    $jsOrigSize = (Get-Item $jsInput).Length
    Write-Host "  Original size: $([math]::Round($jsOrigSize/1024, 2)) KB" -ForegroundColor Gray
    
    $result = terser $jsInput -o $jsOutput -c -m 2>&1
    
    if (Test-Path $jsOutput) {
        $jsMinSize = (Get-Item $jsOutput).Length
        $jsSaved = [math]::Round((1 - $jsMinSize/$jsOrigSize) * 100, 1)
        Write-Host "  Minified size: $([math]::Round($jsMinSize/1024, 2)) KB" -ForegroundColor Gray
        Write-Host "  [OK] Saved $jsSaved%" -ForegroundColor Green
    } else {
        Write-Host "  [ERROR] Output file not created" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "  [ERROR] $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}
Write-Host ""

# Step 5: Minify CSS
Write-Host "[STEP 4/5] Minifying CSS..." -ForegroundColor Yellow
$cssInput = "..\public\src\styles\styles.css"
$cssOutput = "$distDir\src\styles\styles.min.css"

if (-not (Test-Path $cssInput)) {
    Write-Host "  [ERROR] Input file not found: $cssInput" -ForegroundColor Red
    exit 1
}

try {
    $cssOrigSize = (Get-Item $cssInput).Length
    Write-Host "  Original size: $([math]::Round($cssOrigSize/1024, 2)) KB" -ForegroundColor Gray
    
    $result = cleancss -o $cssOutput $cssInput 2>&1
    
    if (Test-Path $cssOutput) {
        $cssMinSize = (Get-Item $cssOutput).Length
        $cssSaved = [math]::Round((1 - $cssMinSize/$cssOrigSize) * 100, 1)
        Write-Host "  Minified size: $([math]::Round($cssMinSize/1024, 2)) KB" -ForegroundColor Gray
        Write-Host "  [OK] Saved $cssSaved%" -ForegroundColor Green
    } else {
        Write-Host "  [ERROR] Output file not created" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "  [ERROR] $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}
Write-Host ""

# Step 6: Copy assets
Write-Host "[STEP 5/5] Copying assets..." -ForegroundColor Yellow
try {
    Copy-Item -Path "..\public\assets" -Destination $distDir -Recurse -Force
    Copy-Item -Path "..\public\favicon.svg" -Destination $distDir -Force
    Copy-Item -Path "..\public\og-image.png" -Destination $distDir -Force
    Copy-Item -Path "..\public\site.webmanifest" -Destination $distDir -Force
    Write-Host "  [OK] Assets copied" -ForegroundColor Green
} catch {
    Write-Host "  [ERROR] $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}
Write-Host ""

# Summary
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "[SUCCESS] Build Complete!" -ForegroundColor Green
Write-Host ""
Write-Host "RESULTS:" -ForegroundColor Cyan
Write-Host "  HTML: -$htmlSaved%" -ForegroundColor Yellow
Write-Host "  JS:   -$jsSaved%" -ForegroundColor Yellow
Write-Host "  CSS:  -$cssSaved%" -ForegroundColor Yellow
Write-Host ""
Write-Host "Output: $distDir" -ForegroundColor Gray
Write-Host ""
Write-Host "NOTE: This is for reference only." -ForegroundColor Yellow
Write-Host "For production, we'll use Netlify's build optimization." -ForegroundColor Yellow
