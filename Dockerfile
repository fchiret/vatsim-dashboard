FROM node:25-alpine

WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --silent

# Copy application files
COPY . .

# Set proper permissions
RUN chown -R node:node /usr/src/app

# Use non-root user
USER node

# Expose port
EXPOSE 3000

# Start development server
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
