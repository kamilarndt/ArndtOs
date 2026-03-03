# Z.AI Connectivity Heartbeat Script

$Proxy = "socks5h://lumqmxah:yumb47s6m5mq@31.59.20.176:6754"
$Token = "0ebd978f2bd44798a27bfb6f7fd01489.K1cuWqx1vWYfclJU"
$LogFile = "d:\_WorkSpaces\ArndtOs\z_ai_incidents.log"

Write-Host "Checking Z.AI via Proxy: $Proxy..."

# 1. WAF Check (Direct)
try {
    $direct = curl.exe -s -I https://api.z.ai --connect-timeout 5
    if ($direct -match "403") {
        $msg = "[$(Get-Date)] Direct access STILL BLOCKED (403)"
        Write-Host $msg -ForegroundColor Red
        $msg | Out-File -FilePath $LogFile -Append
    }
    else {
        $msg = "[$(Get-Date)] Direct access restored!"
        Write-Host $msg -ForegroundColor Green
        $msg | Out-File -FilePath $LogFile -Append
    }
}
catch {
    $msg = "[$(Get-Date)] Direct access failed (Handshake/Timeout)"
    Write-Host $msg -ForegroundColor Yellow
    $msg | Out-File -FilePath $LogFile -Append
}

# 2. Token Check (via Proxy)
try {
    $result = curl.exe -s -v -x $Proxy -H "Authorization: Bearer $Token" "https://api.z.ai/api/coding/paas/v4/models" 2>&1
    if ($result -match "401 Unauthorized") {
        $msg = "[$(Get-Date)] Proxy OK, but Token 401 Unauthorized (Expired?)"
        Write-Host $msg -ForegroundColor Red
        $msg | Out-File -FilePath $LogFile -Append
    }
    elseif ($result -match "200 OK" -or $result -match "results") {
        $msg = "[$(Get-Date)] Z.AI Fully Operational via Proxy"
        Write-Host $msg -ForegroundColor Green
        $msg | Out-File -FilePath $LogFile -Append
    }
    else {
        $msg = "[$(Get-Date)] Unknown Proxy/API error: $result"
        Write-Host $msg -ForegroundColor White
        $msg | Out-File -FilePath $LogFile -Append
    }
}
catch {
    Write-Host "Proxy unreachable" -ForegroundColor Red
}
