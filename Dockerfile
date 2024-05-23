# Stage 0, "build-stage", based on Node.js, to build and compile the frontend
FROM node:18 AS build-stage
ARG GITHUB_TOKEN
ARG BASE_HREF
ARG CONFIGURATION
RUN mkdir -p /home/node/app/node_modules && chown -R node:node /home/node/app
WORKDIR /home/node/app
COPY package*.json ./
RUN npm ci
COPY --chown=node:node *.json *.js ./
COPY --chown=node:node src/ ./src/
RUN npm run build -- --configuration="$CONFIGURATION" --base-href="$BASE_HREF"

# Stage 1, based on Nginx, to have only the compiled app, ready for production with Nginx
FROM nginx:latest
COPY --from=build-stage /home/node/app/dist/viewer-app/ /usr/share/nginx/html/
COPY ./nginx.conf /etc/nginx/conf.d/default.conf
