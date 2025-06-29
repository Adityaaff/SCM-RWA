'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { useWallet } from '../lib/context/WalletContext';

const fadeInDown = {
  hidden: { opacity: 0, y: -20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export default function Header() {
  const { address, connect, disconnect } = useWallet();

  const shortenAddress = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;

  return (
    <motion.header
      initial="hidden"
      animate="visible"
      variants={fadeInDown}
      className="bg-white dark:bg-gray-900 shadow-md p-4 sticky top-0 z-10"
    >
      <nav className="flex justify-between items-center max-w-7xl mx-auto">
        <Link href="/" className="text-xl font-bold">DEX Marketplace</Link>
        <div className="flex gap-4 items-center">
          <Link href="/create" className="hover:underline">Create Product</Link>
          <Link href="/products" className="hover:underline">Products</Link>
          <Link href="/confirm" className="hover:underline">Confirm Delivery</Link>
          <Link href="/profile" className="hover:underline">Profile</Link>
          <Link href="/settings" className="hover:underline">Settings</Link>
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
              onClick={connect}
              className="rounded-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 text-sm font-medium transition"
            >
              Connect Wallet
            </button>
          )}
        </div>
      </nav>
    </motion.header>
  );
}