FROM node:22-alpine

WORKDIR /app

# Ferramentas globais
RUN npm install -g @angular/cli @ionic/cli

# Copia apenas os arquivos de dependências primeiro
COPY package*.json ./

# Instala dependências
RUN npm ci

# Copia o restante do projeto
COPY . .

# Porta padrão do Ionic
EXPOSE 8100

# Servidor de desenvolvimento
CMD ["ionic", "serve", "--host=0.0.0.0", "--port=8100"]