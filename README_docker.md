# Dockerfile

Dockefile is created on top of `node:9.6.1` image.

# Requirements

 - The project should be cloned from https://github.com/trilogy-group/graphite.git
 - Docker version 18.06.1-ce
   
# Quick Start

- Install and enable CORS extension for your browser, in the case of crhome, use https://chrome.google.com/webstore/detail/cors/dboaklophljenpcjkbbibpkbpbobnbld?hl=en
- Unzip `graphite-docker.zip` in `{project-root-folder}/`
- Open a terminal session to that folder
- Create a prod.js based on dev.js, this is done running `cp src\components\helpers\dev.js src\components\helpers\prod.js`
- Run `docker build -t graphite .`
- Run `docker run -it -v {project-root-folder}:/usr/src/app -v /usr/src/app/node_modules -p 3000:3000 --rm graphite` 
  Remember to replace {project-root-folder} with your actual folder location
- At this point the system will install all required node dependencies, mount the volumes so the container has access to the code, then run npm start
	- access http://localhost:3000 to see project running
- When you finish working with the container, type `ctrl+c`


# Work with the Docker Container

