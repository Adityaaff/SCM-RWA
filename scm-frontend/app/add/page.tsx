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

const SELL_TOKEN_ADDRESS = '0x0A503c3edd83f952C16397D8d5773770619C1912';

export default function CreateProduct() {
  const { signer, address, connect } = useWallet();
  const [form, setForm] = useState({
    name: '',
    description: '',
    imageURL: '',
    minUSD: '',
    maxUSD: '',
    stock: '',
    dynamicPricing: false,
    tokenToSell: SELL_TOKEN_ADDRESS,
  });
  const [status, setStatus] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userBalance, setUserBalance] = useState<string | null>(null);
  const [tokenSymbol, setTokenSymbol] = useState<string>('SELL_TOKEN');

  useEffect(() => {
    async function fetchTokenSymbol() {
      if (!signer) return;
      try {
        const tokenContract = new ethers.Contract(
          SELL_TOKEN_ADDRESS,
          ['function symbol() view returns (string)'],
          signer
        );
        const symbol = await tokenContract.symbol();
        setTokenSymbol(symbol);
      } catch (error) {
        console.error('Error fetching token symbol:', error);
      }
    }
    fetchTokenSymbol();
    fetchUserBalance();
  }, [signer, address]);

  const fetchUserBalance = async () => {
    if (!signer || !address) return;
    try {
      const tokenContract = new ethers.Contract(
        SELL_TOKEN_ADDRESS,
        ['function balanceOf(address account) view returns (uint256)', 'function decimals() view returns (uint8)'],
        signer
      );
      const balance = await tokenContract.balanceOf(address);
      const decimals = await tokenContract.decimals();
      const formattedBalance = ethers.formatUnits(balance, decimals);
      setUserBalance(formattedBalance);
    } catch (error: any) {
      console.error('Error fetching balance:', error);
      setStatus(`Error: ${error.reason || error.message || 'Failed to fetch balance'}`);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signer) {
      setStatus('Please connect your wallet');
      await connect();
      return;
    }

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
      const minUSD = ethers.parseUnits(form.minUSD || '0', 6);
      const maxUSD = ethers.parseUnits(form.maxUSD || '0', 6);
      const stock = Number(form.stock);
      const tokenAmount = await contract.getTokenAmountFromUSD(SELL_TOKEN_ADDRESS, minUSD);
      const decimals = await new ethers.Contract(
        SELL_TOKEN_ADDRESS,
        ['function decimals() view returns (uint8)'],
        signer
      ).decimals();
      const formattedTokenAmount = Number(ethers.formatUnits(tokenAmount, decimals));
      if (userBalance && Number(userBalance) < formattedTokenAmount * stock) {
        setStatus(
          `Error: Insufficient balance. You have ${userBalance} ${tokenSymbol}, need ${formattedTokenAmount * stock}`
        );
        setIsSubmitting(false);
        return;
      }

      const tx = await contract.createProduct(
        form.name,
        form.description,
        form.imageURL,
        minUSD,
        maxUSD,
        stock,
        form.dynamicPricing,
        SELL_TOKEN_ADDRESS
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
        tokenToSell: SELL_TOKEN_ADDRESS,
      });
      setUserBalance(null);
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
            onClick={() => connect()}
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
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Token to Sell
              </label>
              <p className="w-full p-3 rounded-md bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-800 dark:text-white">
                {tokenSymbol} ({SELL_TOKEN_ADDRESS})
              </p>
              {userBalance && (
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  Your balance: {userBalance} {tokenSymbol}
                </p>
              )}
            </motion.div>
            <motion.div custom={8} variants={fadeInUp}>
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
              custom={9}
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
            custom={10}
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