const { exec } = require('child_process');
const { promisify } = require('util');
const fs = require('fs');

const execAsync = promisify(exec);

/**
 * Find xdotool path on Linux systems - generic solution for all distributions
 * Runs once and caches the result
 */
class XdotoolFinder {
  constructor() {
    this.xdotoolPath = null;
    this.isSearched = false;
  }

  async findXdotool() {
    if (this.isSearched) {
      return this.xdotoolPath;
    }

    console.log('=== Searching for xdotool ===');
    this.isSearched = true;
    
    // Method 1: Try common installation paths (most reliable)
    const commonPaths = [
      '/usr/bin/xdotool',        // Ubuntu, Debian, CentOS, RHEL, most distros
      '/usr/local/bin/xdotool',  // Manual installs, some distros
      '/bin/xdotool',            // Some minimal distros
      '/usr/games/xdotool',      // Some package managers put it here
      '/opt/bin/xdotool',        // Some custom installs
      '/snap/bin/xdotool',       // Snap packages
      '/var/lib/flatpak/exports/bin/xdotool', // Flatpak
      (process.env.HOME || '/home/user') + '/.local/bin/xdotool' // User installs
    ];
    
    for (const testPath of commonPaths) {
      try {
        if (fs.existsSync(testPath) && fs.statSync(testPath).mode & parseInt('111', 8)) {
          this.xdotoolPath = testPath;
          console.log('Found xdotool at:', this.xdotoolPath);
          return this.xdotoolPath;
        }
      } catch (error) {
        // Continue searching
      }
    }
    
    // Method 2: If not found in common paths, try 'which' command (if available)
    try {
      const result = await execAsync('which xdotool 2>/dev/null');
      const foundPath = result.stdout.trim();
      if (foundPath && foundPath.startsWith('/')) {
        this.xdotoolPath = foundPath;
        console.log('Found xdotool via which:', this.xdotoolPath);
        return this.xdotoolPath;
      }
    } catch (error) {
      console.log('which command failed or xdotool not in PATH');
    }
    
    // Method 3: Try whereis as backup (more universally available than which)
    try {
      const result = await execAsync('whereis -b xdotool 2>/dev/null');
      const output = result.stdout.trim();
      const match = output.match(/xdotool:\s*(\S+)/);
      if (match && match[1] && match[1] !== 'xdotool:') {
        this.xdotoolPath = match[1];
        console.log('Found xdotool via whereis:', this.xdotoolPath);
        return this.xdotoolPath;
      }
    } catch (error) {
      console.log('whereis command failed');
    }
    
    // Fallback: use 'xdotool' and hope PATH works
    console.log('xdotool not found in standard locations, using fallback command');
    console.log('This may fail in restricted environments like Steam');
    this.xdotoolPath = 'xdotool';
    return this.xdotoolPath;
  }

  getXdotoolPath() {
    if (!this.isSearched) {
      throw new Error('xdotool search not performed yet. Call findXdotool() first.');
    }
    return this.xdotoolPath;
  }
}

// Export singleton instance
module.exports = new XdotoolFinder();