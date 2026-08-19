import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import { PinGate } from './components/ui/PinGate.jsx';
import './styles.css';

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <PinGate>
      <App />
    </PinGate>
  </React.StrictMode>
);
