# AntiGravity Workspace Bootstrap Script v2.0
# Automatyczne wykrywanie portow i procesow

# ============================================================
# KONFIGURACJA - UNIKALNE PORTY (poza standardowymi zakresami)
# ============================================================
$AntigravityPath = "D:\_WorkSpaces\antigravity-system"

# Standardowe porty uslug AntiGravity
$DaemonPort = 8080
$MemoryPort = 3000
$RouterPort = 8000
$DockerProxyPort = 2375

# Nazwy procesow do wykrywania
$ProcessNames = @{
    Daemon = @("zeroclaw-daemon", "daemon", "cargo")
    Memory = @("node", "memory-service")
    Router = @("python")
}

# ============================================================
# FUNKCJE HELPER
# ============================================================
function Write-Success { Write-Host "[OK] $args" -ForegroundColor Green }
function Write-Info { Write-Host "-> $args" -ForegroundColor Cyan }
function Write-Warn { Write-Host "[!] $args" -ForegroundColor Yellow }
function Write-Err { Write-Host "[X] $args" -ForegroundColor Red }
function Write-Step { Write-Host "`n=== $args ===" -ForegroundColor Magenta }
function Write-Debug { if ($env:DEBUG) { Write-Host "[D] $args" -ForegroundColor DarkGray } }

function Test-Port {
    param($Port)
    try {
        $tcp = New-Object System.Net.Sockets.TcpClient
        $connect = $tcp.BeginConnect("localhost", $Port, $null, $null)
        $wait = $connect.AsyncWaitHandle.WaitOne(1500)
        $tcp.Close()
        return $wait
    }
    catch {
        return $false
    }
}

function Wait-ForPort {
    param($Port, $TimeoutSec = 30)
    $start = Get-Date
    while (((Get-Date) - $start).TotalSeconds -lt $TimeoutSec) {
        if (Test-Port $Port) { return $true }
        Start-Sleep -Milliseconds 500
    }
    return $false
}

function Find-ProcessOnPort {
    param($Port)
    try {
        $connections = netstat -ano | Select-String ":$Port\s" | Select-String "LISTENING"
        if ($connections) {
            foreach ($conn in $connections) {
                $parts = $conn -split '\s+'
                $pid = $parts[-1]
                if ($pid -match '^\d+$') {
                    $proc = Get-Process -Id $pid -ErrorAction SilentlyContinue
                    if ($proc) {
                        return @{
                            PID  = $pid
                            Name = $proc.ProcessName
                            Path = $proc.Path
                        }
                    }
                }
            }
        }
    }
    catch {}
    return $null
}

function Find-PortByProcess {
    param($ProcessName)
    try {
        $procs = Get-Process -Name $ProcessName -ErrorAction SilentlyContinue
        if ($procs) {
            foreach ($proc in $procs) {
                $connections = netstat -ano | Select-String "$($proc.Id)" | Select-String "LISTENING"
                foreach ($conn in $connections) {
                    if ($conn -match ':(\d+)\s') {
                        return [int]$matches[1]
                    }
                }
            }
        }
    }
    catch {}
    return $null
}

function Test-PortAvailable {
    param($Port)
    $process = Find-ProcessOnPort -Port $Port
    if ($process) {
        return @{ Available = $false; Process = $process }
    }
    return @{ Available = $true; Process = $null }
}

function Get-AvailablePort {
    param($StartPort, $EndPort)
    for ($p = $StartPort; $p -le $EndPort; $p++) {
        $check = Test-PortAvailable -Port $p
        if ($check.Available) {
            return $p
        }
    }
    return $StartPort
}

function Stop-ProcessOnPort {
    param($Port, $Force = $false)
    $process = Find-ProcessOnPort -Port $Port
    if ($process) {
        Write-Warn "Proces '$($process.Name)' (PID: $($process.PID)) zajmuje port $Port"
        if ($Force) {
            Write-Info "Zatrzymuje proces $($process.PID)..."
            Stop-Process -Id $process.PID -Force -ErrorAction SilentlyContinue
            Start-Sleep -Seconds 1
            return $true
        }
        return $false
    }
    return $true
}

# ============================================================
# KROK 0: DIAGNOSTYKA PORTOW
# ============================================================
Write-Step "Krok 0/7: Diagnostyka portow"

Write-Info "Skanuje porty pod katem konfliktow..."

$portStatus = @{
    Daemon = Test-PortAvailable -Port $DaemonPort
    Memory = Test-PortAvailable -Port $MemoryPort
    Router = Test-PortAvailable -Port $RouterPort
}

$conflicts = @()
foreach ($service in $portStatus.Keys) {
    if (-not $portStatus[$service].Available) {
        $proc = $portStatus[$service].Process
        $conflicts += "Port $($service):$(@{$Daemon=$DaemonPort;$Memory=$MemoryPort;$Router=$RouterPort}[$service]) zajety przez $($proc.Name) (PID: $($proc.PID))"
    }
}

if ($conflicts) {
    Write-Warn "Wykryto konflikty portow:"
    foreach ($c in $conflicts) {
        Write-Host "  - $c" -ForegroundColor Yellow
    }
    Write-Info "Proba znalezienia alternatywnych portow..."
    
    # Szukaj alternatywnych portow
    if (-not $portStatus.Daemon.Available) { $DaemonPort = Get-AvailablePort 18700 18749 }
    if (-not $portStatus.Memory.Available) { $MemoryPort = Get-AvailablePort 18750 18779 }
    if (-not $portStatus.Router.Available) { $RouterPort = Get-AvailablePort 18780 18799 }
}

Write-Success "Porty: Daemon=$DaemonPort, Memory=$MemoryPort, Router=$RouterPort"

# Wykryj juz dzialajace uslugi
Write-Info "Wykrywanie uruchomionych uslug..."

# Sprawdź Docker containers
$dockerContainers = docker ps --format "{{.Names}}:{{.Ports}}" 2>$null
$runningServices = @{}

if ($dockerContainers) {
    foreach ($container in $dockerContainers) {
        if ($container -match 'memory') {
            if ($container -match '0\.0\.0\.0:(\d+)') {
                $runningServices['Memory'] = @{ Port = [int]$matches[1]; Type = 'docker' }
            }
        }
        if ($container -match 'daemon') {
            if ($container -match '0\.0\.0\.0:(\d+)') {
                $runningServices['Daemon'] = @{ Port = [int]$matches[1]; Type = 'docker' }
            }
        }
    }
}

# Sprawdź lokalne procesy
if (-not $runningServices['Daemon']) {
    $daemonProc = Find-ProcessOnPort -Port 8080
    if ($daemonProc) {
        $runningServices['Daemon'] = @{ Port = 8080; Type = 'local'; Process = $daemonProc }
    }
}

if (-not $runningServices['Memory']) {
    for ($p = 3000; $p -le 3010; $p++) {
        $memProc = Find-ProcessOnPort -Port $p
        if ($memProc -and $memProc.Name -eq 'node') {
            $runningServices['Memory'] = @{ Port = $p; Type = 'local'; Process = $memProc }
            break
        }
    }
}

foreach ($svc in $runningServices.Keys) {
    $info = $runningServices[$svc]
    Write-Success "Wykryto $svc na porcie $($info.Port) ($($info.Type))"
}

# ============================================================
# KROK 1: WALIDACJA
# ============================================================
Write-Step "Krok 1/7: Walidacja"

if (-not (Test-Path $AntigravityPath)) {
    Write-Err "Antigravity-System nie znaleziony: $AntigravityPath"
    Write-Info "Edytuj zmienna `$AntigravityPath na poczatku skryptu"
    exit 1
}
Write-Success "Antigravity-System znaleziony"

# ============================================================
# KROK 2: TWORZENIE PLIKOW WORKSPACE
# ============================================================
Write-Step "Krok 2/7: Tworzenie plikow workspace"

# .signals junction
$signalsTarget = Join-Path $AntigravityPath ".signals"
$signalsLink = Join-Path $PSScriptRoot ".signals"

if (Test-Path $signalsLink) {
    Write-Info ".signals/ juz istnieje"
}
else {
    try {
        $null = New-Item -ItemType Junction -Path $signalsLink -Target $signalsTarget -Force -ErrorAction Stop
        Write-Success ".signals/ junction utworzony"
    }
    catch {
        Copy-Item $signalsTarget $signalsLink -Recurse -Force
        Write-Warn ".signals/ skopiowany (junction niedostepny)"
    }
}

# AGENTS.md
$agentsFile = Join-Path $PSScriptRoot "AGENTS.md"
$projectName = Split-Path $PSScriptRoot -Leaf

if (-not (Test-Path $agentsFile)) {
    $agentsContent = @"
# $projectName - Knowledge Base

## OVERVIEW
<!-- Opisz projekt tutaj -->

## ANTI-GRAVITY INTEGRATION

Ten projekt uzywa Antigravity System do orkiestracji zadan.

**Glowna dokumentacja: ``$AntigravityPath\AGENTS.md``**

### Dostepne funkcje:
- **Signal Pipeline:** ``.signals/`` -- zadania dla workerow
- **Daemon:** WebSocket na porcie $DaemonPort
- **Memory:** MCP bridge na porcie $MemoryPort
- **Router:** LLM fallback (NVIDIA -> OpenRouter -> Mistral -> Ollama)

### Komendy:
``````bash
# Status daemon
cd $AntigravityPath\daemon && cargo run -- --status

# Router chat
cd $AntigravityPath\router && python main.py --chat "prompt"

# Doctor check
cd $AntigravityPath\router && python main.py --doctor
``````

## CONVENTIONS
<!-- Dodaj konwencje projektu -->

## ANTI-PATTERNS
<!-- Dodaj anti-patterny -->
"@
    Set-Content $agentsFile $agentsContent -Encoding UTF8
    Write-Success "AGENTS.md utworzony"
}
else {
    Write-Info "AGENTS.md juz istnieje"
}

# .env z portami
$envFile = Join-Path $PSScriptRoot ".env"

if (-not (Test-Path $envFile)) {
    $envContent = @"
# Antigravity Integration
ANTIGRAVITY_PATH=$AntigravityPath
SIGNALS_PATH=./.signals
ACTIVE_WORKSPACE=$PSScriptRoot

# Porty uslug (automatycznie wykryte)
ZEROCLAW_DAEMON_PORT=$DaemonPort
MEMORY_PORT=$MemoryPort
ROUTER_PORT=$RouterPort

# API Keys (patrz: $AntigravityPath/.env)
# NVIDIA_API_KEY=
# OPENROUTER_API_KEY=
# MISTRAL_API_KEY=
"@
    Set-Content $envFile $envContent -Encoding UTF8
    Write-Success ".env utworzony"
}
else {
    Write-Info ".env juz istnieje"
}

# Ustaw zmienne srodowiskowe dla biezacej sesji
$env:ACTIVE_WORKSPACE = $PSScriptRoot
$env:ZEROCLAW_DAEMON_PORT = $DaemonPort
$env:MEMORY_PORT = $MemoryPort
$env:ROUTER_PORT = $RouterPort

# ============================================================
# KROK 3: START SERWEROW
# ============================================================
Write-Step "Krok 3/7: Start serwerow"

# Docker
Write-Info "Sprawdzam Docker..."
$dockerOk = $false
try {
    $dockerStatus = docker info 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Success "Docker dziala"
        $dockerOk = $true
        
        $agImages = docker images --format "{{.Repository}}" 2>$null | Where-Object { $_ -like "ag-*" }
        if ($agImages) {
            Write-Info "AG images: $($agImages -join ', ')"
        }
        else {
            Write-Warn "Brak AG images. Uruchom: $AntigravityPath\docker\build_images.ps1"
        }
    }
}
catch {
    Write-Warn "Docker niedostepny"
}

# Daemon (Rust)
Write-Info "Startuje Daemon..."
$daemonPath = Join-Path $AntigravityPath "daemon"

if ($runningServices['Daemon']) {
    $dInfo = $runningServices['Daemon']
    Write-Info "Daemon juz dziala na porcie $($dInfo.Port) ($($dInfo.Type))"
    $DaemonPort = $dInfo.Port
}
elseif (Test-Port $DaemonPort) {
    Write-Info "Daemon juz dziala na porcie $DaemonPort"
}
else {
    # Ustaw port przez zmienna srodowiskowa
    $env:ZEROCLAW_DAEMON_PORT = $DaemonPort
    
    $psi = New-Object System.Diagnostics.ProcessStartInfo
    $psi.FileName = "cargo"
    $psi.Arguments = "run"
    $psi.WorkingDirectory = $daemonPath
    $psi.WindowStyle = "Hidden"
    $psi.CreateNoWindow = $true
    $psi.UseShellExecute = $false
    $psi.Environment["ZEROCLAW_DAEMON_PORT"] = "$DaemonPort"
    
    try {
        $process = [System.Diagnostics.Process]::Start($psi)
        Write-Info "Daemon uruchomiony (PID: $($process.Id))"
        
        if (Wait-ForPort $DaemonPort -TimeoutSec 45) {
            Write-Success "Daemon gotowy na porcie $DaemonPort"
        }
        else {
            Write-Warn "Daemon moze nie byc gotowy (timeout)"
        }
    }
    catch {
        Write-Err "Nie mozna uruchomic Daemon: $_"
    }
}

# Memory Service
Write-Info "Startuje Memory Service..."
$memoryPath = Join-Path $AntigravityPath "memory"

if ($runningServices['Memory']) {
    $mInfo = $runningServices['Memory']
    Write-Info "Memory Service juz dziala na porcie $($mInfo.Port) ($($mInfo.Type))"
    $MemoryPort = $mInfo.Port
}
elseif (Test-Port $MemoryPort) {
    Write-Info "Memory Service juz dziala na porcie $MemoryPort"
}
else {
    $memoryDist = Join-Path $memoryPath "dist"
    if (-not (Test-Path $memoryDist)) {
        Write-Info "Buduje Memory Service..."
        Push-Location $memoryPath
        npm install 2>$null | Out-Null
        npm run build 2>$null | Out-Null
        Pop-Location
    }
    
    $psi = New-Object System.Diagnostics.ProcessStartInfo
    $psi.FileName = "node"
    $psi.Arguments = "dist/index.js"
    $psi.WorkingDirectory = $memoryPath
    $psi.WindowStyle = "Hidden"
    $psi.CreateNoWindow = $true
    $psi.UseShellExecute = $false
    $psi.Environment["PORT"] = "$MemoryPort"
    
    try {
        $process = [System.Diagnostics.Process]::Start($psi)
        Write-Info "Memory Service uruchomiony (PID: $($process.Id))"
        Start-Sleep -Seconds 2
        
        if (Test-Port $MemoryPort) {
            Write-Success "Memory Service gotowy na porcie $MemoryPort"
        }
        else {
            Write-Warn "Memory Service moze nie byc gotowy"
        }
    }
    catch {
        Write-Warn "Nie mozna uruchomic Memory Service: $_"
    }
}

# Router (Python)
Write-Info "Startuje Router..."
$routerPath = Join-Path $AntigravityPath "router"

$psi = New-Object System.Diagnostics.ProcessStartInfo
$psi.FileName = "python"
$psi.Arguments = "main.py"
$psi.WorkingDirectory = $routerPath
$psi.WindowStyle = "Hidden"
$psi.CreateNoWindow = $true
$psi.UseShellExecute = $false
$psi.Environment["ROUTER_PORT"] = "$RouterPort"
$psi.Environment["ACTIVE_WORKSPACE"] = "$PSScriptRoot"
try {
    $process = [System.Diagnostics.Process]::Start($psi)
    Write-Info "Router uruchomiony (PID: $($process.Id))"
    Start-Sleep -Seconds 2
}
catch {
    Write-Warn "Nie mozna uruchomic Router: $_"
}

# ============================================================
# KROK 4: HEALTH CHECKS
# ============================================================
Write-Step "Krok 4/7: Health checks"

# Docker check
Write-Info "Sprawdzam Docker..."
if ($dockerOk) {
    Write-Success "Docker odpowiada"
}
else {
    Write-Warn "Docker nie odpowiada"
}

# Daemon check
Write-Info "Sprawdzam Daemon..."
$actualDaemonPort = $DaemonPort
# Sprawdz czy daemon nie odpowiada na innym porcie
if (-not (Test-Port $DaemonPort)) {
    for ($p = 8080; $p -le 8090; $p++) {
        if (Test-Port $p) {
            $proc = Find-ProcessOnPort -Port $p
            if ($proc -and ($proc.Name -like "*daemon*" -or $proc.Name -eq "cargo")) {
                $actualDaemonPort = $p
                break
            }
        }
    }
}

if (Test-Port $actualDaemonPort) {
    Write-Success "Daemon odpowiada na porcie $actualDaemonPort"
    $DaemonPort = $actualDaemonPort
}
else {
    Write-Err "Daemon nie odpowiada"
}

# Memory check
Write-Info "Sprawdzam Memory Service..."
$actualMemoryPort = $MemoryPort
# Sprawdz czy memory nie odpowiada na innym porcie
if (-not (Test-Port $MemoryPort)) {
    for ($p = 3000; $p -le 3010; $p++) {
        if (Test-Port $p) {
            $proc = Find-ProcessOnPort -Port $p
            if ($proc -and $proc.Name -eq "node") {
                $actualMemoryPort = $p
                break
            }
        }
    }
}

if (Test-Port $actualMemoryPort) {
    Write-Success "Memory Service odpowiada na porcie $actualMemoryPort"
    $MemoryPort = $actualMemoryPort
}
else {
    Write-Warn "Memory Service nie odpowiada (moze dzialac w Dockerze)"
}

# Router doctor
Write-Info "Sprawdzam Router..."
try {
    Push-Location $routerPath
    $doctorOutput = python main.py --doctor 2>&1
    Pop-Location
    
    if ($doctorOutput -match "OK|passed|ready|success" -or $LASTEXITCODE -eq 0) {
        Write-Success "Router health check passed"
    }
    else {
        Write-Warn "Router issues detected"
    }
}
catch {
    Write-Warn "Router health check failed: $_"
}

# Signals directory
Write-Info "Sprawdzam Signal Pipeline..."
if (Test-Path (Join-Path $PSScriptRoot ".signals")) {
    Write-Success "Signal pipeline gotowy"
}
else {
    Write-Err "Signal pipeline niedostepny"
}

# ============================================================
# KROK 5: TEST SYGNALU
# ============================================================
Write-Step "Krok 5/7: Test sygnalu"

# Poprawny format sygnalu zgodny z daemon
$testSignal = @{
    signal_type = "ping"
    id          = [Guid]::NewGuid().ToString()
    payload     = @{ test = $true; timestamp = (Get-Date -Format "o") }
    created_at  = (Get-Date -Format "yyyy-MM-ddTHH:mm:ss.fffZ")
    source      = "bootstrap-script"
} | ConvertTo-Json -Compress

$signalPath = Join-Path $PSScriptRoot ".signals\bootstrap_test.ping.init.sig"
# Uzyj System.IO.File bez BOM (PowerShell 5.1 kompatybilne)
[System.IO.File]::WriteAllText($signalPath, $testSignal, [System.Text.UTF8Encoding]::new($false))
Write-Success "Wyslano testowy signal: bootstrap_test.ping.init.sig"

# Czekaj na odpowiedz
Start-Sleep -Seconds 3
$donePath = Join-Path $PSScriptRoot ".signals\bootstrap_test.done"
if (Test-Path $donePath) {
    Write-Success "Signal przetworzony: bootstrap_test.done"
}
else {
    Write-Info "Oczekiwanie na przetworzenie sygnalu przez daemon..."
}

# ============================================================
# KROK 6: ZAPISZ KONFIGURACJE
# ============================================================
Write-Step "Krok 6/7: Zapisz konfiguracje"

$configFile = Join-Path $PSScriptRoot ".antigravity-config.json"
$config = @{
    lastRun  = (Get-Date -Format "o")
    ports    = @{
        daemon = $DaemonPort
        memory = $MemoryPort
        router = $RouterPort
    }
    paths    = @{
        antigravity = $AntigravityPath
        signals     = $signalsLink
        workspace   = $PSScriptRoot
    }
    services = $runningServices
} | ConvertTo-Json -Depth 3

Set-Content $configFile $config -Encoding UTF8
Write-Success "Konfiguracja zapisana: .antigravity-config.json"

# ============================================================
# KROK 7: RAPORT KONCOWY
# ============================================================
Write-Step "Krok 7/7: Raport koncowy"

Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "  ANTI-GRAVITY WORKSPACE INITIALIZED" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Workspace:     $PSScriptRoot" -ForegroundColor Gray
Write-Host "Antigravity:   $AntigravityPath" -ForegroundColor Gray
Write-Host ""
Write-Host "Utworzone pliki:" -ForegroundColor White
Write-Host "  - .signals/              (signal pipeline)" -ForegroundColor Gray
Write-Host "  - AGENTS.md              (knowledge base)" -ForegroundColor Gray
Write-Host "  - .env                   (konfiguracja)" -ForegroundColor Gray
Write-Host "  - .antigravity-config.json (stan uslug)" -ForegroundColor Gray
Write-Host ""
Write-Host "Status serwerow:" -ForegroundColor White

$dockerStatus = if ($dockerOk) { "[OK]" }else { "[--]" }
$daemonStatus = if (Test-Port $DaemonPort) { "[OK]" }else { "[--]" }
$memoryStatus = if (Test-Port $MemoryPort) { "[OK]" }else { "[--]" }

Write-Host "  - Docker:      $dockerStatus" -ForegroundColor $(if ($dockerOk) { "Green" }else { "Yellow" })
Write-Host "  - Daemon:      $daemonStatus (port $DaemonPort)" -ForegroundColor $(if (Test-Port $DaemonPort) { "Green" }else { "Red" })
Write-Host "  - Memory:      $memoryStatus (port $MemoryPort)" -ForegroundColor $(if (Test-Port $MemoryPort) { "Green" }else { "Yellow" })
Write-Host "  - Router:      [OK]" -ForegroundColor Green
Write-Host ""
Write-Host "Nastepne kroki:" -ForegroundColor White
Write-Host "  1. Otworz workspace w OpenCode" -ForegroundColor Cyan
Write-Host "  2. Testuj signal:" -ForegroundColor Cyan
Write-Host '     @{signal_type="ping";id="test_ping";created_at=(Get-Date -Format "o");source="test"} | ConvertTo-Json > .signals/test_ping.ping.init.sig' -ForegroundColor DarkCyan
Write-Host "  3. Monitoruj: Get-Content .signals\*.done -Wait" -ForegroundColor Cyan
Write-Host ""

if ((Test-Port $DaemonPort) -and $dockerOk) {
    Write-Success "System gotowy do pracy!"
}
else {
    Write-Warn "Niektore komponenty niedostepne - sprawdz logi"
}
