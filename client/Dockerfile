FROM node:20-alpine

# Consider delete this if not needed
RUN apk add --no-cache curl 

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm install

COPY . .

EXPOSE 3000

CMD ["npm", "run", "dev"]