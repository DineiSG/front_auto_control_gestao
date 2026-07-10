FROM node:18-slim AS build
WORKDIR /app

# Instalar dependências do sistema necessárias para builds nativos
RUN apt-get update && apt-get install -y python3 g++ make

# Copiar package.json e package-lock.json
COPY package.json package-lock.json ./

# Instalar dependências
RUN npm install

# Copiar todo o projeto
COPY . .

# Gerar build da aplicação
RUN npm run build

# Servir com Nginx
FROM nginx:alpine
COPY --from=build /app/dist/ /usr/share/nginx/html
COPY default.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]