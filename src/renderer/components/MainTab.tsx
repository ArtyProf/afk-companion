import React from 'react';

interface MainTabProps {
    isActive: boolean;
    actionCount: number;
    runningTime: string;
    nextAction: string;
    interval: number;
    pixelDistance: number;
    keyButton: string;
    onToggle: () => void;
    onIntervalChange: (value: number) => void;
    onPixelDistanceChange: (value: number) => void;
    onKeyButtonChange: (value: string) => void;
}

export const MainTab: React.FC<MainTabProps> = ({
    isActive,
    actionCount,
    runningTime,
    nextAction,
    interval,
    pixelDistance,
    keyButton,
    onToggle,
    onIntervalChange,
    onPixelDistanceChange,
    onKeyButtonChange
}) => {
    return (
        <div className="tab-content active">
            <div className="status-card">
                <div className="status-indicator">
                    <div className={`status-dot ${isActive ? 'active' : 'inactive'}`}></div>
                    <span id="status-text">{isActive ? 'Active' : 'Inactive'}</span>
                </div>
                
                <div className="controls">
                    <button
                        className={`btn btn-primary ${isActive ? 'active' : ''}`}
                        onClick={onToggle}
                    >
                        {isActive ? 'Stop Anti-AFK' : 'Start Anti-AFK'}
                    </button>
                </div>
                
                <div className="settings">
                    <div className="setting-group">
                        <label htmlFor="interval-select">Movement Interval:</label>
                        <select
                            id="interval-select"
                            className="select-input"
                            value={interval}
                            onChange={(e) => onIntervalChange(parseInt(e.target.value))}
                        >
                            <option value="5000">5 seconds</option>
                            <option value="30000">30 seconds</option>
                            <option value="60000">1 minute</option>
                            <option value="120000">2 minutes</option>
                            <option value="300000">5 minutes</option>
                        </select>
                    </div>
                    
                    <div className="setting-group">
                        <label htmlFor="pixel-distance">Mouse Distance:</label>
                        <input
                            type="number"
                            id="pixel-distance"
                            className="number-input"
                            min="1"
                            max="50"
                            value={pixelDistance}
                            onChange={(e) => onPixelDistanceChange(parseInt(e.target.value))}
                        />
                        <span className="unit-label">pixels</span>
                    </div>
                    
                    <div className="setting-group">
                        <label htmlFor="key-button-select">Additional Key Press:</label>
                        <select
                            id="key-button-select"
                            className="select-input"
                            value={keyButton}
                            onChange={(e) => onKeyButtonChange(e.target.value)}
                        >
                            <option value="none">None</option>
                            <optgroup label="Function Keys">
                                <option value="f13">F13</option>
                                <option value="f14">F14</option>
                                <option value="f15">F15</option>
                                <option value="f16">F16</option>
                                <option value="f17">F17</option>
                                <option value="f18">F18</option>
                                <option value="f19">F19</option>
                                <option value="f20">F20</option>
                            </optgroup>
                        </select>
                        <span className="setting-hint" style={{ marginTop: '6px', display: 'block' }}>
                            Adds an extra key press (non-intrusive keys only)
                        </span>
                    </div>
                </div>
                
                <div className="info-section">
                    <h3>Statistics</h3>
                    <div className="stats">
                        <div className="stat-item">
                            <span className="stat-label">Actions Performed:</span>
                            <span className="stat-value">{actionCount}</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-label">Running Time:</span>
                            <span className="stat-value">{runningTime}</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-label">Next Action:</span>
                            <span className="stat-value">{nextAction}</span>
                        </div>
                    </div>
                </div>
                
                <div className="info-section">
                    <h3>How it works</h3>
                    <ul className="info-list">
                        <li><strong>Mouse Movement:</strong> Universal cross-platform automation (invisible)</li>
                        <li><strong>Key Presses:</strong> Optional function keys or lock keys (F13-F20, ScrollLock, etc.)</li>
                        <li><strong>Safe:</strong> Uses minimal system resources with non-intrusive keys</li>
                        <li><strong>System Tray:</strong> Minimizes to tray for background operation</li>
                        <li><strong>Local Only:</strong> No data sent anywhere</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};
