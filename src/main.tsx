import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { ClientScheduleWindow } from './components/taskflow/projects/ClientScheduleWindow';
import { isClientScheduleWindow } from './components/taskflow/projects/clientScheduleBridge';
import './index.css';

// «Cronograma y acuerdos» en pestaña propia (?app=eco&cronograma=1): solo esa vista, sin el resto de ECO
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    {isClientScheduleWindow() ? <ClientScheduleWindow /> : <App />}
  </React.StrictMode>
);
