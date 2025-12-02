import React from 'react';
import ReactDOM from 'react-dom/client';
import App from 'genshin-novel-reader';
import CONFIG from '../../config/config.json';
import LOCAL_CONFIG from '../../config/config-local.json';

const config = LOCAL_CONFIG || CONFIG;

const root = ReactDOM.createRoot(document.getElementById('react-app'));

root.render(
  <App
    mode={'online'}
    server={`http://${config.expressHost}:${config.expressPort}`}
  />
);
