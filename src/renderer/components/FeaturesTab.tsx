import React from 'react';

export const FeaturesTab: React.FC = () => {
    return (
        <div className="tab-content active">
            <div className="status-card">
                <h2>System Integration & Features</h2>
                
                <div className="features-grid">
                    <div className="feature-section">
                        <h3>System Tray Integration</h3>
                        <div className="feature-details">
                            <p>Minimizes to system tray for background operation</p>
                            <p>Quick access to start/stop functionality</p>
                            <p>Unobtrusive presence while active</p>
                        </div>
                    </div>
                    
                    <div className="feature-section">
                        <h3>Cross-Platform Compatibility</h3>
                        <div className="platform-icons">
                            <span className="platform-item">Windows</span>
                            <span className="platform-item">macOS</span>
                            <span className="platform-item">Linux</span>
                        </div>
                        <p>Native support across operating systems</p>
                    </div>
                    
                    <div className="feature-section">
                        <h3>Security & Privacy</h3>
                        <div className="security-features">
                            <div className="security-item">✓ Local-only operation</div>
                            <div className="security-item">✓ No network connections</div>
                            <div className="security-item">✓ No data collection</div>
                            <div className="security-item">✓ Open source code</div>
                        </div>
                    </div>
                </div>
                
                <div className="info-section">
                    <h3>Open Source</h3>
                    <p>AFK Companion is open source and available on GitHub:</p>
                    <p className="github-url">https://github.com/ArtyProf/afk-companion</p>
                    <p className="github-note">Feel free to contribute, report issues, or fork the project!</p>
                </div>
            </div>
        </div>
    );
};
