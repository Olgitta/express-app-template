# Use the official Node.js 20 base image
FROM node:20

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json to the container
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the application code to the container
COPY . .

# Expose the port your application will run on
EXPOSE 3000

# Command to run the application
#CMD ["npm", "start"]
CMD ["node", "bin/server.js"]