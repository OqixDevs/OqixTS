FROM arm64v8/node:22.18.0-slim
WORKDIR /root
ENV PATH="/usr/local/bin:${PATH}"
COPY . .
RUN npm ci --omit=optional
RUN npm cache clean -f
CMD [ "npm", "run", "start" ]
