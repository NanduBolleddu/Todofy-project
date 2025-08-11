// frontend/src/keycloak.js
import Keycloak from 'keycloak-js';

const keycloakConfig = {
  url: 'http://localhost:8080/',           
  realm: 'todofy-realm',            
  clientId: 'todofy-public',             
};

const keycloak = new Keycloak(keycloakConfig);

export default keycloak;