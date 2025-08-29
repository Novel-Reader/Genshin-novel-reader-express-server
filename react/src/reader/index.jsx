import React from 'react';
import ReactDOM from 'react-dom/client';
import App from 'genshin-novel-reader';

const root = ReactDOM.createRoot(document.getElementById('react-app'));

root.render(
  <App
    mode={'online'}
    server={'http://127.0.0.1:8081'}
  />
);
