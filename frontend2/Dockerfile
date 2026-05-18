FROM node:20-alpine

WORKDIR /app

ARG NEXT_PUBLIC_API_BASE_URL=/api/v1
ENV NEXT_PUBLIC_API_BASE_URL=$NEXT_PUBLIC_API_BASE_URL
ARG API_PROXY_ORIGIN=http://localhost:8000
ENV API_PROXY_ORIGIN=$API_PROXY_ORIGIN

# Copia package files
COPY package.json package-lock.json ./

# Installa dipendenze
RUN npm ci

# Copia il resto del codice
COPY . .

# Build production
RUN npm run build

EXPOSE 3000

CMD ["npm", "run", "start"]
