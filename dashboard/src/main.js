import { jsx as _jsx } from "react/jsx-runtime";
/**
 * React Application Entry Point
 * Renders the main App component into the DOM
 */
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/tailwind.css';
/**
 * Mount the React application to the root DOM element
 * Wrapped in StrictMode for additional development checks
 */
const root = document.getElementById('root');
if (!root) {
    throw new Error('Root element not found in HTML');
}
ReactDOM.createRoot(root).render(_jsx(React.StrictMode, { children: _jsx(App, {}) }));
//# sourceMappingURL=main.js.map