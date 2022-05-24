import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { DAppProvider, Config, Kovan, Rinkeby } from '@usedapp/core'
import { getDefaultProvider } from 'ethers'

const config: Config = {
  readOnlyUrls: {
    [Kovan.chainId]: getDefaultProvider('kovan'),
    [Rinkeby.chainId]: getDefaultProvider('rinkeby'),
  },
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <DAppProvider config={config}>
      <App />
    </DAppProvider>
  </React.StrictMode>
);
