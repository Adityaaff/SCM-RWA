'use client';

import { motion } from 'framer-motion';

const fadeInUp = {
  hidden: { opacity: 0, y: 60 },
  visible: (custom: number = 1) => ({
    opacity: 1,
    y: 0,
    transition: { delay: custom * 0.15, type: 'spring', stiffness: 120, damping: 12, mass: 0.8 },
  }),
};

interface TokenSelectorProps {
  tokens: string[];
  selectedToken: string;
  onChange: (token: string) => void;
  custom?: number;
}

export default function TokenSelector({ tokens, selectedToken, onChange, custom = 1 }: TokenSelectorProps) {
  return (
    <motion.div custom={custom} variants={fadeInUp} initial="hidden" animate="visible" className="mb-6 w-full max-w-md">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Select Token</label>
      <select
        value={selectedToken}
        onChange={(e) => onChange(e.target.value)}
        className="w-full p-3 rounded-md bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="">Select a token</option>
        {tokens.map((token) => (
          <option key={token} value={token}>
            {token} 
          </option>
        ))}
      </select>
    </motion.div>
  );
}