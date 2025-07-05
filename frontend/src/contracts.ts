import { dAppConnector } from './wallet';

// Contract addresses from deployment  
export const CONTRACT_ADDRESSES = {
  FighterNFT: '0xd565d1cb8A84FCF656E369C1Db2d2c26Ae2642c1',
  FightClub: '0xF4DA9F2d1e2c62342A00664297a01F9534FFf4D2'
};

export interface FighterStats {
  tokenId: number;
  str: number;
  dex: number;
  hp: number;
}

export async function mintFighter() {
  const signers = dAppConnector.signers;
  if (signers.length === 0) {
    throw new Error('No wallet connected');
  }
  
  const signer = signers[0];
  const accountId = signer.getAccountId();
  
  // Use the DAppSigner's request method with proper Hedera format
  const result = await signer.request({
    method: 'hedera_executeTransaction',
    params: {
      transactionList: [{
        contractId: CONTRACT_ADDRESSES.FighterNFT,
        functionName: 'mint',
        functionParameters: [accountId.toSolidityAddress()],
        gas: 300000
      }]
    }
  });
  
  return result;
}

// For now, let's simplify and just return mock data until we get the contract calls working
export async function getFighterStats(tokenId: number): Promise<FighterStats> {
  // Mock data for testing - we'll fix this once basic minting works
  return {
    tokenId,
    str: Math.floor(Math.random() * 100) + 1,
    dex: Math.floor(Math.random() * 100) + 1,
    hp: Math.floor(Math.random() * 200) + 100
  };
}

export async function getUserFighters(): Promise<FighterStats[]> {
  // Mock data for testing - we'll fix this once basic minting works
  return [];
}
