import { Layout } from 'antd';
import React, { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import './App.scss';
import { WagmiProvider } from 'wagmi'
import { config } from './config'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import {
  RainbowKitProvider,
} from '@rainbow-me/rainbowkit';

const { Content } = Layout;
const queryClient = new QueryClient()

function App() {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          <div className='app'>
            <Layout>
              <Content className='content'>
                <Outlet></Outlet>
              </Content>
            </Layout>
          </div>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

export default App;
