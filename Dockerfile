FROM node:12 as builder
WORKDIR /app

# Install dependencies
COPY ./package.json ./package-lock.json ./
RUN npm install

# Build
COPY . .

RUN npm run build


FROM node:12-alpine

WORKDIR /app

COPY --from=builder /app/package.json /app/package-lock.json ./
RUN npm install --production
COPY --from=builder /app/dist ./dist

CMD ["npm", "run", "start:prod"]