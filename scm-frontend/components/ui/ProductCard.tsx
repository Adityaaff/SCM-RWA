'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ethers } from 'ethers';
import { formatTokenAmount } from '../../lib/utils';

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
  tokenToSell: string;
}

interface ProductCardProps {
  product: Product;
  index: number;
  signer: ethers.JsonRpcSigner | null;
  selectedChain: string;
  selectedToken: string;
  onBuy: (productId: number, isCrossChain: boolean) => Promise<void>;
  isBuying: boolean;
}

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

const paymentTokens = [
  { address: '0xd00ae08403B9bbb9124bB305C09058E32C39A48c', symbol: 'WAVAX' },
  { address: '0x7bA2e5c37C4151d654Fcc4b41ffF3Fe693c23852', symbol: 'USDC' },
];

export default function ProductCard({ product, index, signer, selectedChain, selectedToken, onBuy, isBuying }: ProductCardProps) {
  const [showPurchase, setShowPurchase] = useState(false);
  const [imageError, setImageError] = useState(false);

  const priceUSD = product.dynamicPricing
    ? product.minUSD + (product.maxUSD - product.minUSD) / BigInt(2)
    : product.minUSD;

  const fallbackImage = 'https://via.placeholder.com/150?text=No+Image';
  const tokenSymbol = paymentTokens.find(t => t.address === selectedToken)?.symbol || selectedToken;
  const preferredTokenSymbol = paymentTokens.find(t => t.address === product.tokenToSell)?.symbol || product.tokenToSell;

  return (
    <motion.div
      custom={index + 2}
      variants={fadeInUp}
      initial="hidden"
      animate="visible"
      className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-md"
    >
      <div className="mb-4">
        <img
          src={imageError || !product.imageURL ? fallbackImage : product.imageURL}
          alt={product.name}
          className="w-full h-48 object-cover rounded-md"
          onError={() => setImageError(true)}
        />
      </div>
      <h2 className="text-xl font-semibold">{product.name}</h2>
      <p className="text-gray-500 dark:text-gray-400 mt-2">{product.description}</p>
      <p className="text-sm mt-2">Price: {formatTokenAmount(priceUSD, 6)} USD</p>
      <p className="text-sm">Stock: {product.stock}</p>
      <p className="text-sm">Preferred token: {preferredTokenSymbol}</p>
      <div className="mt-4">
        <motion.button
          custom={index + 3}
          variants={fadeInUp}
          onClick={() => setShowPurchase(!showPurchase)}
          disabled={isBuying}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md text-sm font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {showPurchase ? 'Cancel' : 'Buy'}
        </motion.button>
      </div>
      {showPurchase && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="mt-4 space-y-4"
        >
          <p className="text-sm text-gray-700 dark:text-gray-300">
            Confirm purchase using {tokenSymbol}
          </p>
          <div className="flex space-x-4">
            <motion.button
              custom={index + 4}
              variants={fadeInUp}
              onClick={() => onBuy(product.id, false)}
              disabled={isBuying}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-md text-sm font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isBuying ? 'Purchasing...' : 'Buy Now (Same Chain)'}
            </motion.button>
            <motion.button
              custom={index + 5}
              variants={fadeInUp}
              onClick={() => onBuy(product.id, true)}
              disabled={isBuying || !selectedChain}
              className="w-full bg-teal-600 hover:bg-teal-700 text-white py-2 px-4 rounded-md text-sm font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isBuying ? 'Purchasing...' : 'Buy Now (Cross-Chain)'}
            </motion.button>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}