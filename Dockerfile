# Imagem base do Node.js com Chromium instalado
FROM zenika/node:20-chrome

# Define o diretório de trabalho
WORKDIR /app

# Copia os arquivos para dentro do container
COPY . .

# Instala as dependências
RUN npm install

# Expõe a porta usada pelo seu servidor Express
EXPOSE 3000

# Inicia o bot
CMD ["node", "index.js"]
