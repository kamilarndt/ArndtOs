# Uzyskujemy oficjalny binarny plik ZeroClaw
FROM ghcr.io/zeroclaw-labs/zeroclaw:v0.1.7 as official

# Budujemy środowisko uruchomieniowe z pełnym wsparciem dla Node.js i przeglądarek (Ubuntu 24.04 dla GLIBC 2.39)
FROM ubuntu:24.04

# Instalacja Node.js, npm oraz zależności systemowych dla Chromium/Playwright
RUN apt-get update && apt-get install -y \
    ca-certificates \
    curl \
    wget \
    gnupg \
    procps \
    git \
    libnss3 \
    libatk-bridge2.0-0 \
    libcups2 \
    libdrm2 \
    libxkbcommon0 \
    libxcomposite1 \
    libxdamage1 \
    libxext6 \
    libxfixes3 \
    libxrandr2 \
    libgbm1 \
    libasound2t64 \
    libpango-1.0-0 \
    libpangocairo-1.0-0 \
    libgtk-3-0 \
    && curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /workspace

# Kopiujemy oficjalną binarkę
COPY --from=official /usr/local/bin/zeroclaw /usr/bin/zeroclaw

# Ustawiamy uprawnienia i środowisko
ENV ZEROCLAW_WORKSPACE=/workspace
ENV HOME=/zeroclaw-data
RUN mkdir -p /zeroclaw-data/.claude && chmod 777 /zeroclaw-data
WORKDIR /workspace

EXPOSE 8080

ENTRYPOINT ["zeroclaw"]
# Domyślny start bota (kanał Telegram)
CMD ["channel", "start"]
