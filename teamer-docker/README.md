# Docker Setup Instructions

To containerize this project using Docker, follow these steps:

## MongoDB Container
```
cd src
```
1. Pull and run the MongoDB container:
```
docker run --name mongo -d --rm mongo
```
2. Alternatively, to create a MongoDB container with a specific network and volume:
```
docker network create teamer-net
docker volume create teamer-vol
docker run --name mongo -d --rm --network teamer-net -v teamer-vol:/data/db mongo
```

## Node Container

1. Build the Docker image for the Node.js application:
```
docker build -t teamer-frontend .
```
2. Run the Node.js container:
```
docker run --rm -d --network teamer-net -p 3000:3000 --name teamer-frontend -v C:\%cd%\teamer-docker\src:/app teamer-frontend
```
replace `%cd%` with current docker `src` path.
