import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './components/App';

// Import all CSS files
import '../../styles/base.css';
import '../../styles/loading.css';
import '../../styles/tabs.css';
import '../../styles/main.css';
import '../../styles/stats.css';
import '../../styles/content.css';

console.log('AFK Companion React app initializing...');

const root = ReactDOM.createRoot(
    document.getElementById('root') as HTMLElement
);

root.render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);
