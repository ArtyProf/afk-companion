import React, { useEffect, useState } from 'react';

const loadingSteps = [
    { text: 'Initializing...', progress: 20 },
    { text: 'Loading components...', progress: 40 },
    { text: 'Setting up statistics...', progress: 60 },
    { text: 'Preparing interface...', progress: 80 },
    { text: 'Ready!', progress: 100 }
];

export const LoadingScreen: React.FC = () => {
    const [currentStep, setCurrentStep] = useState(0);
    
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentStep((prev) => {
                if (prev < loadingSteps.length - 1) {
                    return prev + 1;
                }
                clearInterval(interval);
                return prev;
            });
        }, 500);
        
        return () => clearInterval(interval);
    }, []);
    
    const step = loadingSteps[currentStep];
    
    return (
        <div className="loading-screen">
            <div className="loading-content">
                <div className="loading-logo">
                    <h1>AFK Companion</h1>
                    <div className="loading-spinner">
                        <div className="spinner"></div>
                    </div>
                </div>
                <p className="loading-text">{step.text}</p>
                <div className="loading-progress">
                    <div className="progress-bar" style={{ width: `${step.progress}%` }}></div>
                </div>
            </div>
        </div>
    );
};
