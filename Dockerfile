# Use official Node.js runtime as base image
FROM node:22-alpine

# Set working directory in container
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm ci --omit=dev

# Copy the rest of the application code
COPY . .

# Expose the port the app runs on (App Runner default is 8080)
EXPOSE 8080

# Set environment variables (these will be overridden at runtime)
ENV PORT=8080
ENV NODE_ENV=production

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD node -e "const http=require('http'); const p=process.env.PORT||8080; http.get('http://localhost:'+p+'/', (r)=>{ if(r.statusCode!==200) process.exit(1); process.exit(0); }).on('error', ()=>process.exit(1));"

# Start the application
CMD ["node", "server.js"]