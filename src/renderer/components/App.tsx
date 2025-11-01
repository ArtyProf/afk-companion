import React, { useEffect, useState } from 'react';
import { LoadingScreen } from './LoadingScreen';
import { Header } from './Header';
import { Tabs } from './Tabs';
import { MainTab } from './MainTab';
import { StatsTab } from './StatsTab';
import { UseCaseTab } from './UseCaseTab';
import { FeaturesTab } from './FeaturesTab';
import { Footer } from './Footer';
import { AFKCompanion, AFKState } from '../AFKCompanion';

type TabType = 'main' | 'stats' | 'usecase' | 'features';

export const App: React.FC = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<TabType>('main');
    const [afkCompanion, setAfkCompanion] = useState<AFKCompanion | null>(null);
    
    // AFKCompanion state
    const [isActive, setIsActive] = useState(false);
    const [actionCount, setActionCount] = useState(0);
    const [runningTime, setRunningTime] = useState('00:00:00');
    const [nextAction, setNextAction] = useState('--');
    const [interval, setInterval] = useState(60000);
    const [pixelDistance, setPixelDistance] = useState(5);
    const [keyButton, setKeyButton] = useState('none');
    
    // Advanced stats
    const [totalSessions, setTotalSessions] = useState(0);
    const [totalTime, setTotalTime] = useState('0h');
    const [totalActions, setTotalActions] = useState(0);
    const [avgSessionDuration, setAvgSessionDuration] = useState('0m');
    
    useEffect(() => {
        // Simulate loading sequence
        const loadingSteps = [
            { text: 'Initializing...', progress: 20, delay: 500 },
            { text: 'Loading components...', progress: 40, delay: 1000 },
            { text: 'Setting up statistics...', progress: 60, delay: 1500 },
            { text: 'Preparing interface...', progress: 80, delay: 2000 },
            { text: 'Ready!', progress: 100, delay: 2500 }
        ];
        
        setTimeout(() => {
            setIsLoading(false);
            initializeAFKCompanion();
        }, 3000);
    }, []);
    
    const initializeAFKCompanion = async () => {
        const companion = new AFKCompanion();
        
        // Set up state update callback
        companion.setStateUpdateCallback((state: AFKState) => {
            setIsActive(state.isActive);
            setActionCount(state.actionCount);
            setRunningTime(state.runningTime);
            setNextAction(state.nextAction);
            setInterval(state.interval);
            setPixelDistance(state.pixelDistance);
            setKeyButton(state.keyButton);
            
            // Advanced stats
            setTotalSessions(state.advancedStats.totalSessions);
            setTotalTime(state.advancedStats.totalTime);
            setTotalActions(state.advancedStats.totalActions);
            setAvgSessionDuration(state.advancedStats.avgSessionDuration);
        });
        
        setAfkCompanion(companion);
    };
    
    const handleToggle = () => {
        afkCompanion?.toggle();
    };
    
    const handleIntervalChange = async (value: number) => {
        setInterval(value);
        await afkCompanion?.onIntervalChange(value);
    };
    
    const handlePixelDistanceChange = async (value: number) => {
        setPixelDistance(value);
        await afkCompanion?.onPixelDistanceChange(value);
    };
    
    const handleKeyButtonChange = async (value: string) => {
        setKeyButton(value);
        await afkCompanion?.onKeyButtonChange(value);
    };
    
    if (isLoading) {
        return <LoadingScreen />;
    }
    
    return (
        <div className="container">
            <Header />
            
            <main className="content">
                <Tabs activeTab={activeTab} onTabChange={setActiveTab} />
                
                {activeTab === 'main' && (
                    <MainTab
                        isActive={isActive}
                        actionCount={actionCount}
                        runningTime={runningTime}
                        nextAction={nextAction}
                        interval={interval}
                        pixelDistance={pixelDistance}
                        keyButton={keyButton}
                        onToggle={handleToggle}
                        onIntervalChange={handleIntervalChange}
                        onPixelDistanceChange={handlePixelDistanceChange}
                        onKeyButtonChange={handleKeyButtonChange}
                    />
                )}
                
                {activeTab === 'stats' && (
                    <StatsTab
                        totalSessions={totalSessions}
                        totalTime={totalTime}
                        totalActions={totalActions}
                        avgSessionDuration={avgSessionDuration}
                    />
                )}
                
                {activeTab === 'usecase' && <UseCaseTab />}
                
                {activeTab === 'features' && <FeaturesTab />}
            </main>
            
            <Footer />
        </div>
    );
};
