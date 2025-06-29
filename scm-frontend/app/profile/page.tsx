'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useWallet } from '../../lib/context/WalletContext';
import { saveProfile, getProfile } from '../../lib/utils';
import type { Profile } from '../../lib/utils'; 

const fadeInUp = {
  hidden: { opacity: 0, y: 60 },
  visible: (custom: number = 1) => ({
    opacity: 1,
    y: 0,
    transition: { delay: custom * 0.15, type: 'spring', stiffness: 120, damping: 12, mass: 0.8 },
  }),
};

export default function Profile() {
  const { address, connect } = useWallet();
  const [form, setForm] = useState<Profile>({ username: '', profilePicture: '' });
  const [status, setStatus] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function fetchProfile() {
      if (!address) return;
      try {
        const profile = await getProfile(address); // Async call
        setForm(profile || { username: '', profilePicture: '' });
      } catch (error: any) {
        console.error('Error fetching profile:', error);
        setStatus(`Error: ${error.message || 'Failed to fetch profile'}`);
      }
    }
    fetchProfile();
  }, [address]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address) {
      setStatus('Please connect your wallet');
      await connect();
      return;
    }
    if (!form.username) {
      setStatus('Please enter a username');
      return;
    }
    setIsSubmitting(true);
    try {
      await saveProfile(address, form); // Async call
      setStatus('Profile saved successfully!');
    } catch (error: any) {
      console.error('Error saving profile:', error);
      setStatus(`Error: ${error.message || 'Failed to save profile'}`);
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
          Your Profile
        </motion.h1>
        {!address ? (
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
                Username
              </label>
              <input
                type="text"
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                className="w-full p-3 rounded-md bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter username"
                required
              />
            </motion.div>
            <motion.div custom={2} variants={fadeInUp}>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Profile Picture URL
              </label>
              <input
                type="url"
                value={form.profilePicture}
                onChange={(e) => setForm({ ...form, profilePicture: e.target.value })}
                className="w-full p-3 rounded-md bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter profile picture URL"
              />
            </motion.div>
            <motion.div custom={3} variants={fadeInUp}>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Wallet Address
              </label>
              <input
                type="text"
                value={address}
                readOnly
                className="w-full p-3 rounded-md bg-gray-200 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400"
              />
            </motion.div>
            <motion.button
              custom={4}
              variants={fadeInUp}
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-full py-3 text-sm font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Saving...' : 'Save Profile'}
            </motion.button>
          </form>
        )}
        {status && (
          <motion.p
            custom={5}
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