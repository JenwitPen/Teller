# Stage 1: Build the application
FROM node:20-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2: Production image
FROM node:20-alpine
WORKDIR /app

# Copy only production dependencies and built assets
COPY package*.json ./
RUN npm install --only=production
COPY --from=builder /app/dist ./dist

# Expose the correct port defined in main.ts
EXPOSE 8000

# Run using node directly for better performance
CMD ["node", "dist/main"]