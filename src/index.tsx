import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import {
  EthereumClient,
  w3mConnectors,
  w3mProvider
} from '@web3modal/ethereum';
import { Web3Modal } from '@web3modal/react';
import { configureChains, createConfig, WagmiConfig } from 'wagmi';
import { goerli } from 'wagmi/chains';
import App from './App.tsx';
import './index.scss';
import { ClerkProvider } from "@clerk/clerk-react";
import AIME from './pages/AIME/AIME.tsx';
import Rewards from './pages/Rewards/Rewards.tsx';

const chains = [goerli]
const projectId = '2e586b0807500a0da3a4f7b66418295e';
const INFURA_API_KEY = '46cdd1b1481049b992a90914cc17b52f';

const { publicClient } = configureChains(
  chains,
  [w3mProvider({ projectId })]
  // [infuraProvider({ apiKey: INFURA_API_KEY }), publicProvider()]
);

const wagmiConfig = createConfig({
  autoConnect: true,
  connectors: w3mConnectors({ projectId, chains } as any),
  publicClient
})
const ethereumClient = new EthereumClient(wagmiConfig, chains)

// const wagmiConfig = createConfig({
//   autoConnect: true,
//   connectors: [
//     new MetaMaskConnector({ chains }),
//     ...w3mConnectors({ projectId, version: 1, chains }),
//   ],
//   publicClient,
//   // webSocketPublicClient,
// });

// const ethereumClient = new EthereumClient(wagmiConfig, chains);

if (!process.env.REACT_APP_CLERK_PUBLISHABLE_KEY) {
  throw new Error("Missing Publishable Key")
}
const clerkPubKey = process.env.REACT_APP_CLERK_PUBLISHABLE_KEY;

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <>
    <WagmiConfig config={wagmiConfig}>
      <ClerkProvider publishableKey={clerkPubKey}>
        <BrowserRouter>
          <Routes>
            <Route path='/' element={<App />}>
              <Route path='' element={<AIME />} />
              <Route path='rewards' element={<Rewards></Rewards>} />
              <Route path='*' element={<Navigate to='/' />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </ClerkProvider>
    </WagmiConfig>

    <Web3Modal projectId={projectId} ethereumClient={ethereumClient} />
  </>
);
