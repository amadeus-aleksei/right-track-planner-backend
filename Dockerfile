FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
COPY certificates/key.pem /certificates/key.pem
COPY certificates/cert.pem /certificates/cert.pem

EXPOSE 443

CMD ["npm", "start"]
