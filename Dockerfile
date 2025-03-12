FROM node:20 as development
WORKDIR /app
COPY package.json .
RUN npm install
COPY . .
CMD [ "npm" , "run" , "dev" ]
FROM node:20 as production
WORKDIR /app
COPY package.json .
RUN npm install --only=production
COPY . .
CMD [ "npm" , "run" , "start" ]