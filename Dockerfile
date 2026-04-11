FROM node:20-alpine

WORKDIR /app

# Install serve for static file serving
RUN npm install -g serve

# Copy built files
COPY dist ./dist
COPY package.json ./

# Serve static files on port 3000
EXPOSE 3000

CMD ["serve", "-s", "dist", "-l", "3000"]
