# 🎮 AFK Companion

⚡ A cross-platform desktop utility to prevent being marked as idle/AFK in games and applications.

## ✨ Features

- 🖥️ **Cross-Platform**: Works on Windows and Linux
- 🖱️ **Smooth Mouse Movement**: Realistic, human-like cursor movement with configurable distance
- 🔐 **ScrollLock Toggle**: Prevents system sleep with invisible ScrollLock key presses
- ⏱️ **Flexible Intervals**: 5 seconds to 5 minutes for different use cases
- 🎯 **Configurable Distance**: Set mouse movement distance from 1-50 pixels
- 🔄 **System Tray Integration**: Runs seamlessly in background, minimizes to tray
- 🛡️ **Reliable Operation**: Simplified architecture prevents stopping issues
- 📊 **Real-time Statistics**: Track actions performed and running time
- ⌨️ **Keyboard Shortcuts**: Ctrl+Space or Alt+Space to toggle
- 🌙 **Always Active**: Never quits when minimized, stays running in tray

## 🚀 Quick Start

1. 📦 **Install Dependencies**:
   ```bash
   npm install
   ```

2. ▶️ **Run the Application**:
   ```bash
   npm start
   ```

3. ⚙️ **Configure Settings**:
   - Choose your preferred interval (5 seconds to 5 minutes, default: 1 minute)
   - Set mouse movement distance (1-50 pixels, default: 5 pixels)
   - Click "Start Anti-AFK"
   - App minimizes to system tray and continues running in background

## 🔧 How It Works

### 🪟 Windows
- 🖱️ **Smooth Mouse Movement**: Uses PowerShell with interpolated movement in small steps
- 🔐 **ScrollLock Toggle**: Sends ScrollLock key press twice (on/off) to prevent system sleep
- 🎯 **Circular Patterns**: Moves cursor in random circular patterns for natural behavior
- ⚡ **Configurable Distance**: User-defined pixel distance (1-50px) for movement radius

### 🐧 Linux  
- 🖱️ **Smooth Mouse Movement**: Uses `xdotool` with step-by-step interpolation
- 🎮 **Steam Deck Compatible**: Works with xdotool on Steam Deck and all Linux distros
- 🔐 **ScrollLock Toggle**: Uses `xdotool` to send ScrollLock key presses for system wake
- 🎯 **Natural Patterns**: Same circular movement patterns as Windows
- ⚡ **Cross-Platform Consistency**: Identical behavior across platforms

> **Note**: On Linux, you may need to install `xdotool`:
> ```bash
> sudo apt install xdotool  # Ubuntu/Debian
> sudo dnf install xdotool  # Fedora
> sudo pacman -S xdotool    # Arch Linux
> ```
> 
> Steam Deck users: `xdotool` is pre-installed and should work out of the box.

### 🏗️ **Architecture**
- 🔄 **Simple & Reliable**: Removed complex background monitoring for stability
- 🗂️ **System Tray Persistence**: App never quits when window closed
- ⚡ **Efficient Processing**: Minimal resource usage with PowerShell/xdotool integration

## 🎯 Movement System

- 🖱️ **Smooth Mouse Movement**: Gradual, interpolated cursor movement (10 steps per action)
- 🎯 **Circular Patterns**: Random-direction movement within configured radius
- 📏 **Configurable Distance**: Set movement radius from 1-50 pixels via UI
- ⏱️ **Natural Timing**: 10ms delays between steps for human-like movement
- 🔄 **Return Path**: Smooth return to original position after brief pause
- � **Invisible Operation**: Movement radius small enough to be unnoticeable

## ⚙️ Settings

- ⏲️ **Movement Interval**: Choose from 5 seconds, 30 seconds, 1 minute, 2 minutes, or 5 minutes
- 📏 **Mouse Distance**: Set movement radius from 1-50 pixels for different visibility needs
- � **Action Type**: Mouse Movement (simplified, focused approach)
- 🌙 **System Tray**: Auto-minimizes to tray, continues running in background
- 🔄 **Always Active**: App never quits when window closed - only via tray menu

## 🔒 Safety & Privacy

- 🏠 **Local Only**: No data sent anywhere
- ⚡ **Minimal Impact**: Uses tiny system resources
- 👻 **Non-Intrusive**: Actions designed to be invisible
- 🎮 **Game Safe**: Uses ScrollLock (non-interfering) and minimal mouse movement
- 📖 **Open Source**: Full source code available

## 📊 Statistics

The app tracks:
- 🔢 Number of actions performed
- ⏱️ Total running time
- ⏳ Countdown to next action

## 💡 Use Cases

- 🎮 **Gaming**: Prevent AFK kicks in multiplayer games and maintain active status
- 💼 **Work Applications**: Keep status active in Slack, Teams, or other chat platforms
- 📺 **Streaming/Watching**: Maintain active status during long videos or streams
- 🏠 **Remote Work**: Prevent screen locks during presentations or long calls
- 💻 **Development**: Keep IDE active during long compilation or processing tasks
- 🎯 **Training/Tutorials**: Stay active during long educational content
- 🔄 **Background Tasks**: Maintain system activity during automated processes

## ⌨️ Keyboard Shortcuts

- `Ctrl + Space`: Toggle AFK protection on/off ⚡
- `Alt + Space`: Toggle AFK protection on/off ⚡

## 🔨 Building

To create distributable builds:

```bash
npm run build        # Build for current platform 🏗️
npm run build:win    # Build for Windows 🪟
npm run build:linux  # Build for Linux 🐧
```

This creates platform-specific installers in the `dist/` folder. 📁

## 🎮 Steam Deployment

The app is configured for Steam deployment with:
- 🆔 **App ID**: 2609100
- 🪟 **Windows Depot**: 2609101
- 🐧 **Linux Depot**: 2609102

Steam deployment includes both Windows portable executable and Linux packages. 🚀

## 🤝 Contributing

1. 🍴 Fork the repository
2. 🌿 Create a feature branch
3. ✨ Make your changes
4. 🧪 Test on both Windows and Linux
5. 📥 Submit a pull request

## � Troubleshooting

### Common Issues

**🚫 Laptop still goes to sleep despite running:**
- The app now uses ScrollLock toggle + mouse movement for maximum effectiveness
- ScrollLock presses prevent system sleep without interfering with applications
- If issues persist, try reducing the interval to 30 seconds or 1 minute

**🎮 Not working on Steam Deck/Linux:**
- Ensure `xdotool` is installed: `sudo apt install xdotool` or `sudo pacman -S xdotool`
- Steam Deck users: `xdotool` should be pre-installed
- Check console logs for error messages if mouse movement fails
- Try running the app from terminal to see detailed error output

**🚫 App stops working after laptop sleep/hibernate:**
- This has been resolved! The app now stays active in system tray
- Simple architecture prevents complex background service failures

**🖱️ Mouse movement seems too small/large:**
- Adjust the "Mouse Distance" setting (1-50 pixels)
- Lower values (1-5px) are nearly invisible
- Higher values (10-20px) are more noticeable but still subtle

**⏱️ Interval seems too fast/slow:**
- Choose from 5 seconds (very frequent) to 5 minutes (occasional)
- 5-30 seconds recommended for games
- 1-5 minutes recommended for work applications

**🖥️ App not visible in taskbar:**
- App minimizes to system tray (look for icon near clock)
- Double-click tray icon to restore window
- Right-click tray icon for context menu

## �📄 License

MIT License - Feel free to use and modify. 💻

## ⚠️ Disclaimer

This tool is for legitimate use cases like preventing unwanted AFK timeouts. Please respect the terms of service of applications and games you use it with. 🛡️

---

## 🔬 Technical Details

### Performance
- **Resource Usage**: ~50-100MB RAM, minimal CPU usage
- **Background Throttling**: Disabled to ensure consistent operation
- **System Integration**: Native PowerShell (Windows) / xdotool (Linux)

### Security
- **No Network Access**: Completely offline operation
- **No Data Collection**: No telemetry or analytics
- **Local Processing**: All operations performed locally
- **Safe Actions**: Uses non-intrusive system calls

### Movement Algorithm
```javascript
// Circular movement pattern
const angle = Math.random() * Math.PI * 2;
const targetX = cursor.x + Math.cos(angle) * pixelDistance;
const targetY = cursor.y + Math.sin(angle) * pixelDistance;

// Smooth interpolation over 10 steps
for (let step = 1; step <= 10; step++) {
  const progress = step / 10;
  const currentX = startX + (targetX - startX) * progress;
  const currentY = startY + (targetY - startY) * progress;
  // Move cursor and wait 10ms
}
```

---

**Made with Electron** ⚛️ 💙