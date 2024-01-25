import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import { BrowserRouter as Router } from 'react-router-dom';
import { CurrentUserProvider } from './contexts/CurrentUserContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { PuzzleHistoryProvider } from './contexts/PuzzleHistoryContext';
import { ProfileProvider } from './contexts/ProfileContext';
import { createRoot } from 'react-dom/client';

const container = document.getElementById('root');
const root = createRoot(container);

root.render(
    <Router>
        <ThemeProvider>
            <CurrentUserProvider>
                <ProfileProvider>
                    <PuzzleHistoryProvider>
                        <App />
                    </PuzzleHistoryProvider>
                </ProfileProvider>
            </CurrentUserProvider>
        </ThemeProvider>
    </Router>
);
