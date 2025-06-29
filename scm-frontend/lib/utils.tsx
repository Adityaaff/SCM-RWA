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
  chainId: '0xaa36a7', 
  chainName: 'Sepolia Testnet',
  rpcUrls: ['https://sepolia.infura.io/v3/YOUR_INFURA_KEY'],
  nativeCurrency: {
    name: 'Sepolia Ether',
    symbol: 'ETH',
    decimals: 18,
  },
  blockExplorerUrls: ['https://sepolia.etherscan.io'],
};

export const connectWallet = async (): Promise<ethers.Signer> => {
  if (!window.ethereum) {
    throw new Error('No Ethereum wallet detected. Please install MetaMask or another wallet.');
  }

  try {
    await window.ethereum.request({ method: 'eth_requestAccounts' });
    const provider = new ethers.BrowserProvider(window.ethereum);
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
  return (Number(amount) / 10 ** decimals).toFixed(2);
};

export interface Profile {
  username: string;
  profilePicture: string;
}

export const saveProfile = async (address: string, profile: Profile): Promise<void> => {
  if (!address) {
    throw new Error('No address provided for saving profile');
  }
  try {
    localStorage.setItem(`profile_${address.toLowerCase()}`, JSON.stringify(profile));
  } catch (error) {
    throw new Error('Failed to save profile to localStorage');
  }
};

export const getProfile = async (address: string): Promise<Profile> => {
  if (!address) {
    throw new Error('No address provided for retrieving profile');
  }
  try {
    const profile = localStorage.getItem(`profile_${address.toLowerCase()}`);
    return profile ? JSON.parse(profile) : { username: '', profilePicture: '' };
  } catch (error) {
    throw new Error('Failed to retrieve profile from localStorage');
  }
};