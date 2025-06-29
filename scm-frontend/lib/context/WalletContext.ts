'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { connectWallet } from '../utils';

interface WalletContextType {
  signer: ethers.Signer | null;
  address: string | null;
  connect: () => Promise<void>;
  disconnect: () => void;
}

const WalletContext = createContext<WalletContextType>({
  signer: null,
  address: null,
  connect: async () => {},
  disconnect: () => {},
});

export const WalletProvider = ({ children }: { children: React.ReactNode }) => {
  const [signer, setSigner] = useState<ethers.Signer | null>(null);
  const [address, setAddress] = useState<string | null>(null);

  const connect = async () => {
    try {
      const newSigner = await connectWallet();
      const newAddress = await newSigner.getAddress();
      setSigner(newSigner);
      setAddress(newAddress);
      localStorage.setItem('walletConnected', 'true');
    } catch (error) {
      console.error('Wallet connection failed:', error);
    }
  };

  const disconnect = () => {
    setSigner(null);
    setAddress(null);
    localStorage.removeItem('walletConnected');
  };

  // Auto-connect if previously connected
  useEffect(() => {
    if (localStorage.getItem('walletConnected')) {
      connect();
    }
  }, []);

  // Handle account changes
  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts: string[]) => {
        if (accounts.length === 0) {
          disconnect();
        } else {
          connect();
        }
      });
    }
  }, []);

  return (
    <WalletContext.Provider value={{ signer, address, connect, disconnect }}>
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => useContext(WalletContext);