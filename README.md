# Electron Hello World App

A simple cross-platform Hello World application built with Electron that runs on Windows and Linux.

## Features

- 🚀 Cross-platform compatibility (Windows & Linux)
- 🎨 Modern, responsive UI with gradient backgrounds
- 💻 System information display
- 🔧 Platform-specific optimizations
- 📦 Ready-to-build distribution packages
- ⌨️ Keyboard shortcuts
- 🖱️ Interactive buttons and animations

## Prerequisites

Before running this application, make sure you have:

- [Node.js](https://nodejs.org/) (version 16 or higher)
- npm (comes with Node.js)

## Installation

1. Clone or download this repository
2. Navigate to the project directory:
   ```bash
   cd electron_app
   ```
3. Install dependencies:
   ```bash
   npm install
   ```

## Running the Application

### Development Mode
```bash
npm start
```

This will launch the Electron app in development mode with DevTools available.

## Building for Distribution

### Quick Build (Recommended)
On Windows:
```bash
build.bat
```

On Linux:
```bash
chmod +x build.sh
./build.sh
```

### Manual Build Commands

#### Build for Windows
```bash
npm run pack:win
```

#### Build for Linux
```bash
npm run pack:linux
```

#### Build for Both Platforms
```bash
npm run pack:all
```

### Alternative Build Method (may have permission issues)
```bash
npm run build:win
npm run build:linux
```

## Distribution Packages

After building, you'll find the packaged applications in the `dist/` folder:

### Windows
- `dist/electron-hello-world-win32-x64/electron-hello-world.exe`
- Ready-to-run executable (no installation required)
- x64 architecture

### Linux
- `dist/electron-hello-world-linux-x64/electron-hello-world`
- Ready-to-run executable (no installation required)
- x64 architecture

## Project Structure

```
electron_app/
├── main.js              # Main process (Electron entry point)
├── renderer.js          # Renderer process (UI logic)
├── index.html           # Main window HTML
├── styles.css           # Application styles
├── package.json         # Project configuration & dependencies
├── assets/              # Icons and other assets
└── dist/               # Built distribution packages (after build)
```

## Key Features Explained

### Cross-Platform Support
- **Windows**: Uses native Windows styling and conventions
- **Linux**: Adapts to Linux desktop environments
- **Responsive**: Works on different screen sizes

### System Information
The app displays:
- Operating system platform
- System architecture
- Node.js version
- Electron version
- Detailed system specs (CPU, memory, uptime)

### Security Features
- Context isolation for security
- Prevention of new window creation
- External link handling through system browser

### Menu System
- Cross-platform application menu
- Platform-specific menu adaptations
- Keyboard shortcuts (Ctrl+Q to quit, etc.)

## Customization

### Changing the App Icon
1. Replace files in the `assets/` folder:
   - `icon.ico` for Windows
   - `icon.png` for Linux
2. Icons should be at least 256x256 pixels

### Modifying the UI
- Edit `index.html` for structure
- Modify `styles.css` for appearance
- Update `renderer.js` for functionality

### App Configuration
Edit `package.json` to change:
- App name and description
- Build settings
- Target platforms
- App ID and metadata

## Development Tips

### Debugging
- Press `F12` or `Ctrl+Shift+I` to open DevTools
- Use `console.log()` in renderer.js for debugging
- Check the terminal for main process logs

### Hot Reload
The app doesn't have hot reload by default. Restart with `npm start` after changes.

### Adding Dependencies
```bash
npm install <package-name>
```

For build-time dependencies:
```bash
npm install --save-dev <package-name>
```

## Common Issues & Solutions

### Build Issues
1. **electron-builder permission errors**: Use electron-packager commands instead (`npm run pack:win`)
2. **Python/Visual Studio errors on Windows**: Install Visual Studio Build Tools (if using electron-builder)
3. **Symbolic link errors**: Run as administrator or use the packager scripts instead
4. **Cache issues**: Clear electron-builder cache: `Remove-Item -Path "$env:LOCALAPPDATA\electron-builder\Cache" -Recurse -Force`

### Runtime Issues
1. **App won't start**: Check Node.js version compatibility
2. **White screen**: Check browser console for JavaScript errors
3. **GPU process errors**: These are usually harmless warnings on some systems
4. **Menu not showing**: Restart the application

## Next Steps

Consider adding:
- Auto-updater functionality
- Configuration/settings persistence
- Additional platform integrations
- Custom protocols
- Native system notifications
- File system operations

## Resources

- [Electron Documentation](https://www.electronjs.org/docs)
- [Electron Builder](https://www.electron.build/)
- [Node.js API](https://nodejs.org/api/)

## License

MIT License - feel free to use this as a starting point for your own Electron applications!