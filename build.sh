#!/bin/bash
echo "Building Electron Hello World App..."
echo
echo "Installing dependencies..."
npm install
echo
echo "Building for Windows..."
npm run pack:win
echo
echo "Building for Linux..."
npm run pack:linux
echo
echo "Build complete! Check the dist/ folder for the packaged applications."
echo
echo "Windows: dist/electron-hello-world-win32-x64/electron-hello-world.exe"
echo "Linux: dist/electron-hello-world-linux-x64/electron-hello-world"