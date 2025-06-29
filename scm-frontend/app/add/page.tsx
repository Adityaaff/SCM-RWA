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

export default function CreateProduct() {
  const { signer, connect } = useWallet();
  const [form, setForm] = useState({
    name: '',
    description: '',
    imageURL: '',
    minUSD: '',
    maxUSD: '',
    stock: '',
    dynamicPricing: false,
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

    // Validate form inputs
    if (Number(form.minUSD) > Number(form.maxUSD)) {
      setStatus('Error: Minimum price must be less than or equal to maximum price');
      return;
    }
    if (Number(form.stock) <= 0) {
      setStatus('Error: Stock must be greater than 0');
      return;
    }

    setStatus('Creating product...');
    setIsSubmitting(true);
    try {
      const contract = await getContract(signer);
      const tx = await contract.createProduct(
        form.name,
        form.description,
        form.imageURL,
        ethers.parseUnits(form.minUSD || '0', 6), // USD has 6 decimals (as per contract)
        ethers.parseUnits(form.maxUSD || '0', 6),
        Number(form.stock),
        form.dynamicPricing
      );
      await tx.wait();
      setStatus('Product created successfully!');
      setForm({
        name: '',
        description: '',
        imageURL: '',
        minUSD: '',
        maxUSD: '',
        stock: '',
        dynamicPricing: false,
      });
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
        className="max-w-lg w-full bg-white dark:bg-gray-900 p-8 rounded-lg shadow-md"
      >
        <motion.h2 custom={0} variants={fadeInUp} className="text-3xl font-bold text-center mb-8">
          Create a New Product
        </motion.h2>
        {!signer ? (
          <motion.button
            custom={1}
            variants={fadeInUp}
            onClick={connect}
            disabled={isSubmitting}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-full py-3 text-sm font-medium transition disabled:opacity-50"
          >
            {isSubmitting ? 'Connecting...' : 'Connect Wallet'}
          </motion.button>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <motion.div custom={1} variants={fadeInUp}>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Product Name
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full p-3 rounded-md bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter product name"
                required
              />
            </motion.div>
            <motion.div custom={2} variants={fadeInUp}>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Description
              </label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full p-3 rounded-md bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter product description"
                rows={4}
                required
              />
            </motion.div>
            <motion.div custom={3} variants={fadeInUp}>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Image URL
              </label>
              <input
                type="url"
                value={form.imageURL}
                onChange={(e) => setForm({ ...form, imageURL: e.target.value })}
                className="w-full p-3 rounded-md bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter image URL"
                required
              />
            </motion.div>
            <motion.div custom={4} variants={fadeInUp}>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Minimum Price (USD)
              </label>
              <input
                type="number"
                step="0.01"
                value={form.minUSD}
                onChange={(e) => setForm({ ...form, minUSD: e.target.value })}
                className="w-full p-3 rounded-md bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter minimum price"
                required
              />
            </motion.div>
            <motion.div custom={5} variants={fadeInUp}>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Maximum Price (USD)
              </label>
              <input
                type="number"
                step="0.01"
                value={form.maxUSD}
                onChange={(e) => setForm({ ...form, maxUSD: e.target.value })}
                className="w-full p-3 rounded-md bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter maximum price"
                required
              />
            </motion.div>
            <motion.div custom={6} variants={fadeInUp}>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Stock Quantity
              </label>
              <input
                type="number"
                min="1"
                value={form.stock}
                onChange={(e) => setForm({ ...form, stock: e.target.value })}
                className="w-full p-3 rounded-md bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter stock quantity"
                required
              />
            </motion.div>
            <motion.div custom={7} variants={fadeInUp}>
              <label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300">
                Enable Dynamic Pricing
                <input
                  type="checkbox"
                  checked={form.dynamicPricing}
                  onChange={(e) => setForm({ ...form, dynamicPricing: e.target.checked })}
                  className="ml-2 h-4 w-4 text-blue-600 dark:text-blue-400 focus:ring-blue-500 border-gray-300 dark:border-gray-600 rounded"
                />
              </label>
            </motion.div>
            <motion.button
              custom={8}
              variants={fadeInUp}
              type="submit"
              disabled={isSubmitting || !signer}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-full py-3 text-sm font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Creating Product...' : 'Create Product'}
            </motion.button>
          </form>
        )}
        {status && (
          <motion.p
            custom={9}
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