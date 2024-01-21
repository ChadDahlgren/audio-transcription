FROM node:20-alpine

# Update package lists and install necessary packages
RUN apk update && \
    apk add --no-cache git vim nano bash bash-completion bash-doc ffmpeg

# Set the working directory
WORKDIR /home/app/api

# Copy prisma schema and package files
COPY prisma ./prisma/
COPY package*.json ./

# Install npm dependencies
RUN npm install

# Copy the rest of your application's code
COPY . .

# Build the application and generate Prisma client
RUN npm run build && \
    npx prisma generate

# Set the command to start the node server
CMD ["npm", "run", "server"]
