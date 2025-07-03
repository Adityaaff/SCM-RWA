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

export const targetChains: ChainConfig[] = [
  {
    chainId: '0xaa36a7', 
    chainName: 'Sepolia Testnet',
    rpcUrls: ['https://sepolia.infura.io/v3/YOUR_INFURA_KEY'],
    nativeCurrency: {
      name: 'Sepolia Ether',
      symbol: 'ETH',
      decimals: 18,
    },
    blockExplorerUrls: ['https://sepolia.etherscan.io'],
  },
  {
    chainId: '0xa869', 
    chainName: 'Avalanche Fuji Testnet',
    rpcUrls: ['https://avalanche-fuji-c-chain-rpc.publicnode.com'],
    nativeCurrency: {
      name: 'Avalanche',
      symbol: 'AVAX',
      decimals: 18,
    },
    blockExplorerUrls: ['https://testnet.snowtrace.io'],
  },
];

export const defaultChain: ChainConfig = targetChains[1];

export const connectWallet = async (targetChainId: string = defaultChain.chainId): Promise<ethers.Signer> => {
  if (!window.ethereum) {
    throw new Error('No Ethereum wallet detected. Please install MetaMask or another wallet.');
  }

  try {
    // Find the target chain configuration
    const targetChain = targetChains.find(chain => chain.chainId === targetChainId);
    if (!targetChain) {
      throw new Error(`Chain ID ${targetChainId} not supported`);
    }

    // Request wallet connection
    await window.ethereum.request({ method: 'eth_requestAccounts' });
    const provider = new ethers.BrowserProvider(window.ethereum);
    const network = await provider.getNetwork();

    // Check if the current network matches the target chain
    if (network.chainId !== BigInt(targetChain.chainId)) {
      try {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: targetChain.chainId }],
        });
      } catch (switchError: any) {
        if (switchError.code === 4902) {
          // Chain not added, add it
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [targetChain],
          });
        } else {
          throw new Error(`Please switch to ${targetChain.chainName} in your wallet.`);
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