# Stage 1: Build Stage
FROM node:18-slim AS builder

# Set working directory
WORKDIR /app

# Copy package.json and yarn.lock
COPY package.json yarn.lock ./

# Install dependencies using Yarn
RUN yarn install

# Copy the source code
COPY . .

# Generate Prisma Client (ensure you're generating it here)
RUN npx prisma generate

# Compile TypeScript files (optional step)
RUN npx tsc

# Stage 2: Production Stage
FROM node:18-slim AS production

# Install openssl
RUN apt-get update -y && apt-get install -y openssl

# Set working directory
WORKDIR /app

# Copy only necessary files from the builder stage
COPY --from=builder /app /app

# Install only production dependencies using Yarn
RUN yarn install

# Install global dependency
RUN npm install -g dotenv-cli

# Generate Prisma Client (ensure you're generating it here)
RUN npx prisma generate

# Expose the port that your application will run on
EXPOSE 3000

# Start the application
CMD ["yarn", "start:dev"]
# Stage 1: Build Stage
# FROM node:18-alpine AS builder

# # Install required tools for build (if necessary)
# RUN apk add --no-cache python3 make g++

# # Set working directory
# WORKDIR /app

# # Copy only necessary files for dependency installation
# COPY package.json yarn.lock ./

# # Install all dependencies
# RUN yarn install --frozen-lockfile

# # Copy the application source code
# COPY . .

# # Build the application (if using TypeScript or Webpack)
# RUN yarn build

# # Stage 2: Production Stage
# FROM node:18-alpine AS production

# # Install only minimal packages for production
# RUN apk add --no-cache openssl

# # Set working directory
# WORKDIR /app

# # Copy only necessary files from the builder stage
# COPY --from=builder /app/prisma ./prisma 
# COPY --from=builder /app/dist ./dist 
# COPY --from=builder /app/package.json ./
# COPY --from=builder /app/yarn.lock ./
# COPY --from=builder /app/.env ./dist/.env
# COPY --from=builder /app/.env.development ./dist/.env.development

# # Install production dependencies only
# RUN yarn install --production --frozen-lockfile

# # Generate Prisma Client (if required)
# RUN npx prisma generate

# # Expose the application port
# EXPOSE 3000

# # Start the application
# CMD ["yarn", "start:dev"]
