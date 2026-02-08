# Build stage
FROM node:20-alpine AS build
WORKDIR /app

# Copy package files from root
COPY package*.json ./

# Install dependencies (legacy-peer-deps for Angular 18 compatibility)
RUN npm ci --legacy-peer-deps

# Copy source code
COPY . .

# Build the Angular app for production
RUN npm run build -- --configuration=production

# Production stage
FROM nginx:alpine AS production
WORKDIR /usr/share/nginx/html

# Remove default nginx static assets
RUN rm -rf ./*

# Copy built assets from build stage
COPY --from=build /app/dist/angular-webapp .

# Copy nginx configuration
COPY src/nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD wget -q --spider http://localhost/ || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
