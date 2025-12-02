import React from 'react';
import ReactDOM from 'react-dom/client';
import { HelmetProvider } from 'react-helmet-async';
import { LocalAuthProvider } from './hooks';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <HelmetProvider>
      <LocalAuthProvider>
        <App />
      </LocalAuthProvider>
    </HelmetProvider>
  </React.StrictMode>
);
