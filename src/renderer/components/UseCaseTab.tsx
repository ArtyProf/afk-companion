import React from 'react';

export const UseCaseTab: React.FC = () => {
    return (
        <div className="tab-content active">
            <div className="status-card">
                <h2>Use Case Scenarios</h2>
                
                <div className="use-cases-grid">
                    <div className="use-case-card">
                        <div className="use-case-icon">🎮</div>
                        <h3>Gaming Lobby</h3>
                        <div className="use-case-details">
                            <p><strong>Perfect for:</strong> Waiting in game queues, lobby screens</p>
                            <p><strong>Settings:</strong> 30-60 second intervals</p>
                            <p><strong>Benefits:</strong> Stay online, avoid auto-disconnect</p>
                        </div>
                    </div>
                    
                    <div className="use-case-card">
                        <div className="use-case-icon">💼</div>
                        <h3>Work Meeting</h3>
                        <div className="use-case-details">
                            <p><strong>Perfect for:</strong> Long presentations, training sessions</p>
                            <p><strong>Settings:</strong> 2-5 minute intervals</p>
                            <p><strong>Benefits:</strong> Maintain active status, no interruptions</p>
                        </div>
                    </div>
                    
                    <div className="use-case-card">
                        <div className="use-case-icon">📺</div>
                        <h3>Streaming Setup</h3>
                        <div className="use-case-details">
                            <p><strong>Perfect for:</strong> Stream breaks, content preparation</p>
                            <p><strong>Settings:</strong> 1-2 minute intervals</p>
                            <p><strong>Benefits:</strong> Prevent screen saver during streams</p>
                        </div>
                    </div>
                </div>
                
                <div className="info-section">
                    <h3>Key Advantages</h3>
                    <ul className="advantages-list">
                        <li><strong>Invisible Operation:</strong> Tiny mouse movements that won't interfere</li>
                        <li><strong>Customizable Timing:</strong> Set intervals that match your specific needs</li>
                        <li><strong>Universal Compatibility:</strong> Works with any application or system</li>
                        <li><strong>Resource Efficient:</strong> Minimal impact on system performance</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};
