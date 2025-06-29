'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { useWallet } from '../lib/context/WalletContext';
import { getProfile, saveProfile, Profile } from '../lib/utils';

const fadeInUp = {
  hidden: { opacity: 0, y: 60 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 120, damping: 12 } },
};

export default function Profile() {
  const { address, connect } = useWallet();
  const [profile, setProfile] = useState<Profile>({ username: '', profilePicture: '' });
  const [status, setStatus] = useState('');

  useEffect(() => {
    if (address) {
      setProfile(getProfile(address));
    }
  }, [address]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!address) {
      setStatus('Please connect your wallet');
      return;
    }
    saveProfile(address, profile);
    setStatus('Profile saved successfully!');
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={fadeInUp}
      className="max-w-md mx-auto bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md"
    >
      <h2 className="text-2xl font-bold mb-4">Profile</h2>
      {!address ? (
        <button
          onClick={connect}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-full py-2 text-sm font-medium transition"
        >
          Connect Wallet
        </button>
      ) : (
        <>
          <div className="flex items-center mb-4">
            <Image
              src={profile.profilePicture || '/file.svg'}
              alt="Profile Picture"
              width={80}
              height={80}
              className="rounded-full"
            />
            <div className="ml-4">
              <p className="text-sm">Wallet: {address.slice(0, 6)}...{address.slice(-4)}</p>
              <p className="text-sm">Username: {profile.username || 'Not set'}</p>
            </div>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium">Username</label>
              <input
                type="text"
                value={profile.username}
                onChange={(e) => setProfile({ ...profile, username: e.target.value })}
                className="w-full p-2 rounded-md bg-gray-100 dark:bg-gray-700"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Profile Picture URL</label>
              <input
                type="url"
                value={profile.profilePicture}
                onChange={(e) => setProfile({ ...profile, profilePicture: e.target.value })}
                className="w-full p-2 rounded-md bg-gray-100 dark:bg-gray-700"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-full py-2 text-sm font-medium transition"
            >
              Save Profile
            </button>
          </form>
          {status && <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">{status}</p>}
        </>
      )}
    </motion.div>
  );
}