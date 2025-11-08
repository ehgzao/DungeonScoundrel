# Extract JavaScript from index.html

$htmlPath = "..\public\index.html"
$jsPath = "..\src\js\game.js"

Write-Host "📖 Reading index.html..." -ForegroundColor Cyan

# Read all lines
$lines = Get-Content $htmlPath

# Find script start and end
$scriptStart = -1
$scriptEnd = -1

for ($i = 0; $i < $lines.Count; $i++) {
    if ($lines[$i] -match '<script type="module">') {
        $scriptStart = $i + 1  # Start after <script> tag
        Write-Host "✅ Found script start at line $i" -ForegroundColor Green
    }
    if ($scriptStart -gt 0 -and $lines[$i] -match '^\s*</script>\s*$' -and $lines[$i-1] -notmatch 'emailjs') {
        $scriptEnd = $i - 1  # End before </script> tag
        Write-Host "✅ Found script end at line $i" -ForegroundColor Green
        break
    }
}

if ($scriptStart -lt 0 -or $scriptEnd -lt 0) {
    Write-Host "❌ Could not find script boundaries" -ForegroundColor Red
    exit 1
}

# Extract JavaScript
$jsLines = $lines[$scriptStart..$scriptEnd]

Write-Host "💾 Writing game.js..." -ForegroundColor Cyan
$jsLines | Set-Content -Path $jsPath -Encoding UTF8

# Update HTML
Write-Host "💾 Updating index.html..." -ForegroundColor Cyan
$newLines = $lines[0..($scriptStart-2)] + 
            "    <script type=" + '"' + "module" + '"' + " src=" + '"' + "../src/js/game.js" + '"' + "></script>" +
            $lines[($scriptEnd+2)..($lines.Count-1)]

$newLines | Set-Content -Path $htmlPath -Encoding UTF8

Write-Host "✅ Done!" -ForegroundColor Green
Write-Host "   - Extracted: $($scriptEnd - $scriptStart + 1) lines" -ForegroundColor Yellow
Write-Host "   - game.js: $jsPath" -ForegroundColor Yellow
Write-Host "   - index.html updated" -ForegroundColor Yellow
