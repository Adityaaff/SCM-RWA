'use client';

import { useState } from 'react';
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

export default function Mint() {
  const { signer, address, connect } = useWallet();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [imageURL, setImageURL] = useState('');
  const [minUSD, setMinUSD] = useState('');
  const [maxUSD, setMaxUSD] = useState('');
  const [stock, setStock] = useState('');
  const [dynamicPricing, setDynamicPricing] = useState(false);
  const [status, setStatus] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signer) {
      setStatus('Please connect your wallet');
      await connect();
      return;
    }
    if (!name || !description || !imageURL || !minUSD || !maxUSD || !stock) {
      setStatus('Please fill in all fields');
      return;
    }
    const minUSDAmount = parseFloat(minUSD);
    const maxUSDAmount = parseFloat(maxUSD);
    const stockAmount = parseInt(stock);
    if (minUSDAmount > maxUSDAmount) {
      setStatus('Minimum USD must be less than or equal to Maximum USD');
      return;
    }
    if (stockAmount <= 0) {
      setStatus('Stock must be greater than 0');
      return;
    }

    setIsSubmitting(true);
    setStatus('Creating product...');
    try {
      const contract = await getContract(signer);
      const minUSDBigInt = ethers.parseUnits(minUSD, 6); // Assuming 6 decimals for USD
      const maxUSDBigInt = ethers.parseUnits(maxUSD, 6);
      const tx = await contract.createProduct(
        name,
        description,
        imageURL,
        minUSDBigInt,
        maxUSDBigInt,
        stockAmount,
        dynamicPricing
      );
      await tx.wait();
      setStatus('Product created successfully!');
      setName('');
      setDescription('');
      setImageURL('');
      setMinUSD('');
      setMaxUSD('');
      setStock('');
      setDynamicPricing(false);
    } catch (error: any) {
      console.error('Error creating product:', error);
      setStatus(`Error: ${error.reason || error.message || 'Failed to create product'}`);
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
        className="w-full max-w-md"
      >
        <h1 className="text-3xl font-bold mb-8 text-center">Create Product</h1>
        {!signer ? (
          <motion.button
            custom={1}
            variants={fadeInUp}
            onClick={connect}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-full py-3 px-6 text-sm font-medium transition"
          >
            Connect Wallet
          </motion.button>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-3 rounded-md bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-800 dark:text-white"
                placeholder="Product Name"
                disabled={isSubmitting}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full p-3 rounded-md bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-800 dark:text-white"
                placeholder="Product Description"
                rows={4}
                disabled={isSubmitting}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Image URL</label>
              <input
                type="text"
                value={imageURL}
                onChange={(e) => setImageURL(e.target.value)}
                className="w-full p-3 rounded-md bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-800 dark:text-white"
                placeholder="https://example.com/image.jpg"
                disabled={isSubmitting}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Minimum USD</label>
              <input
                type="number"
                step="0.01"
                value={minUSD}
                onChange={(e) => setMinUSD(e.target.value)}
                className="w-full p-3 rounded-md bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-800 dark:text-white"
                placeholder="1.00"
                disabled={isSubmitting}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Maximum USD</label>
              <input
                type="number"
                step="0.01"
                value={maxUSD}
                onChange={(e) => setMaxUSD(e.target.value)}
                className="w-full p-3 rounded-md bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-800 dark:text-white"
                placeholder="2.00"
                disabled={isSubmitting}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Stock</label>
              <input
                type="number"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                className="w-full p-3 rounded-md bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-800 dark:text-white"
                placeholder="10"
                disabled={isSubmitting}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                <input
                  type="checkbox"
                  checked={dynamicPricing}
                  onChange={(e) => setDynamicPricing(e.target.checked)}
                  className="mr-2"
                  disabled={isSubmitting}
                />
                Dynamic Pricing
              </label>
            </div>
            <motion.button
              custom={2}
              variants={fadeInUp}
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white rounded-full py-3 px-6 text-sm font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Creating...' : 'Create Product'}
            </motion.button>
          </form>
        )}
        {status && (
          <motion.p
            custom={3}
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
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