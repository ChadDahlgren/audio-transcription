These scripts are used to interact with the local development environment. The general idea is that we start a docker container and run the app, tests and other commands directly within the container itself. These scripts help to remove the docker knowledge required to just develope the app.

The scripts assume you are running them from the root directory of the project.

# Scripts

- **migrate**: Runs the prisma migrations and generates the client. This command runs as part of `scripts/dev/start`, but can be ran on its own if migrations are updated and you want to save time by not restarting the entire environment.
- **restart**: Restarts the environment
- **run**: runs a command inside the main firebox-api app container. This is useful if you want to run npm commands or install new modules.
- **server**: Starts the app server in a running environment. The `scripts/dev/start` should have already been ran before using this command
- **start**: Starts the firebox-api environment. This includes building all associated containers, installing npm dependencies, running migrations/generating the prisma client and starting the typescript compiler watcher.
- **stop**: Stops the environment and brings down all the containers
- **terminal**: Opens a tty bash terminal into the main firebox-api app container
- **docker-reset**: Completely resets the state of docker and its resources on the system. Use this command as a last resort if you're having docker issues. Be warned it clears all images, volumes and running containers. You'll be required to redownload any images the next time you start the environment. If you have system memory or disk space issues it might be better to raise resources in the docker app or to try running `docker system prune --volumes` on its own first to see if that solves the issue.
