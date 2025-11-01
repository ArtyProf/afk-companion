import React from 'react';

type TabType = 'main' | 'stats' | 'usecase' | 'features';

interface TabsProps {
    activeTab: TabType;
    onTabChange: (tab: TabType) => void;
}

export const Tabs: React.FC<TabsProps> = ({ activeTab, onTabChange }) => {
    return (
        <nav className="tabs">
            <button
                className={`tab-btn ${activeTab === 'main' ? 'active' : ''}`}
                onClick={() => onTabChange('main')}
            >
                Main
            </button>
            <button
                className={`tab-btn ${activeTab === 'stats' ? 'active' : ''}`}
                onClick={() => onTabChange('stats')}
            >
                Advanced Stats
            </button>
            <button
                className={`tab-btn ${activeTab === 'usecase' ? 'active' : ''}`}
                onClick={() => onTabChange('usecase')}
            >
                Use Cases
            </button>
            <button
                className={`tab-btn ${activeTab === 'features' ? 'active' : ''}`}
                onClick={() => onTabChange('features')}
            >
                Features
            </button>
        </nav>
    );
};
