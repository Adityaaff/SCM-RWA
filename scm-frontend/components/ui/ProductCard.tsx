'use client';

import { motion } from 'framer-motion';
import { ethers } from 'ethers';
import { formatTokenAmount } from '../../lib/utils';

const fadeInUp = {
  hidden: { opacity: 0, y: 60 },
  visible: (custom: number = 1) => ({
    opacity: 1,
    y: 0,
    transition: { delay: custom * 0.15, type: 'spring', stiffness: 120, damping: 12, mass: 0.8 },
  }),
};

interface Product {
  id: number;
  seller: string;
  name: string;
  description: string;
  imageURL: string;
  minUSD: bigint;
  maxUSD: bigint;
  stock: number;
  dynamicPricing: boolean;
}

interface ProductCardProps {
  product: Product;
  index: number;
  signer: ethers.Signer | null;
  selectedToken: string;
  selectedChain: 'Sepolia' | 'Avalanche';
  onBuy: (productId: number, isCrossChain: boolean) => Promise<void>;
}

const chainSelectors = {
  Sepolia: '16015286601757825753',
  Avalanche: '14767482510784806043',
} as const;

export default function ProductCard({ product, index, signer, selectedToken, selectedChain, onBuy }: ProductCardProps) {
  const handleBuy = async (isCrossChain: boolean) => {
    if (!signer) return;
    await onBuy(product.id, isCrossChain);
  };

  const priceUSD = product.dynamicPricing
    ? product.minUSD + (product.maxUSD - product.minUSD) / BigInt(2)
    : product.minUSD;

  return (
    <motion.div
      key={product.id}
      custom={index + 3}
      variants={fadeInUp}
      initial="hidden"
      animate="visible"
      className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-md"
    >
      {product.imageURL && (
        <img
          src={product.imageURL}
          alt={product.name}
          className="w-full h-48 object-cover rounded-md mb-4"
        />
      )}
      <h2 className="text-xl font-semibold text-gray-800 dark:text-white">{product.name}</h2>
      <p className="text-gray-500 dark:text-gray-400 mt-2">{product.description}</p>
      <p className="text-sm mt-2 text-gray-700 dark:text-gray-300">
        Price: {formatTokenAmount(priceUSD, 6)} USD
      </p>
      <p className="text-sm text-gray-700 dark:text-gray-300">Stock: {product.stock}</p>
      <div className="mt-4 flex space-x-4">
        <motion.button
          custom={index + 4}
          variants={fadeInUp}
          onClick={() => handleBuy(false)}
          disabled={!signer || !selectedToken || product.stock === 0}
          className="bg-purple-600 hover:bg-purple-700 text-white rounded-full py-3 px-6 text-sm font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Buy Now (Same Chain)
        </motion.button>
        <motion.button
          custom={index + 5}
          variants={fadeInUp}
          onClick={() => handleBuy(true)}
          disabled={!signer || !selectedToken || !selectedChain || product.stock === 0}
          className="bg-teal-600 hover:bg-teal-700 text-white rounded-full py-3 px-6 text-sm font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Buy Now (Cross-Chain)
        </motion.button>
      </div>
    </motion.div>
  );
}