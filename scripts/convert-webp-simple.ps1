# Simple WebP Converter
# Converts all JPG images in assets/images to WebP

Write-Host "WebP Converter - Dungeon Scoundrel" -ForegroundColor Cyan
Write-Host ""

# Check cwebp
try {
    $null = Get-Command cwebp -ErrorAction Stop
    Write-Host "[OK] cwebp found!" -ForegroundColor Green
} catch {
    Write-Host "[ERROR] cwebp not found!" -ForegroundColor Red
    Write-Host "Install with: choco install webp" -ForegroundColor Yellow
    exit 1
}

# Paths
$sourceDir = "..\assets\images"
$outputDir = "..\assets\images"

Write-Host "Source: $sourceDir" -ForegroundColor Cyan
Write-Host ""

# Get JPG files
$images = Get-ChildItem -Path $sourceDir -Filter *.jpg

if ($images.Count -eq 0) {
    Write-Host "[ERROR] No JPG images found" -ForegroundColor Red
    exit 1
}

Write-Host "Found $($images.Count) images" -ForegroundColor Green
Write-Host ""

# Convert
$totalSaved = 0
$converted = 0

foreach ($img in $images) {
    $inputPath = $img.FullName
    $outputPath = Join-Path $outputDir "$($img.BaseName).webp"
    
    Write-Host "Converting $($img.Name)..." -NoNewline
    
    try {
        $null = cwebp -q 85 $inputPath -o $outputPath 2>&1
        
        if (Test-Path $outputPath) {
            $originalSize = (Get-Item $inputPath).Length
            $webpSize = (Get-Item $outputPath).Length
            $saved = $originalSize - $webpSize
            $percent = [math]::Round(($saved / $originalSize) * 100, 1)
            
            $totalSaved += $saved
            $converted++
            
            $origMB = [math]::Round($originalSize/1024/1024, 2)
            $webpMB = [math]::Round($webpSize/1024/1024, 2)
            Write-Host " [OK] Saved $percent% ($origMB MB => $webpMB MB)" -ForegroundColor Green
        } else {
            Write-Host " [FAILED]" -ForegroundColor Red
        }
    } catch {
        Write-Host " [ERROR] $_" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "[COMPLETE]" -ForegroundColor Green
Write-Host ""
Write-Host "Converted: $converted / $($images.Count) images" -ForegroundColor Cyan
$savedMB = [math]::Round($totalSaved/1024/1024, 2)
Write-Host "Total saved: $savedMB MB" -ForegroundColor Yellow
Write-Host ""
Write-Host "NEXT STEPS:" -ForegroundColor Cyan
Write-Host "1. I will update HTML to use WebP" -ForegroundColor Yellow
Write-Host "2. Test locally" -ForegroundColor Yellow
Write-Host "3. Commit changes" -ForegroundColor Yellow
