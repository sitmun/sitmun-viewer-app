# SITMUN Viewer Application

The SITMUN Viewer Application is a web-based application built using TypeScript, JavaScript, npm, and Angular.

# Common Build Arguments

**Environments:**

- Default (`src/environments/environment.ts`)
- Development (`src/environments/environment.development.ts`) 
- Test deployment (`src/environments/environment.testdeployment.ts`) 

**Variables:**

- `production`: Specifies if the environment is a production or a development enviroment. The default value is `false`.
- `hashLocationStrategy`: Enables the Angular `HashLocationStrategy`. The default value is `true`.
- `apiUrl`: Specifies the base URL for the SITMUN Backend used by the aplication. The default value is `https://sitmun-backend-core.herokuapp.com`. 

## Docker Support

The application is containerized using Docker, as defined in the Dockerfile. The Dockerfile is divided into two stages:

1. **Build Stage**: Based on Node.js, this stage is responsible for building and compiling the frontend of the application.
   It uses npm to manage dependencies and Angular for building the application.
2. **Production Stage**: Based on Nginx, this stage serves the compiled application.
   The compiled application from the build stage is copied into the Nginx container and served from the `/usr/share/nginx/html/` directory.

### Dockerfile Build Arguments

The Dockerfile for the SITMUN Viewer Application takes three arguments during the build stage:

- `BASE_HREF`: Specifies the base URL for the application, used by Angular for routing.
- `CONFIGURATION`: Specifies the build configuration for the Angular application (i.e. `testdeployment` and `development`).

### Building the Docker Image

To build the Docker image for the SITMUN Viewer Application, use the `docker build` command.
This command includes the image name and any necessary build arguments.

Example command to build the Docker image:

```bash
docker build -t sitmun-viewer-app --build-arg BASE_HREF=/ --build-arg CONFIGURATION=testdeployment .
```

Adjust the `BASE_HREF` and `CONFIGURATION` as needed.

### Starting the Application with Docker

To start the application, run the following command in the terminal:

```bash
docker run -p 80:80 sitmun-viewer-app 
```

This command will start the SITMUN Viewer Application and map port 80 in the container to port 80 on the host machine.
The application should now be accessible at http://localhost on your machine.

## Docker Compose Support

To deploy the SITMUN Viewer Application using Docker Compose, create a `docker-compose.yml file that defines the services for your application.

### Steps to Create a docker-compose.yml File

1. Create a `docker-compose.yml` file in the root directory of your project.
2. Define a service for the SITMUN Viewer Application in the `docker-compose.yml` file.
   This service should use the Docker image built from the `Dockerfile`, specify the ports to expose, and include any necessary environment variables or build arguments.
3. Start your application by running the `docker-compose up command in the terminal.

### Example docker-compose.yml File

```yaml
version: '3.8'
services:
  sitmun-viewer-app:
    build:
      context: .
      dockerfile: Dockerfile
      args:
        BASE_HREF: /
        CONFIGURATION: testdeployment
    ports:
      - "80:80"
 ```

Adjust the `BASE_HREF` and `CONFIGURATION` as needed.

### Starting the Application with Docker Compose

To start the application, run the following command in the terminal:

```bash
docker-compose up
```

This command will start the SITMUN Viewer Application and map port 80 in the container to port 80 on the host machine.
The application should now be accessible at http://localhost on your machine.

## Development Container support

A development container (or dev container for short) allows you to use a container as a full-featured development environment. 
The provided devcontainer file uses `mcr.microsoft.com/devcontainers/universal:2` and installs **node 16.14.0**.

```json
{
  "image": "mcr.microsoft.com/devcontainers/universal:2",
  "features": {
  },
  "postCreateCommand": "bash -i -c 'nvm install 16.14.0'"
}
```

### Development Build Arguments

The development for the SITMUN Viewer Application takes three arguments during the build stage:

- `BASE_HREF`: Specifies the base URL for the application, used by Angular for routing.
- `CONFIGURATION`: Specifies the build configuration for the Angular application (i.e. `testdeployment` and `development`).

### Building the application

To build the application, run the following command in the terminal:

```bash
npm ci
npm run build -- --configuration=testdeployment --base-href=/
```

Adjust the `BASE_HREF` and `CONFIGURATION` as needed.

These commands will build the application. The output will be available in `dist/viewer-app`.
