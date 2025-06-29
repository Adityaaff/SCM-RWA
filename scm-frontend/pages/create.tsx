'use client';

import { useState } from 'react';
import { ethers } from 'ethers';
import { motion } from 'framer-motion';
import { getContract } from '../lib/contracts';
import { useWallet } from '../lib/context/WalletContext';

const fadeInUp = {
  hidden: { opacity: 0, y: 60 },
  visible: (custom: number = 1) => ({
    opacity: 1,
    y: 0,
    transition: { delay: custom * 0.15, type: 'spring', stiffness: 120, damping: 12 },
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signer) {
      setStatus('Please connect your wallet');
      await connect();
      return;
    }
    setStatus('Creating product...');
    try {
      const contract = await getContract(signer);
      const tx = await contract.createProduct(
        form.name,
        form.description,
        form.imageURL,
        ethers.parseUnits(form.minUSD, 6), // USD has 6 decimals
        ethers.parseUnits(form.maxUSD, 6),
        Number(form.stock),
        form.dynamicPricing
      );
      await tx.wait();
      setStatus('Product created successfully!');
      setForm({ name: '', description: '', imageURL: '', minUSD: '', maxUSD: '', stock: '', dynamicPricing: false });
    } catch (error: any) {
      setStatus(`Error: ${error.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black text-gray-800 dark:text-white p-8 sm:p-20 flex items-center justify-center">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeInUp}
        className="max-w-md mx-auto bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md"
      >
        <motion.h2 custom={0} variants={fadeInUp} className="text-2xl font-bold mb-6">
          Create Product
        </motion.h2>
        {!signer ? (
          <motion.button
            custom={1}
            variants={fadeInUp}
            onClick={connect}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-full py-2 text-sm font-medium transition"
          >
            Connect Wallet
          </motion.button>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <motion.div custom={1} variants={fadeInUp}>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Name
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full p-2 mt-1 rounded-md bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600"
                placeholder="Enter product name"
                required
              />
            </motion.div>
            <motion.div custom={2} variants={fadeInUp}>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Description
              </label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full p-2 mt-1 rounded-md bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600"
                placeholder="Enter product description"
                required
              />
            </motion.div>
            <motion.div custom={3} variants={fadeInUp}>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Image URL
              </label>
              <input
                type="url"
                value={form.imageURL}
                onChange={(e) => setForm({ ...form, imageURL: e.target.value })}
                className="w-full p-2 mt-1 rounded-md bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600"
                placeholder="Enter image URL"
                required
              />
            </motion.div>
            <motion.div custom={4} variants={fadeInUp}>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Min Price (USD)
              </label>
              <input
                type="number"
                value={form.minUSD}
                onChange={(e) => setForm({ ...form, minUSD: e.target.value })}
                className="w-full p-2 mt-1 rounded-md bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600"
                placeholder="Enter minimum price"
                required
              />
            </motion.div>
            <motion.div custom={5} variants={fadeInUp}>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Max Price (USD)
              </label>
              <input
                type="number"
                value={form.maxUSD}
                onChange={(e) => setForm({ ...form, maxUSD: e.target.value })}
                className="w-full p-2 mt-1 rounded-md bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600"
                placeholder="Enter maximum price"
                required
              />
            </motion.div>
            <motion.div custom={6} variants={fadeInUp}>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Stock
              </label>
              <input
                type="number"
                value={form.stock}
                onChange={(e) => setForm({ ...form, stock: e.target.value })}
                className="w-full p-2 mt-1 rounded-md bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600"
                placeholder="Enter stock quantity"
                required
              />
            </motion.div>
            <motion.div custom={7} variants={fadeInUp}>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Dynamic Pricing
                <input
                  type="checkbox"
                  checked={form.dynamicPricing}
                  onChange={(e) => setForm({ ...form, dynamicPricing: e.target.checked })}
                  className="ml-2"
                />
              </label>
            </motion.div>
            <motion.button
              custom={8}
              variants={fadeInUp}
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-full py-2 text-sm font-medium transition disabled:opacity-50"
              disabled={!signer}
            >
              Create Product
            </motion.button>
          </form>
        )}
        {status && (
          <motion.p custom={9} variants={fadeInUp} className="mt-4 text-sm text-gray-600 dark:text-gray-400">
            {status}
          </motion.p>
        )}
      </motion.div>
    </div>
  );
}