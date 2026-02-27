# **Product Requirements Document (PRD): ZeroClaw OS Dashboard**

## **1\. Wizja Projektu**

**ZeroClaw OS Dashboard** to modularny interfejs użytkownika ("skorupa" oparta na Next.js/React), pełniący rolę wizualnego systemu operacyjnego dla autonomicznych agentów AI (AntiGravity / OpenCode / ZeroClaw).

Celem produktu jest stworzenie zunifikowanego, wysoce niezawodnego środowiska, które pozwala na zdalne zarządzanie złożonymi procesami programistycznymi, badawczymi i planistycznymi, bez obciążania urządzenia końcowego (np. telefonu lub słabego serwera EC2). System musi bezwzględnie weryfikować pracę agentów poprzez rygorystyczne testy (TDD) oraz być odporny na awarie i ataki z zewnątrz.

## **2\. Cele Główne**

* **Modularność (Plugin-First z Izolacją):** Architektura pozwalająca agentom AI na samodzielne tworzenie, testowanie (Mini-Sandbox) i dodawanie nowych modułów. Awaria pojedynczej wtyczki nie może uszkodzić rdzenia aplikacji (wymagana izolacja np. przez iframe/Error Boundaries).  
* **Split-Brain Execution:** Rozdzielenie lekkiego interfejsu sieciowego (hostowanego na AWS EC2 z 4GB RAM) od ciężkich obliczeń i operacji na plikach (realizowanych na prywatnym, potężnym komputerze PC w trybie 24/7).  
* **Niezawodność Kontroli ("Czerwony Telefon"):** Zapewnienie niezależnego kanału komunikacji z Orkiestratorem (ZeroClaw) poprzez komunikator Telegram, gwarantującego kontrolę nawet podczas całkowitej awarii frontendu.  
* **Wizualizacja Architektury (TLDraw):** Integracja interaktywnego płótna jako podstawowego narzędzia wymiany koncepcji i planowania z agentem.

## **3\. Zakres MVP (Minimum Viable Product) z Hardeningiem**

1. **Rdzeń Dashboardu:** Stabilna aplikacja Next.js z dynamicznym ładowaniem wtyczek, globalnym stanem (Zustand z persystencją) oraz bezpiecznym renderowaniem komponentów.  
2. **Podpięcie ZeroClaw:** Dwukierunkowa komunikacja WebSocket między UI a demonem Rust (ZeroClaw) zabezpieczona tokenami JWT.  
3. **Konfiguracja OpenClaw (Soul & Memory):** Integracja z modułem MCP Memory, konfiguracja ról oraz uruchomienie usług jako niezależnych demonów systemowych (systemd).  
4. **Spięcie z Telegramem i Logowanie:** Konfiguracja "Czerwonego Telefonu" i ustrukturyzowanych logów audytowych dla pełnej obserwowalności.  
5. **Integracja TLDraw:** Wtyczka z szablonami, pozwalająca agentowi na żywo rysować diagramy (poprzez operacje Create/Update/Delete).

## **4\. Żelazne Zasady Agenta (Anti-Hallucination & Security)**

1. **Absolutny TDD:** Agent nie może zadeklarować ukończenia zadania bez zaprezentowania logów z przechodzących testów automatycznych.  
2. **Zakaz wizualnych symulacji:** Agent ma zakaz używania generatorów obrazów do "udowadniania", że interfejs działa.  
3. **Izolacja tworzenia:** Nowe wtyczki powstają wyłącznie w wyizolowanym Mini-Sandboxie.  
4. **Zero Trust:** Domyślna odmowa dostępu w Tailscale ACL. Agenci i procesy zewnętrzne mogą komunikować się tylko po wyraźnie dozwolonych portach.

## **5\. Grupa Docelowa**

* Zaawansowani inżynierowie AI, potrzebujący potężnego, prywatnego i zabezpieczonego środowiska deweloperskiego dostępnego zdalnie z dowolnego urządzenia (Desktop/Mobile).