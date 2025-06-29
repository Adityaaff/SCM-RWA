import { ethers } from 'ethers';

export const connectWallet = async () => {
  if (typeof window.ethereum !== 'undefined') {
    const provider = new ethers.BrowserProvider(window.ethereum);
    await provider.send('eth_requestAccounts', []);
    return provider.getSigner();
  }
  throw new Error('Please install MetaMask');
};

export const formatTokenAmount = (amount: bigint, decimals: number) => {
  return ethers.formatUnits(amount, decimals);
};

export interface Profile {
  username: string;
  profilePicture: string;
}

export const saveProfile = (address: string, profile: Profile) => {
  localStorage.setItem(`profile_${address}`, JSON.stringify(profile));
};

export const getProfile = (address: string): Profile => {
  const profile = localStorage.getItem(`profile_${address}`);
  return profile ? JSON.parse(profile) : { username: '', profilePicture: '' };
};