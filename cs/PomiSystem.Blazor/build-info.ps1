param(
    [Parameter(Mandatory = $true)]
    [string]$PublishRoot,
    [Parameter(Mandatory = $true)]
    [string]$ProjectRoot
)

$buildId = Get-Date -Format 'yyyyMMddHHmmssfff'
$buildTime = Get-Date -Format 'yyyy-MM-dd HH:mm:ss'

$buildInfoPath = Join-Path $PublishRoot 'js\build-info.js'
$payload = @{ buildId = [string]$buildId; buildTime = $buildTime } | ConvertTo-Json -Compress
$content = "window.pomiBuildInfo = { get: function() { return $payload; } };"
Set-Content -Path $buildInfoPath -Value $content -Encoding UTF8

$indexPath = Join-Path $PublishRoot 'index.html'
$sourceIndex = Join-Path $ProjectRoot 'wwwroot\index.html'
if (Test-Path $sourceIndex) {
    $html = Get-Content $sourceIndex -Raw
} else {
    $html = Get-Content $indexPath -Raw
}

$html = $html -replace '__BUILD_ID__', $buildId

Set-Content -Path $indexPath -Value $html -Encoding UTF8
