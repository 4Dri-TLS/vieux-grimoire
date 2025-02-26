/*
     eslint-disable react/jsx-filename-extension
*/
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  // retrait de <React.StrictMode>
  <App />,
);

reportWebVitals();
