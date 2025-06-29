'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useWallet } from '../lib/context/WalletContext';

const fadeInUp = {
  hidden: { opacity: 0, y: 60 },
  visible: (custom: number = 1) => ({
    opacity: 1,
    y: 0,
    transition: { delay: custom * 0.15, type: 'spring', stiffness: 120, damping: 12, mass: 0.8 },
  }),
};

export default function Mint() {
  const { signer, connect } = useWallet();
  const [form, setForm] = useState({
    assetId: '',
    metadata: '',
  });
  const [status, setStatus] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signer) {
      setStatus('Please connect your wallet');
      await connect();
      return;
    }
    setIsSubmitting(true);
    setStatus('Minting RWA token...');
    try {
      // Placeholder: Add logic to mint RWA token (e.g., call ERC-721 contract)
      console.log('Minting RWA Token:', form);
      setStatus('RWA token minted successfully!');
      setForm({ assetId: '', metadata: '' });
    } catch (error: any) {
      console.error('Error minting token:', error);
      setStatus(`Error: ${error.message || 'Failed to mint token'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black text-gray-800 dark:text-white p-8 sm:p-20 flex items-center justify-center">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeInUp}
        className="max-w-lg w-full bg-white dark:bg-gray-900 p-8 rounded-lg shadow-md"
      >
        <motion.h1 custom={0} variants={fadeInUp} className="text-3xl font-bold text-center mb-8">
          Mint RWA Token
        </motion.h1>
        {!signer ? (
          <motion.button
            custom={1}
            variants={fadeInUp}
            onClick={connect}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-full py-3 text-sm font-medium transition"
          >
            Connect Wallet
          </motion.button>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <motion.div custom={1} variants={fadeInUp}>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Asset ID
              </label>
              <input
                type="text"
                value={form.assetId}
                onChange={(e) => setForm({ ...form, assetId: e.target.value })}
                className="w-full p-3 rounded-md bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter asset ID"
                required
              />
            </motion.div>
            <motion.div custom={2} variants={fadeInUp}>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Metadata URL
              </label>
              <input
                type="url"
                value={form.metadata}
                onChange={(e) => setForm({ ...form, metadata: e.target.value })}
                className="w-full p-3 rounded-md bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter metadata URL"
                required
              />
            </motion.div>
            <motion.button
              custom={3}
              variants={fadeInUp}
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white rounded-full py-3 text-sm font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Minting...' : 'Mint RWA Token'}
            </motion.button>
          </form>
        )}
        {status && (
          <motion.p
            custom={4}
            variants={fadeInUp}
            className={`mt-6 text-center text-sm ${
              status.includes('Error') ? 'text-red-500 dark:text-red-400'имое 'text-green-600 dark:text-green-400'
            }`}
          >
            {status}
          motion.p>
        )}
      </motion.div>
    </div>
  );
}