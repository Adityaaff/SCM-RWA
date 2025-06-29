import { ethers } from 'ethers';

interface ChainConfig {
  chainId: string;
  chainName: string;
  rpcUrls: string[];
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  blockExplorerUrls?: string[];
}

const targetChain: ChainConfig = {
  chainId: '0x1', 
  chainName: 'Ethereum Mainnet',
  rpcUrls: ['https://mainnet.infura.io/v3/YOUR_INFURA_KEY'],
  nativeCurrency: {
    name: 'Ether',
    symbol: 'ETH',
    decimals: 18,
  },
  blockExplorerUrls: ['https://etherscan.io'],
};

export const connectWallet = async (): Promise<ethers.Signer> => {
  // Check if Ethereum provider exists
  if (!window.ethereum) {
    throw new Error('No Ethereum wallet detected. Please install MetaMask or another wallet.');
  }

  try {
    // Request account access
    await window.ethereum.request({ method: 'eth_requestAccounts' });

    // Create provider
    const provider = new ethers.BrowserProvider(window.ethereum);

    // Check network
    const network = await provider.getNetwork();
    if (network.chainId !== BigInt(targetChain.chainId)) {
      try {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: targetChain.chainId }],
        });
      } catch (switchError: any) {
        if (switchError.code === 4902) {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [targetChain],
          });
        } else {
          throw new Error('Please switch to the correct network in your wallet.');
        }
      }
    }
    const signer = await provider.getSigner();
    return signer;
  } catch (error: any) {
    if (error.code === 4001) {
      throw new Error('Wallet connection rejected by user.');
    }
    throw new Error(`Failed to connect wallet: ${error.message || error}`);
  }
};

export const formatTokenAmount = (amount: bigint, decimals: number): string => {
  return ethers.formatUnits(amount, decimals);
};

export interface Profile {
  username: string;
  profilePicture: string;
}

export const saveProfile = (address: string, profile: Profile): void => {
  if (!address) {
    console.warn('No address provided for saving profile');
    return;
  }
  localStorage.setItem(`profile_${address.toLowerCase()}`, JSON.stringify(profile));
};

export const getProfile = (address: string): Profile => {
  if (!address) {
    console.warn('No address provided for retrieving profile');
    return { username: '', profilePicture: '' };
  }
  const profile = localStorage.getItem(`profile_${address.toLowerCase()}`);
  return profile ? JSON.parse(profile) : { username: '', profilePicture: '' };
};