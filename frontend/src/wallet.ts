import { DAppConnector } from '@hashgraph/hedera-wallet-connect';
import { LedgerId } from '@hashgraph/sdk';

// Your WalletConnect project ID from https://cloud.walletconnect.com
const PROJECT_ID = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID;

export const dAppConnector = new DAppConnector({
  name: 'CryptoFight Club',
  description: 'A simple web3 dueling game on Hedera',
  url: 'https://localhost:5173',
  icons: ['https://walletconnect.com/walletconnect-logo.svg'],
}, LedgerId.TESTNET, PROJECT_ID);

export async function connectHashPack() {
  await dAppConnector.init();
  await dAppConnector.openModal();
  const signers = dAppConnector.signers;
  if (signers.length > 0) {
    return signers[0];
  }
  throw new Error('No signers available');
}
