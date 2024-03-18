import { http, createConfig } from 'wagmi'
import { arbitrumSepolia } from 'wagmi/chains'
import {
  getDefaultConfig,
  RainbowKitProvider,
} from '@rainbow-me/rainbowkit';

export const config = getDefaultConfig({
  appName: 'AIME NFT',
  projectId: '75c7ae62e54cdc7807a8b3e7d67e5b8c',// aime-nft
  chains: [arbitrumSepolia],
});

// export const config = createConfig({
//   chains: [sepolia],
//   transports: {
//     [sepolia.id]: http(),
//   },
// })