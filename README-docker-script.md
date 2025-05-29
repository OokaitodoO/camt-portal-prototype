# Docker Build and Push Script

A convenient shell script to build your Dockerfile and push images to Docker Hub with interactive prompts.

## Prerequisites

- Docker installed and running
- WSL (Windows Subsystem for Linux) if running on Windows
- Docker Hub account

## Features

- 🔐 Interactive Docker Hub login
- 🏗️ Supports multi-stage builds (development, ci, deploy)
- 🏷️ Custom image tagging
- 📦 Automatic build argument handling for development target
- ✅ Pre-flight checks for Docker installation and daemon
- 🎨 Colorized output for better readability
- 🧹 Optional cleanup of dangling images
- ⚡ Confirmation prompts before destructive operations

## Usage

### Running the Script

From your project directory (where the Dockerfile is located):

```bash
# In WSL
./build-and-push.sh

# Or from Windows PowerShell
wsl ./build-and-push.sh
```

### What the Script Will Ask You

1. **Docker Hub Username**: Your Docker Hub username
2. **Repository Name**: The name of your repository (e.g., `my-app`)
3. **Image Tag**: Tag for your image (default: `latest`)
4. **Build Target**: Which stage to build (`development`, `ci`, or `deploy` - default: `deploy`)
5. **User/Group IDs**: Only for development target (defaults to current user)
6. **Docker Hub Credentials**: When prompted by `docker login`

### Example Interactive Session

```
[INFO] Docker Build and Push Script
======================================
Enter your Docker Hub username: myusername
Enter repository name: my-laravel-app
Enter image tag (default: latest): v1.0.0
Enter build target (development/ci/deploy, default: deploy): deploy

[INFO] Configuration:
  Username: myusername
  Repository: my-laravel-app
  Tag: v1.0.0
  Build Target: deploy
  Full Image Name: myusername/my-laravel-app:v1.0.0

Do you want to proceed with the build and push? (y/N): y

[INFO] Logging into Docker Hub...
Please enter your Docker Hub credentials:
Username: myusername
Password: [your-password-or-token]

[SUCCESS] Successfully logged into Docker Hub
[INFO] Building Docker image: myusername/my-laravel-app:v1.0.0
[INFO] Build target: deploy
[INFO] Executing: docker build --target deploy -t myusername/my-laravel-app:v1.0.0 .

[SUCCESS] Docker image built successfully

Do you want to push the image to Docker Hub now? (Y/n): y
[INFO] Pushing image to Docker Hub: myusername/my-laravel-app:v1.0.0

[SUCCESS] Image pushed successfully to Docker Hub
[INFO] Image available at: https://hub.docker.com/r/myusername/my-laravel-app

[SUCCESS] Script completed successfully!
```

## Docker Hub Authentication Options

The script uses `docker login` which supports:

1. **Username + Password**: Your regular Docker Hub credentials
2. **Username + Access Token**: Create a personal access token in Docker Hub settings
3. **Already logged in**: If you're already authenticated, it will skip the login

### Creating a Docker Hub Access Token (Recommended)

1. Go to [Docker Hub](https://hub.docker.com/)
2. Click your profile → Account Settings → Security
3. Click "New Access Token"
4. Give it a name and appropriate permissions
5. Use your username and the token as the password

## Build Targets Explained

Based on your Dockerfile, the script supports three targets:

- **`deploy`** (default): Production-ready image with your application code
- **`development`**: Development image with user ID mapping for file permissions
- **`ci`**: Continuous Integration image optimized for automated builds

## Error Handling

The script includes comprehensive error handling:

- Checks if Docker is installed and running
- Validates user inputs
- Confirms operations before execution
- Provides clear error messages with colored output

## Security Notes

- The script never stores your credentials
- All authentication is handled by Docker's official login mechanism
- Consider using access tokens instead of passwords for better security

## Troubleshooting

### "Docker daemon is not running"
Start Docker Desktop or the Docker service in WSL

### "Permission denied"
Make sure the script is executable: `chmod +x build-and-push.sh`

### "Failed to build Docker image"
Check your Dockerfile syntax and ensure all required files are present in the build context

### WSL Issues
If running from Windows, ensure you're in the correct directory and Docker is accessible within WSL 