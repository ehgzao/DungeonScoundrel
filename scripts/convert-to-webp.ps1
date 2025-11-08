# Convert all JPG images to WebP format
# Requires: libwebp (cwebp.exe in PATH)

Write-Host "🖼️  WEBP CONVERTER - Dungeon Scoundrel" -ForegroundColor Cyan
Write-Host ""

# Check if cwebp is available
try {
    $null = Get-Command cwebp -ErrorAction Stop
    Write-Host "✅ cwebp found!" -ForegroundColor Green
} catch {
    Write-Host "❌ cwebp not found!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please install WebP tools:" -ForegroundColor Yellow
    Write-Host "1. Download from: https://developers.google.com/speed/webp/download" -ForegroundColor Yellow
    Write-Host "2. Or use Chocolatey: choco install webp" -ForegroundColor Yellow
    Write-Host "3. Or convert manually at: https://squoosh.app/" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "📝 Manual conversion guide created in NEXT_STEPS.md" -ForegroundColor Cyan
    exit 1
}

# Paths
$sourceDir = "..\assets\images"
$outputDir = "..\assets\images"

Write-Host "📁 Source: $sourceDir" -ForegroundColor Cyan
Write-Host "📁 Output: $outputDir" -ForegroundColor Cyan
Write-Host ""

# Get all JPG files
$images = Get-ChildItem -Path $sourceDir -Filter *.jpg

if ($images.Count -eq 0) {
    Write-Host "❌ No JPG images found in $sourceDir" -ForegroundColor Red
    exit 1
}

Write-Host "Found $($images.Count) images to convert:" -ForegroundColor Green
$images | ForEach-Object { Write-Host "  - $($_.Name)" -ForegroundColor Gray }
Write-Host ""

# Convert each image
$totalSaved = 0
$converted = 0

foreach ($img in $images) {
    $inputPath = $img.FullName
    $outputPath = Join-Path $outputDir "$($img.BaseName).webp"
    
    Write-Host "Converting $($img.Name)..." -NoNewline
    
    try {
        # Convert with quality 85
        $null = cwebp -q 85 $inputPath -o $outputPath 2>&1
        
        if (Test-Path $outputPath) {
            $originalSize = (Get-Item $inputPath).Length
            $webpSize = (Get-Item $outputPath).Length
            $saved = $originalSize - $webpSize
            $percent = [math]::Round(($saved / $originalSize) * 100, 1)
            
            $totalSaved += $saved
            $converted++
            
            Write-Host " ✅ " -ForegroundColor Green -NoNewline
            Write-Host "Saved $percent% " -ForegroundColor Yellow -NoNewline
            Write-Host "($([math]::Round($originalSize/1024)) KB → $([math]::Round($webpSize/1024)) KB)" -ForegroundColor Gray
        } else {
            Write-Host " ❌ Failed" -ForegroundColor Red
        }
    } catch {
        Write-Host " ❌ Error: $_" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "═══════════════════════════════════════" -ForegroundColor Cyan
Write-Host "✅ CONVERSION COMPLETE!" -ForegroundColor Green
Write-Host ""
Write-Host "Converted: $converted / $($images.Count) images" -ForegroundColor Cyan
Write-Host "Total saved: $([math]::Round($totalSaved/1024/1024, 2)) MB" -ForegroundColor Yellow
Write-Host ""
Write-Host "📝 NEXT STEPS:" -ForegroundColor Cyan
Write-Host "1. Update HTML to use <picture> tags" -ForegroundColor Yellow
Write-Host "2. Test locally: .\run-local.bat" -ForegroundColor Yellow
Write-Host "3. Verify images load correctly" -ForegroundColor Yellow
Write-Host "4. Commit changes" -ForegroundColor Yellow
Write-Host ""
Write-Host "See NEXT_STEPS.md for HTML update examples" -ForegroundColor Gray
