import React from 'react';
import ReactDOM from 'react-dom/client';
import '@farmgate/ui/tokens';
import './index.css';
import { App } from './App.js';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
