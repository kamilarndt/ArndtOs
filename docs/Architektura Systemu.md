# **Architektura Systemu: ZeroClaw OS**

## **1\. Topologia Systemu (Model Split-Brain)**

Architektura fizyczna opiera się na rozdziale ról pomiędzy dwa główne środowiska sprzętowe, spięte ze sobą przez prywatną sieć VPN (Tailscale) ze ścisłą polityką ACL.

### **1.1 Węzeł Publiczny (Bramka / AWS EC2 \- 4GB RAM)**

* **Zadanie:** Serwowanie frontendu użytkownikowi (telefon, laptop) i warstwa autoryzacji.  
* **Komponenty:** Nginx przekierowujący ruch (Reverse Proxy) do wirtualnego IP Tailscale węzła roboczego. Chroniony warstwą uwierzytelniania (Basic Auth / OIDC).

### **1.2 Bezpieczny Most (Tailscale VPN)**

* Sieć typu mesh łącząca serwer EC2 z domowym komputerem PC.  
* **Hardening:** Skonfigurowane rygorystyczne listy kontroli dostępu (ACL) typu "Deny-by-default". EC2 posiada dostęp *wyłącznie* do portów HTTP/WebSocket wystawianych przez ZeroClaw. Brak dostępu do SSH z poziomu EC2.

### **1.3 Węzeł Roboczy (Mózg i Mięśnie / Domowy PC 24/7)**

* **Zarządzanie procesami:** Wszystkie usługi krytyczne są zarządzane przez systemd (lub PM2) z dyrektywami auto-restartu i watchdogami, aby zapobiec SPoF (Single Point of Failure).  
* **ZeroClaw Daemon (Rust):** Główny orkiestrator. Utrzymuje serwer WebSocket (chroniony JWT), zarządza procesami, obsługuje ustrukturyzowane logowanie (JSON) i nasłuchuje poleceń z Telegrama.  
* **AntiGravity Router (Python):** Obsługa logiki i delegacja LLM.  
* **MCP Memory (Node.js):** Pamięć krótko/długoterminowa z bazą grafową/wektorową.  
* **Docker MCP / OpenCode Worker:** Zarządza ulotnymi kontenerami do bezpiecznego i izolowanego wykonywania wygenerowanego kodu.

## **2\. Architektura Warstwy UI (web-ui)**

Aplikacja bazuje na dostarczonym repozytorium (Next.js \+ Tailwind \+ Zustand).

### **2.1 Struktura Modułowa (Plugin Pattern z Sandboxem)**

* Interfejs ładuje moduły z katalogu web-ui/src/plugins/.  
* **Izolacja Błędów:** Każdy zewnętrzny komponent otoczony jest przez React Error Boundaries, a docelowo najbardziej złożone moduły ładowane są wewnątrz iframe z odpowiednimi restrykcjami.  
* **Persystencja:** Zustand wykorzystuje middleware persist, aby zachować stan aplikacji w przypadku nagłego odświeżenia strony (np. na urządzeniu mobilnym).

### **2.2 System Komunikacji (Event-Driven)**

* **Czerwony Telefon (Telegram):** ZeroClaw odbiera komendę z API Telegrama \-\> wysyła zlecenie do OpenCode w Dockerze \-\> OpenCode pisze kod i testuje w Sandboxie.  
* **WebSockets / TLDraw:** ZeroClaw przesyła strumień operacji (Create/Update/Delete \- CUD) z koordynatami obiektów. Zamiast nadpisywać cały JSON, modyfikuje wybrane węzły na płótnie w czasie rzeczywistym.