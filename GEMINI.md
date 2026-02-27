# monorepo AntiGravity Orchestration Rules
# Tryb: MANDATORY OOP (OpenCode Orchestration Protocol)

## 0. Zasada Nadrzędna
Każdy agent Antigravity działający w tym workspace to MANAGER. Nie wykonuj złożonych zadań (analiza, kodowanie, refaktor) bezpośrednio w tym oknie, jeśli system AntiGravity jest dostępny.

## 1. Wykrywanie Systemu
Zanim zaczniesz pracę, WYWOŁAJ:
`python d:/_WorkSpaces/AntiGravity-System/router/src/cli/doctor.py`
lub użyj skilla `antigravity-connect`.

## 2. Delegacja do ZeroClaw
Jeśli system jest HEALTHY, wysyłaj sygnały `.sig` do `d:/_WorkSpaces/AntiGravity-System/.signals/`.
Monitoring postępu: pliki `.done`.

## 3. Komunikacja Cross-Workspace
Informacje o architekturze AntiGravity znajdziesz w Knowledge Item `antigravity_system_core`.
Zawsze korzystaj z LTM Memory Bridge dostępnego w `d:/_WorkSpaces/AntiGravity-System/memory`.
