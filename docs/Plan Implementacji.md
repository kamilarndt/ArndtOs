# **PLAN.md: Wdrożenie ZeroClaw OS Dashboard (MVP)**

**DYREKTYWA DLA AGENTA (ANTIGRAVITY/OPENCODE):**

Czytasz ten plik jako ostateczny dokument wykonawczy. Twoim celem jest zbudowanie poniższego systemu na bazie istniejącego repozytorium.

**ZASADA KRYTYCZNA:** Obowiązuje absolutne TDD. Zanim zadeklarujesz, że "moduł jest gotowy", musisz napisać i uruchomić z sukcesem zautomatyzowany test (np. Vitest / Pytest). Nie wolno Ci generować obrazków (mocków graficznych) jako dowodów ukończenia pracy. Pokaż logi z konsoli.

## **Faza 1: Rdzeń Dashboardu (The Shell) i Mini-Sandbox**

1. Zrefaktoryzuj istniejącą aplikację w web-ui (Next.js), aby obsługiwała dynamiczne rejestrowanie komponentów (wtyczek) z katalogu web-ui/src/plugins. Zabezpiecz wtyczki używając React Error Boundaries, aby błąd wtyczki nie wysadził całego dashboardu.  
2. Stwórz skrypt pomocniczy scripts/create\_sandbox.sh, który wygeneruje odizolowane środowisko deweloperskie dla przyszłych wtyczek (dziedziczące style z głównego projektu, ale działające niezależnie).  
3. Podłącz globalny stan Zustand (uiStore, agentStore), przygotowany na przyjmowanie danych z WebSockets. Dodaj middleware persist, aby zapobiec utracie stanu przy odświeżeniu okna przeglądarki.

## **Faza 2: Podpięcie ZeroClaw (The Brain) i Bezpieczeństwo Transportu**

1. W module daemon/src/web\_server.rs (Rust) uruchom nasłuchiwanie WebSocket na dedykowanym porcie.  
2. Dodaj autoryzację do połączenia WebSocket (weryfikacja tokenu JWT podczas handshake'u) oraz prosty Rate Limiting, aby chronić system przed atakami.  
3. W web-ui/src/services/daemonService.ts zaimplementuj klienta WebSocket z obsługą wstrzykiwania tokenu JWT, który łączy się z demonem ZeroClaw.  
4. Utwórz prosty test E2E (Ping-Pong): wpisanie "hello" w UI wysyła sygnał przez WS, a demon Rust weryfikuje token, odsyła "pong", co aktualizuje stan w Zustand i wyświetla powiadomienie na ekranie.

## **Faza 3: Skonfigurowanie OpenClaw, Pamięci i Stabilności Systemu**

1. Upewnij się, że serwer MCP dla pamięci (Node.js, katalog memory/) działa poprawnie i jest podpięty pod demona Rust.  
2. Stwórz pliki konfiguracyjne dla usługi systemd (np. zeroclaw.service i zeroclaw-memory.service) z dyrektywą Restart=always, aby kluczowe backendy uruchamiały się same po awarii i starcie systemu.  
3. Zdefiniuj główny "Soul" (charakter/system prompt) orkiestratora w .config/openclaw/soul.yaml, nakazujący mu bezwzględne trzymanie się zasad TDD i ścisłą współpracę z Docker MCP.  
4. Zintegruj narzędzia kontroli Dockera (uruchamianie ag-opencode-worker.Dockerfile) za pośrednictwem serwera MCP. Skonfiguruj sieć Tailscale z polityką ACL deny-by-default, otwierając jedynie porty niezbędne dla EC2.

## **Faza 4: Spięcie z Telegramem (Czerwony Telefon) i Obserwowalność**

1. Zintegruj API bota Telegram (z wykorzystaniem np. teloxide w Rust wew. daemon/ lub skryptu Pythonowego jako nowej usługi w router/).  
2. Ustaw weryfikację ID użytkownika, aby tylko zatwierdzone konto mogło wydawać polecenia.  
3. Zaimplementuj ustrukturyzowane logowanie w formacie JSON (audit.log) do logowania każdego wykonanego polecenia i połączenia.  
4. Przetestuj działanie: odbiór wiadomości z Telegrama musi móc wywołać funkcję generującą logi w demonie ZeroClaw, całkowicie omijając Next.js (web-ui).

## **Faza 5: Pełna Integracja TLDraw (Najwyższy Priorytet MVP)**

1. W wygenerowanym wcześniej Mini-Sandboxie stwórz nową wtyczkę: web-ui/src/plugins/tldraw-canvas.  
2. Zainstaluj @tldraw/tldraw w web-ui i zaimportuj gotowe szablony (agent, chat).  
3. Wepnij komponent płótna na pełny ekran.  
4. Zbuduj most w usługach frontendu: gdy demon Rust (ZeroClaw) wyśle po WebSocket event z ustrukturyzowanym poleceniem modyfikacji (Create/Update/Delete dla kształtów i połączeń), aplikacja musi nanieść te zmiany wprost do edytora TLDraw.  
5. Napisz test weryfikujący parsowanie przykładowego polecenia od agenta na struktury zrozumiałe dla funkcji rysujących w TLDraw.