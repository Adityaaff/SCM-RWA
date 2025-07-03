'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { targetChains, defaultChain, connectWallet } from '../../lib/utils';

interface WalletContextType {
  signer: ethers.Signer | null;
  provider: ethers.BrowserProvider | null;
  address: string | null;
  connect: (chainId?: string) => Promise<void>;
}

const WalletContext = createContext<WalletContextType>({
  signer: null,
  provider: null,
  address: null,
  connect: async () => {},
});

export const WalletProvider = ({ children }: { children: React.ReactNode }) => {
  const [signer, setSigner] = useState<ethers.Signer | null>(null);
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [address, setAddress] = useState<string | null>(null);

  const connect = async (chainId: string = defaultChain.chainId) => {
    try {
      const newSigner = await connectWallet(chainId);
      const newProvider = new ethers.BrowserProvider(window.ethereum);
      const newAddress = await newSigner.getAddress();
      setSigner(newSigner);
      setProvider(newProvider);
      setAddress(newAddress);
    } catch (error: any) {
      console.error('Wallet connection failed:', error.message);
    }
  };

  useEffect(() => {
    if (window.ethereum) {
      const provider = new ethers.BrowserProvider(window.ethereum);
      provider.getSigner().then((signer) => {
        signer.getAddress().then((addr) => {
          setSigner(signer);
          setProvider(provider);
          setAddress(addr);
        }).catch(() => {
          setSigner(null);
          setProvider(null);
          setAddress(null);
        });
      });
    }
  }, []);

  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts: string[]) => {
        if (accounts.length === 0) {
          setSigner(null);
          setProvider(null);
          setAddress(null);
        } else {
          connect();
        }
      });
      window.ethereum.on('chainChanged', () => {
        connect();
      });
    }
  }, []);

  return (
    <WalletContext.Provider value={{ signer, provider, address, connect }}>
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => useContext(WalletContext);