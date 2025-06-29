'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { useWallet } from '../lib/context/WalletContext';

const fadeInUp = {
  hidden: { opacity: 0, y: 60 },
  visible: (custom: number = 1) => ({
    opacity: 1,
    y: 0,
    transition: { delay: custom * 0.15, type: 'spring', stiffness: 120, damping: 12 },
  }),
};

export default function SubmitPage() {
  const { signer, connect } = useWallet();
  const [itemName, setItemName] = useState('');
  const [weight, setWeight] = useState('');
  const [itemType, setItemType] = useState('');
  const [timestamp, setTimestamp] = useState('');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!signer) {
      setError('Please connect your wallet');
      await connect();
      return;
    }

    setLoading(true);
    setError('');
    setResponse('');

    try {
      const { data } = await axios.post(
        'https://zinc-cat-bumper.glitch.me/submit-scale-data',
        {
          itemName,
          weight: parseFloat(weight),
          itemType,
          timestamp: timestamp ? parseInt(timestamp) : Math.floor(Date.now() / 1000),
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer TESTABCD',
          },
        }
      );

      setResponse(data.message || 'Scale data submitted successfully');
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || err.message || 'Submission failed');
      } else {
        setError('Unknown error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black text-gray-800 dark:text-white p-8 sm:p-20 flex items-center justify-center">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeInUp}
        className="w-full max-w-md bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md"
      >
        <motion.h2
          custom={0}
          variants={fadeInUp}
          className="text-2xl font-bold mb-6 text-gray-800 dark:text-white"
        >
          Submit Scale Data
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
          <>
            <motion.div custom={1} variants={fadeInUp}>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Item Name
              </label>
              <input
                type="text"
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
                className="w-full p-2 mt-1 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white border border-gray-300 dark:border-gray-600"
                placeholder="Enter item name"
                required
              />
            </motion.div>
            <motion.div custom={2} variants={fadeInUp} className="mt-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Weight (kg)
              </label>
              <input
                type="number"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                className="w-full p-2 mt-1 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white border border-gray-300 dark:border-gray-600"
                placeholder="Enter weight in kg"
                required
              />
            </motion.div>
            <motion.div custom={3} variants={fadeInUp} className="mt-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Item Type
              </label>
              <input
                type="text"
                value={itemType}
                onChange={(e) => setItemType(e.target.value)}
                className="w-full p-2 mt-1 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white border border-gray-300 dark:border-gray-600"
                placeholder="Enter item type"
                required
              />
            </motion.div>
            <motion.div custom={4} variants={fadeInUp} className="mt-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Timestamp (optional)
              </label>
              <input
                type="number"
                value={timestamp}
                onChange={(e) => setTimestamp(e.target.value)}
                className="w-full p-2 mt-1 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white border border-gray-300 dark:border-gray-600"
                placeholder="Enter timestamp (Unix)"
              />
            </motion.div>
            <motion.button
              custom={5}
              variants={fadeInUp}
              onClick={handleSubmit}
              disabled={loading || !itemName || !weight || !itemType}
              className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white rounded-full py-2 text-sm font-medium transition disabled:opacity-50"
            >
              {loading ? 'Submitting...' : 'Submit Scale Data'}
            </motion.button>
            {response && (
              <motion.p
                custom={6}
                variants={fadeInUp}
                className="mt-4 text-sm text-green-600 dark:text-green-400"
              >
                ✅ {response}
              </motion.p>
            )}
            {error && (
              <motion.p
                custom={7}
                variants={fadeInUp}
                className="mt-4 text-sm text-red-600 dark:text-red-400"
              >
                ❌ {error}
              </motion.p>
            )}
          </>
        )}
      </motion.div>
    </div>
  );
}