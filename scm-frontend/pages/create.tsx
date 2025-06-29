'use client';

import { useState } from 'react';
import { ethers } from 'ethers';
import { motion } from 'framer-motion';
import { getContract, connectWallet } from '../lib/contracts';
import { useWallet } from '../lib/context/WalletContext';

const fadeInUp = {
  hidden: { opacity: 0, y: 60 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 120, damping: 12 } },
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
    } catch (error) {
      setStatus(`Error: ${error.message}`);
    }
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={fadeInUp}
      className="max-w-md mx-auto bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md"
    >
      <h2 className="text-2xl font-bold mb-4">Create Product</h2>
      {!signer && (
        <button
          onClick={connect}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-full py-2 text-sm font-medium transition mb-4"
        >
          Connect Wallet
        </button>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium">Name</label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full p-2 rounded-md bg-gray-100 dark:bg-gray-700"
            required
            disabled={!signer}
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Description</label>
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="w-full p-2 rounded-md bg-gray-100 dark:bg-gray-700"
            required
            disabled={!signer}
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Image URL</label>
          <input
            type="url"
            value={form.imageURL}
            onChange={(e) => setForm({ ...form, imageURL: e.target.value })}
            className="w-full p-2 rounded-md bg-gray-100 dark:bg-gray-700"
            required
            disabled={!signer}
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Min Price (USD)</label>
          <input
            type="number"
            value={form.minUSD}
            onChange={(e) => setForm({ ...form, minUSD: e.target.value })}
            className="w-full p-2 rounded-md bg-gray-100 dark:bg-gray-700"
            required
            disabled={!signer}
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Max Price (USD)</label>
          <input
            type="number"
            value={form.maxUSD}
            onChange={(e) => setForm({ ...form, maxUSD: e.target.value })}
            className="w-full p-2 rounded-md bg-gray-100 dark:bg-gray-700"
            required
            disabled={!signer}
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Stock</label>
          <input
            type="number"
            value={form.stock}
            onChange={(e) => setForm({ ...form, stock: e.target.value })}
            className="w-full p-2 rounded-md bg-gray-100 dark:bg-gray-700"
            required
            disabled={!signer}
          />
        </div>
        <div>
          <label className="block text-sm font-medium">
            Dynamic Pricing
            <input
              type="checkbox"
              checked={form.dynamicPricing}
              onChange={(e) => setForm({ ...form, dynamicPricing: e.target.checked })}
              className="ml-2"
              disabled={!signer}
            />
          </label>
        </div>
        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-full py-2 text-sm font-medium transition"
          disabled={!signer}
        >
          Create Product
        </button>
      </form>
      {status && <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">{status}</p>}
    </motion.div>
  );
}