'use client';

import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { motion } from 'framer-motion';
import { getContract } from '../../lib/contracts';
import { useWallet } from '../../lib/context/WalletContext';

const fadeInUp = {
  hidden: { opacity: 0, y: 60 },
  visible: (custom: number = 1) => ({
    opacity: 1,
    y: 0,
    transition: { delay: custom * 0.15, type: 'spring', stiffness: 120, damping: 12, mass: 0.8 },
  }),
};

export default function Settings() {
  const { signer, address, connect } = useWallet();
  const [isOwner, setIsOwner] = useState(false);
  const [tokenAddress, setTokenAddress] = useState('');
  const [priceFeedAddress, setPriceFeedAddress] = useState('');
  const [removeTokenAddress, setRemoveTokenAddress] = useState('');
  const [allowedTokens, setAllowedTokens] = useState<string[]>([]);
  const [status, setStatus] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function checkOwner() {
      if (signer && address) {
        try {
          const contract = await getContract(signer);
          const owner = await contract.owner();
          setIsOwner(owner.toLowerCase() === address.toLowerCase());
          const tokens = await contract.getAllowedTokens();
          setAllowedTokens(tokens);
        } catch (error: any) {
          console.error('Error checking owner:', error);
          setStatus(`Error: ${error.reason || error.message || 'Failed to load settings'}`);
        }
      }
    }
    checkOwner();
  }, [signer, address]);

  const handleAddToken = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signer) {
      setStatus('Please connect your wallet');
      await connect();
      return;
    }
    setIsSubmitting(true);
    try {
      const contract = await getContract(signer);
      const tx = await contract.addAllowedToken(tokenAddress, priceFeedAddress);
      await tx.wait();
      setAllowedTokens([...allowedTokens, tokenAddress]);
      setTokenAddress('');
      setPriceFeedAddress('');
      setStatus('Token added successfully!');
    } catch (error: any) {
      console.error('Error adding token:', error);
      setStatus(`Error: ${error.reason || error.message || 'Failed to add token'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemoveToken = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signer) {
      setStatus('Please connect your wallet');
      await connect();
      return;
    }
    setIsSubmitting(true);
    try {
      const contract = await getContract(signer);
      const tx = await contract.removeAllowedToken(removeTokenAddress);
      await tx.wait();
      setAllowedTokens(allowedTokens.filter((t) => t !== removeTokenAddress));
      setRemoveTokenAddress('');
      setStatus('Token removed successfully!');
    } catch (error: any) {
      console.error('Error removing token:', error);
      setStatus(`Error: ${error.reason || error.message || 'Failed to remove token'}`);
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
          Settings
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
        ) : !isOwner ? (
          <motion.p custom={1} variants={fadeInUp} className="text-gray-500 dark:text-gray-400 text-center">
            Only the contract owner can manage settings.
          </motion.p>
        ) : (
          <div className="space-y-8">
            <form onSubmit={handleAddToken} className="space-y-6">
              <motion.h2 custom={1} variants={fadeInUp} className="text-xl font-semibold">
                Add Allowed Token
              </motion.h2>
              <motion.div custom={2} variants={fadeInUp}>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Token Address
                </label>
                <input
                  type="text"
                  value={tokenAddress}
                  onChange={(e) => setTokenAddress(e.target.value)}
                  className="w-full p-3 rounded-md bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter token address"
                  required
                />
              </motion.div>
              <motion.div custom={3} variants={fadeInUp}>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Price Feed Address
                </label>
                <input
                  type="text"
                  value={priceFeedAddress}
                  onChange={(e) => setPriceFeedAddress(e.target.value)}
                  className="w-full p-3 rounded-md bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter price feed address"
                  required
                />
              </motion.div>
              <motion.button
                custom={4}
                variants={fadeInUp}
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-full py-3 text-sm font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Adding...' : 'Add Token'}
              </motion.button>
            </form>
            <form onSubmit={handleRemoveToken} className="space-y-6">
              <motion.h2 custom={5} variants={fadeInUp} className="text-xl font-semibold">
                Remove Allowed Token
              </motion.h2>
              <motion.div custom={6} variants={fadeInUp}>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Token Address
                </label>
                <select
                  value={removeTokenAddress}
                  onChange={(e) => setRemoveTokenAddress(e.target.value)}
                  className="w-full p-3 rounded-md bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-800 dark:text-white"
                >
                  <option value="">Select token to remove</option>
                  {allowedTokens.map((token) => (
                    <option key={token} value={token}>
                      {token}
                    </option>
                  ))}
                </select>
              </motion.div>
              <motion.button
                custom={7}
                variants={fadeInUp}
                type="submit"
                disabled={isSubmitting || !removeTokenAddress}
                className="w-full bg-red-600 hover:bg-red-700 text-white rounded-full py-3 text-sm font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Removing...' : 'Remove Token'}
              </motion.button>
            </form>
          </div>
        )}
        {status && (
          <motion.p
            custom={8}
            variants={fadeInUp}
            className={`mt-6 text-center text-sm ${
              status.includes('Error') ? 'text-red-500 dark:text-red-400' : 'text-green-600 dark:text-green-400'
            }`}
          >
            {status}
          </motion.p>
        )}
      </motion.div>
    </div>
  );
}