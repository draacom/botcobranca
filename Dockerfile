# Usa imagem base com Node.js e Chromium já configurado
FROM browserless/chrome:latest

# Define o diretório de trabalho
WORKDIR /app

# Copia arquivos do projeto
COPY package*.json ./
COPY . .

# Instala dependências
RUN npm install

# Expõe a porta usada pelo Express
EXPOSE 3000

# Comando para iniciar o bot
CMD ["node", "index.js"]
