FROM node:16-slim
WORKDIR /root
COPY . .
RUN npm ci
RUN npm cache clean -f
CMD [ "npm", "run", "start" ]
