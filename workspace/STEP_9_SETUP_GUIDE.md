# Krok 9: Ożywienie Konsoli i Wykresy - Instrukcja Instalacji

## ETAP 1: Instalacja Recharts

Przejdź do katalogu workspace i zainstaluj bibliotekę recharts:

```bash
cd workspace
npm install recharts
```

## ETAP 2: Aktualizacja plików

### 1. Aktualizuj `workspace/src/store/systemStore.ts`

Zastąp całą zawartość pliku `systemStore.ts` treścią z pliku `systemStore.ts`

### 2. Aktualizuj `workspace/src/lib/websocket.ts`

Zastąp całą zawartość pliku `websocket.ts` treścią z pliku `websocket.ts`

### 3. Utwórz katalog `workspace/src/modules/console/` i dodaj plik `index.tsx`

```bash
mkdir -p workspace/src/modules/console
cp console_module.tsx workspace/src/modules/console/index.tsx
```

### 4. Utwórz katalog `workspace/src/modules/dashboard/` i dodaj plik `index.tsx`

```bash
mkdir -p workspace/src/modules/dashboard
cp dashboard_module.tsx workspace/src/modules/dashboard/index.tsx
```

### 5. Aktualizuj `workspace/src/App.tsx`

Zastąp całą zawartość pliku `App.tsx` treścią z pliku `App.tsx`

### 6. Utwórz plik `workspace/src/modules.json`

```bash
cp modules.json workspace/src/modules.json
```

## ETAP 3: Uruchomienie aplikacji

```bash
cd workspace
npm run dev
```

## Co zostało zaimplementowane:

### ETAP 1: Odbiór Wiadomości w Konsoli Agenta

1. **Stan czatu w systemStore.ts:**
   - Dodano interfejs `ChatMessage` z polami: id, sender, text, timestamp
   - Dodano tablicę `chatMessages` do przechowywania wiadomości
   - Dodano akcję `addChatMessage(msg)` do dodawania nowych wiadomości
   - Dodano akcję `clearChatMessages()` do czyszczenia historii czatu

2. **Obsługa WebSocket w websocket.ts:**
   - Dodano obsługę typu `chat_response` w metodzie `handleMessage()`
   - Przy otrzymaniu odpowiedzi agenta, automatycznie dodawana jest wiadomość do stanu czatu

3. **Moduł Konsoli (console/index.tsx):**
   - Interfejs czatu z dymkami wiadomości
   - Wiadomości użytkownika: zielone tło, po prawej stronie
   - Wiadomości agenta: ciemnoszare tło, po lewej stronie z ikoną robota
   - Pole tekstowe do wpisywania wiadomości
   - Automatyczne scrollowanie do nowej wiadomości
   - Obsługa klawisza Enter do wysyłania

### ETAP 2: Dashboard i Recharts (Analityka)

1. **Stan metryk w systemStore.ts:**
   - Dodano interfejs `MetricEntry` z polami: timestamp, cpu, ram
   - Dodano obiekt `metrics` z polami: cpu, ram, uptime
   - Dodano tablicę `metricsHistory` (zachowuje 20 ostatnich odczytów)
   - Dodano akcję `updateMetrics(metrics)` do aktualizacji metryk i historii

2. **Moduł Dashboard (dashboard/index.tsx):**
   - Karta statystyk CPU z ikoną
   - Karta statystyk RAM z ikoną
   - Karta statystyk Uptime z ikoną
   - Wykres liniowy (LineChart) pokazujący historię zużycia CPU i RAM
   - Responsywny wykres z legendą, tooltipami i osiami
   - Sekcja informacji o systemie

3. **modules.json:**
   - Konfiguracja wszystkich modułów
   - ID: 'dashboard', ścieżka: '/', nazwa: 'Dashboard Główny', ikona: 'LayoutDashboard'
   - ID: 'console', ścieżka: '/console', nazwa: 'Konsola Agenta', ikona: 'Terminal'

4. **App.tsx:**
   - Zaktualizowano menu boczne z ikonami (lucide-react)
   - Dodano obsługę nowych modułów: dashboard i console
   - Renderowanie odpowiedniego komponentu dla aktywnego modułu

## Jak to działa:

### Konwersacja z Agentem:

1. Użytkownik wpisuje wiadomość w Konsoli Agenta i klika "Wyślij"
2. Wiadomość jest dodana do tablicy `chatMessages` jako wiadomość użytkownika
3. Wiadomość jest wysyłana przez WebSocket do Gateway w formacie: `{"type": "chat", "text": "..."}`
4. Gateway przekazuje wiadomość do rdzenia Rust
5. Rdzeń Rust przetwarza wiadomość i generuje odpowiedź
6. Odpowiedź jest wysyłana przez WebSocket w formacie: `{"type": "chat_response", "text": "..."}`
7. Frontend automatycznie dodaje odpowiedź do tablicy `chatMessages` jako wiadomość agenta
8. Konsola automatycznie scrolluje do nowej wiadomości

### Analityka:

1. Agent okresowo wysyła aktualizacje metryk przez WebSocket
2. Format: `{"type": "metrics_update", "metrics": {"cpu": 12.5, "ram": 128, "uptime": "0d 0h 0m"}}`
3. Każda aktualizacja jest dodana do tablicy `metricsHistory` (maks. 20 wpisów)
4. Dashboard wyświetla aktualne wartości i wykres historyczny
5. Wykres pokazuje zmiany zużycia CPU i RAM w czasie

## Struktura plików:

```
workspace/
├── src/
│   ├── store/
│   │   └── systemStore.ts          # Zaktualizowany z czatem i metrykami
│   ├── lib/
│   │   └── websocket.ts            # Zaktualizowany z chat_response
│   ├── modules/
│   │   ├── status/
│   │   │   └── index.tsx           # Istniejący moduł statusu
│   │   ├── console/
│   │   │   └── index.tsx           # Nowy moduł konsoli czatu
│   │   └── dashboard/
│   │       └── index.tsx           # Nowy moduł dashboardu z wykresami
│   ├── modules.json                # Nowy plik konfiguracji modułów
│   └── App.tsx                     # Zaktualizowany z menu bocznym
└── package.json                    # Zaktualizowany z recharts
```

## Uwagi:

- Biblioteka `recharts` musi zostać zainstalowana przed uruchomieniem aplikacji
- Ikony są używane z pakietu `lucide-react`
- Wszystkie komponenty używają Tailwind CSS dla stylizacji
- WebSocket musi być aktywny, aby czat i analityka działały poprawnie
- Metryki historyczne są symulowane - w przyszłości mogą być pobierane z rzeczywistego backendu
