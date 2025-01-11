# # Stage 1: Build Stage
# FROM node:18 AS build

# # Set working directory inside the container
# WORKDIR /app

# # Copy package.json and package-lock.json for installing dependencies
# COPY package*.json ./

# # Install dependencies (including dev dependencies)
# RUN yarn install

# # Copy the rest of the application code
# COPY . .

# # Build the app (optional, for TypeScript or other build steps)
# RUN yarn run build

# # Stage 2: Production Stage
# FROM node:18-slim AS production

# # Set working directory inside the container
# WORKDIR /app

# # Copy only the necessary files from the build stage
# COPY --from=build /app/package*.json ./
# COPY --from=build /app/dist ./dist # Only if you have a build folder (e.g., TypeScript or Webpack)

# # Install production dependencies only
# RUN yarn install --production

# # Expose the port the app will run on
# EXPOSE 3000

# # Command to run the app (adjust if necessary)
# CMD ["yarn", "start"]
# Stage 1: Build Stage
FROM node:18 AS builder

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
FROM node:18 AS production

# Set working directory
WORKDIR /app

# Copy only necessary files from the builder stage
COPY --from=builder /app /app

# Install only production dependencies using Yarn
RUN yarn install --production

# Expose the port that your application will run on
EXPOSE 3000

# Start the application
CMD ["yarn", "start"]
