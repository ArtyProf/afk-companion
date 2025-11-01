import React from 'react';

interface StatsTabProps {
    totalSessions: number;
    totalTime: string;
    totalActions: number;
    avgSessionDuration: string;
}

export const StatsTab: React.FC<StatsTabProps> = ({
    totalSessions,
    totalTime,
    totalActions,
    avgSessionDuration
}) => {
    return (
        <div className="tab-content active">
            <div className="status-card">
                <h2>Advanced Statistics</h2>
                
                <div className="stats-grid">
                    <div className="stat-card">
                        <div className="stat-value">{totalSessions}</div>
                        <div className="stat-label">Total Sessions</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-value">{totalTime}</div>
                        <div className="stat-label">Total Time</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-value">{totalActions}</div>
                        <div className="stat-label">Total Actions</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-value">{avgSessionDuration}</div>
                        <div className="stat-label">Avg Session Duration</div>
                    </div>
                </div>
                
                <div className="info-section">
                    <p><strong>Note:</strong> Statistics are stored locally and persist across app restarts.</p>
                </div>
            </div>
        </div>
    );
};
