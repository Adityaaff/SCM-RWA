'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { useWallet } from '../lib/context/WalletContext';
import { useState } from 'react';

const fadeInDown = {
  hidden: { opacity: 0, y: -20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export default function Header() {
  const { address, connect, disconnect } = useWallet();
  const [isConnecting, setIsConnecting] = useState(false);

  const shortenAddress = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;

  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      await connect();
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <motion.header
      initial="hidden"
      animate="visible"
      variants={fadeInDown}
      className="bg-white dark:bg-gray-900 shadow-md p-4 sticky top-0 z-10"
    >
      <nav className="flex justify-between items-center max-w-7xl mx-auto">
        <Link href="/" className="text-xl font-bold">
          DEX Marketplace
        </Link>
        <div className="flex gap-4 items-center">
          <Link href="/create" className="hover:underline">
            Create Product
          </Link>
          <Link href="/products" className="hover:underline">
            Products
          </Link>
          <Link href="/confirm" className="hover:underline">
            Confirm Delivery
          </Link>
          <Link href="/profile" className="hover:underline">
            Profile
          </Link>
          <Link href="/settings" className="hover:underline">
            Settings
          </Link>
          <Link href="/submit" className="hover:underline">
            Submit Scale Data
          </Link>
          {address ? (
            <>
              <span className="text-sm">{shortenAddress(address)}</span>
              <button
                onClick={disconnect}
                className="rounded-full bg-red-600 hover:bg-red-700 text-white px-4 py-2 text-sm font-medium transition"
              >
                Disconnect
              </button>
            </>
          ) : (
            <button
              onClick={handleConnect}
              disabled={isConnecting}
              className={`rounded-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 text-sm font-medium transition ${
                isConnecting ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isConnecting ? 'Connecting...' : 'Connect Wallet'}
            </button>
          )}
        </div>
      </nav>
    </motion.header>
  );
}