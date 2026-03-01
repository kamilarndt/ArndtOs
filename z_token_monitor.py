import os
import sys
import time
import requests
import logging
from urllib.parse import urlparse

# Konfiguracja logowania
logging.basicConfig(level=logging.INFO, format='%(asctime)s - Z.AI Monitor - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Proste parsowanie pliku .env jeśli istnieje
env_path = os.path.join(os.path.dirname(__file__), ".env")
if os.path.exists(env_path):
    with open(env_path, "r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith("#") and "=" in line:
                key, val = line.split("=", 1)
                os.environ.setdefault(key.strip(), val.strip())

# Konfiguracja API
ZAI_API_KEY = os.environ.get("PROVIDER_API_KEY")
if not ZAI_API_KEY:
    ZAI_API_KEY = os.environ.get("OPENAI_API_KEY")

if not ZAI_API_KEY:
    logger.error("Nie znaleziono zmiennej PROVIDER_API_KEY ani OPENAI_API_KEY.")
    sys.exit(1)

from datetime import datetime, timedelta

# Endpoint odzyskany z oficjalnego pluginu Z.AI
BASE_URL = "https://api.z.ai/api/monitor/usage/quota/limit"
FREEZE_THRESHOLD_PERCENT = 85.0

def fetch_quota_usage():
    try:
        now = datetime.now()
        start_date = now - timedelta(days=1)
        
        # Z formatu: yyyy-MM-dd HH:mm:ss
        start_time_str = start_date.strftime("%Y-%m-%d %H:00:00")
        end_time_str = now.strftime("%Y-%m-%d %H:59:59")
        
        headers = {
            "Authorization": ZAI_API_KEY,
            "Accept-Language": "en-US,en",
            "Content-Type": "application/json"
        }
        
        params = {
            "startTime": start_time_str,
            "endTime": end_time_str
        }
        
        response = requests.get(BASE_URL, headers=headers, params=params, timeout=10)
        
        if response.status_code != 200:
            logger.error(f"Błąd API: {response.status_code} - {response.text}")
            return None
            
        data = response.json().get("data", {})
        limits = data.get("limits", [])
        
        for item in limits:
            if item.get("type") == "TOKENS_LIMIT":
                return item.get("percentage")
                
        logger.warning("Nie znaleziono sekcji TOKENS_LIMIT w odpowiedzi. Czy klucz jest poprawny / czy konto obsługuje ten plan?")
        return None
        
    except Exception as e:
        logger.error(f"Błąd podczas połączenia z Z.AI: {e}")
        return None

def freeze_container():
    logger.critical(">>> PRZEKROCZONO ZADANY LIMIT ZUŻYCIA Z.AI <<<")
    logger.critical("Inicjowanie awaryjnego zablokowania przepalania tokenów. Wstrzymywanie (pause) kontenera: zeroclaw-runtime")
    # Zamrożenie kontenera żeby agent nie mógł dalej wysyłać requestów, a Docker zachował stan
    exit_code = os.system("docker compose pause zeroclaw-runtime")
    if exit_code == 0:
        logger.info("Sukces: Środowisko ZeroClaw zostało zamrożone. Proszę zweryfikować koszty i w razie potrzeby wywołać 'docker compose unpause'.")
    else:
        logger.error(f"Nie udało się automatycznie zamrozić kontenera. Exit code: {exit_code}")
    sys.exit(0)

def main():
    logger.info("Uruchamianie Strażnika Zużycia Tokenów Z.AI...")
    logger.info(f"Limit bezpieczeństwa: {FREEZE_THRESHOLD_PERCENT}%")
    
    while True:
        percentage = fetch_quota_usage()
        
        if percentage is not None:
            logger.info(f"Aktualne zużycie tokenów Z.AI (5 Godzinny limit): {percentage:.2f}%")
            
            if percentage >= FREEZE_THRESHOLD_PERCENT:
                freeze_container()
                
        # Sprawdzanie co 10 minut
        time.sleep(600)

if __name__ == "__main__":
    main()
