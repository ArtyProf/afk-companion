# 🎮 AFK Companion

A cross-platform desktop utility to prevent being marked as idle/AFK in games and applications.

## ✨ Features

- **Cross-Platform**: Works on Windows and Linux
- **Multiple Action Types**: Mouse movement, key press (F15), or both
- **Customizable Intervals**: 30 seconds to 5 minutes
- **System Tray Support**: Minimizes to tray for background operation
- **Safe Actions**: Uses minimal, non-intrusive system interactions
- **Real-time Statistics**: Track actions performed and running time
- **Keyboard Shortcuts**: Ctrl+Space or Alt+Space to toggle

## 🚀 Quick Start

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Run the Application**:
   ```bash
   npm start
   ```

3. **Configure Settings**:
   - Choose your preferred interval (default: 1 minute)
   - Select action type (mouse movement recommended)
   - Click "Start Anti-AFK"

## ⚙️ How It Works

### Windows
- **Mouse Movement**: Uses PowerShell to move cursor by 1 pixel and back
- **Key Press**: Sends F15 key (safe, rarely used by applications)

### Linux  
- **Mouse Movement**: Uses `xdotool` to move cursor
- **Key Press**: Sends F15 key via `xdotool`

> **Note**: On Linux, you may need to install `xdotool`:
> ```bash
> sudo apt install xdotool  # Ubuntu/Debian
> sudo dnf install xdotool  # Fedora
> ```

## 🎯 Action Types

- **Mouse Movement**: Moves cursor by 1 pixel (invisible to user)
- **Key Press**: Sends F15 key (doesn't interfere with games)
- **Both**: Combines mouse and key actions

## 🔧 Settings

- **Interval**: How often to perform actions (30s - 5min)
- **Action Type**: Choose between mouse, key, or both
- **Background Mode**: Minimize to system tray

## 🛡️ Safety & Privacy

- ✅ **Local Only**: No data sent anywhere
- ✅ **Minimal Impact**: Uses tiny system resources
- ✅ **Non-Intrusive**: Actions designed to be invisible
- ✅ **Game Safe**: Uses keys (F15) that don't conflict with games
- ✅ **Open Source**: Full source code available

## 📊 Statistics

The app tracks:
- Number of actions performed
- Total running time
- Countdown to next action

## 🎯 Use Cases

- **Gaming**: Prevent AFK kicks in multiplayer games
- **Work**: Keep status active during breaks
- **Streaming**: Maintain active status while away
- **Remote Work**: Prevent auto-lock during presentations

## ⌨️ Keyboard Shortcuts

- `Ctrl + Space`: Toggle AFK protection on/off
- `Alt + Space`: Toggle AFK protection on/off

## 🔧 Building

To create distributable builds:

```bash
npm run build
```

This creates platform-specific installers in the `dist/` folder.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test on both Windows and Linux
5. Submit a pull request

## 📝 License

MIT License - Feel free to use and modify.

## ⚠️ Disclaimer

This tool is for legitimate use cases like preventing unwanted AFK timeouts. Please respect the terms of service of applications and games you use it with.

---

**Made with ❤️ using Electron**