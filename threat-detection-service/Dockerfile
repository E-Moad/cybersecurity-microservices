# Use the official Node.js image
FROM node:16

# Set working directory
WORKDIR /app

# Copy package.json and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the application files
COPY . .

# Expose the port your service listens on
EXPOSE 4001

# Start the application
CMD ["node", "index.js"]
