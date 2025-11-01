import React from 'react';
import { ipcRenderer } from 'electron';

const openExternalLink = (url: string) => {
    if (typeof require !== 'undefined') {
        try {
            ipcRenderer.invoke('open-external', url);
        } catch (error) {
            console.log('IPC not available, falling back to window.open');
            window.open(url, '_blank');
        }
    } else {
        window.open(url, '_blank');
    }
};

export const Footer: React.FC = () => {
    return (
        <footer>
            <p>
                <a
                    href="#"
                    className="footer-link"
                    onClick={(e) => {
                        e.preventDefault();
                        openExternalLink('https://github.com/ArtyProf/afk-companion');
                    }}
                >
                    GitHub Repository
                </a>
            </p>
            <div className="copyright">
                <p>&copy; 2025 Artur Khutak</p>
                <p>arty4prof@gmail.com</p>
            </div>
        </footer>
    );
};
