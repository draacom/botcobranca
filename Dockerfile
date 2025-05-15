# Imagem base leve
FROM node:20-slim

# Variáveis de ambiente para Puppeteer/Chromium
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

# Instala dependências básicas e o Chromium
RUN apt-get update && apt-get install -y \
    chromium chromium-driver \
    ca-certificates fonts-liberation libappindicator3-1 libasound2 \
    libatk-bridge2.0-0 libatk1.0-0 libcups2 libdbus-1-3 \
    libgdk-pixbuf2.0-0 libnspr4 libnss3 libx11-xcb1 \
    libxcomposite1 libxdamage1 libxrandr2 xdg-utils wget curl \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# Cria diretório e copia arquivos do projeto
WORKDIR /app
COPY . .

# Instala dependências do projeto
RUN npm install

# Expõe a porta da API (se usar Express)
EXPOSE 3000

# Comando para iniciar
CMD ["node", "index.js"]
