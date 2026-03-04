FROM node:20-alpine
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci
COPY . .

# 设置构建时环境变量（Next.js NEXT_PUBLIC_ 变量必须在 build 时设置）
ENV NEXT_PUBLIC_API_BASE_URL=https://reverc-backend-630132598726.us-central1.run.app

RUN npm run build
ENV NODE_ENV=production
EXPOSE 3000
CMD ["npm","run","start"]
