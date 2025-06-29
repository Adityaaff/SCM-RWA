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

export default function ProfilePage() {
  const { signer, address, connect } = useWallet();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function fetchProfile() {
      if (!address) return;
      try {
        const profileData = await getProfile(address);
        setProfile(profileData);
        setName(profileData?.name || '');
        setEmail(profileData?.email || '');
      } catch (error: any) {
        console.error('Error fetching profile:', error);
        setStatus(`Error: ${error.message || 'Failed to fetch profile'}`);
      }
    }
    fetchProfile();
  }, [address]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signer) {
      setStatus('Please connect your wallet');
      await connect();
      return;
    }
    if (!name || !email) {
      setStatus('Please fill in all fields');
      return;
    }
    setIsSubmitting(true);
    setStatus('Saving profile...');
    try {
      await saveProfile(address!, { name, email, wallet: address! });
      setStatus('Profile saved successfully!');
    } catch (error: any) {
      console.error('Error saving profile:', error);
      setStatus(`Error: ${error.message || 'Failed to save profile'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!signer) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-black text-gray-800 dark:text-white p-8 sm:p-20 flex items-center justify-center">
        <motion.button
          custom={1}
          variants={fadeInUp}
          initial="hidden"
          animate="visible"
          onClick={connect}
          className="bg-blue-600 hover:bg-blue-700 text-white rounded-full py-3 px-6 text-sm font-medium transition"
        >
          Connect Wallet
        </motion.button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black text-gray-800 dark:text-white p-8 sm:p-20 flex items-center justify-center">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeInUp}
        className="w-full max-w-md"
      >
        <h1 className="text-3xl font-bold mb-8 text-center">User Profile</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-3 rounded-md bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-800 dark:text-white"
              placeholder="Your Name"
              disabled={isSubmitting}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 rounded-md bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-800 dark:text-white"
              placeholder="your.email@example.com"
              disabled={isSubmitting}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Wallet Address</label>
            <input
              type="text"
              value={address || ''}
              readOnly
              className="w-full p-3 rounded-md bg-gray-200 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400"
            />
          </div>
          <motion.button
            custom={2}
            variants={fadeInUp}
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white rounded-full py-3 px-6 text-sm font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Saving...' : 'Save Profile'}
          </motion.button>
        </form>
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