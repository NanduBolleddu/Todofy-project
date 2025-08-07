// frontend/src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import keycloak from './keycloak'; 
import './index.css'; 

keycloak.init({ onLoad: 'login-required' })
  .then((authenticated) => {
    if (authenticated) {
      console.log("Keycloak authenticated successfully.");
      ReactDOM.createRoot(document.getElementById('root')).render(
        <React.StrictMode>
          <App keycloak={keycloak} />
        </React.StrictMode>
      );
    } else {
      console.log("Keycloak not authenticated.");
    }
  })
  .catch((error) => {
    console.error("Keycloak initialization failed:", error);
    ReactDOM.createRoot(document.getElementById('root')).render(
      <React.StrictMode>
        <p>Error: Failed to connect to authentication server. Please check Keycloak configuration.</p>
      </React.StrictMode>
    );
  });