import React from 'react';
<<<<<<< Updated upstream
import { createRoot } from 'react-dom/client';
import App from './App';
import './styles/globals.css';
import './styles/theme.css';
import './styles/animation.css';
createRoot(document.getElementById('root')).render(<React.StrictMode><App /></React.StrictMode>);
=======
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
>>>>>>> Stashed changes
