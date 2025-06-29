'use client';

import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { motion } from 'framer-motion';
import { getContract } from '../../lib/contracts';
import { formatTokenAmount } from '../../lib/utils';
import { useWallet } from '../../lib/context/WalletContext';

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

// Define chain selectors with explicit type
const chainSelectors = {
  Sepolia: '16015286601757825753',
  Avalanche: '14767482510784806043', // Updated to match error log
} as const;

// Type for valid chain names
type ChainName = keyof typeof chainSelectors;

export default function Products() {
  const { signer, address, connect } = useWallet();
  const [products, setProducts] = useState<Product[]>([]);
  const [allowedTokens, setAllowedTokens] = useState<string[]>([]);
  const [selectedToken, setSelectedToken] = useState<string>('');
  const [selectedChain, setSelectedChain] = useState<ChainName>('Sepolia'); // Use ChainName type
  const [status, setStatus] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isBuying, setIsBuying] = useState<number | null>(null);

  useEffect(() => {
    async function fetchProducts() {
      if (!signer) return;
      setIsLoading(true);
      try {
        const contract = await getContract(signer);
        const productCounter = Number(await contract.productCounter());
        const tokens = await contract.getAllowedTokens();
        const productList: Product[] = [];

        for (let i = 1; i <= productCounter; i++) {
          const product = await contract.products(i);
          if (product.stock > 0) {
            productList.push({
              id: Number(product.id),
              seller: product.seller,
              name: product.name,
              description: product.description,
              imageURL: product.imageURL,
              minUSD: product.minUSD,
              maxUSD: product.maxUSD,
              stock: Number(product.stock),
              dynamicPricing: product.dynamicPricing,
            });
          }
        }
        setProducts(productList);
        setAllowedTokens(tokens);
        setSelectedToken(tokens[0] || '');
        setStatus('');
      } catch (error: any) {
        console.error('Error fetching products:', error);
        setStatus(`Error: ${error.reason || error.message || 'Failed to fetch products'}`);
      } finally {
        setIsLoading(false);
      }
    }
    fetchProducts();
  }, [signer]);

  const handleBuyProduct = async (productId: number, isCrossChain: boolean) => {
    if (!signer) {
      setStatus('Please connect your wallet');
      await connect();
      return;
    }
    if (!selectedToken) {
      setStatus('Please select a token');
      return;
    }
    setIsBuying(productId);
    setStatus(isCrossChain ? 'Initiating cross-chain purchase...' : 'Purchasing product...');
    try {
      const contract = await getContract(signer);
      const product = products.find((p) => p.id === productId);
      if (!product) throw new Error('Product not found');
      const priceUSD = product.dynamicPricing
        ? product.minUSD + (product.maxUSD - product.minUSD) / BigInt(2)
        : product.minUSD;
      const tokenAmount = await contract.getTokenAmountFromUSD(selectedToken, priceUSD);

      if (isCrossChain) {
        const chainSelector = chainSelectors[selectedChain];
        const contractAddress = '0xYourDeployedContractAddress'; // Replace with actual Sepolia contract address
        const tx = await contract.buyProductCrossChain(
          productId,
          selectedToken,
          tokenAmount,
          chainSelector,
          contractAddress,
          { value: ethers.parseEther('0.01') } // CCIP fees in native token
        );
        await tx.wait();
        setStatus('Cross-chain purchase initiated successfully!');
      } else {
        const tokenContract = new ethers.Contract(
          selectedToken,
          ['function approve(address spender, uint256 amount) returns (bool)'],
          signer
        );
        const approveTx = await tokenContract.approve(contract.address, tokenAmount);
        await approveTx.wait();

        const tx = await contract.buyProductWithToken(productId, selectedToken, tokenAmount);
        await tx.wait();
        setProducts(products.map((p) => (p.id === productId ? { ...p, stock: p.stock - 1 } : p)));
        setStatus('Product purchased successfully!');
      }
    } catch (error: any) {
      console.error('Error purchasing product:', error);
      setStatus(`Error: ${error.reason || error.message || 'Failed to purchase product'}`);
    } finally {
      setIsBuying(null);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-black text-gray-800 dark:text-white p-8 sm:p-20 flex items-center justify-center">
        <p className="text-lg font-semibold animate-pulse">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black text-gray-800 dark:text-white p-8 sm:p-20 flex flex-col items-center">
      <motion.h1 custom={0} variants={fadeInUp} initial="hidden" animate="visible" className="text-3xl font-bold mb-8">
        Products
      </motion.h1>
      {!signer ? (
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
      ) : products.length === 0 ? (
        <motion.p custom={1} variants={fadeInUp} initial="hidden" animate="visible" className="text-gray-500 dark:text-gray-400">
          No products available.
        </motion.p>
      ) : (
        <>
          <motion.div custom={1} variants={fadeInUp} initial="hidden" animate="visible" className="mb-6 w-full max-w-md">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Select Token</label>
            <select
              value={selectedToken}
              onChange={(e) => setSelectedToken(e.target.value)}
              className="w-full p-3 rounded-md bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-800 dark:text-white"
            >
              {allowedTokens.map((token) => (
                <option key={token} value={token}>
                  {token}
                </option>
              ))}
            </select>
          </motion.div>
          <motion.div custom={2} variants={fadeInUp} initial="hidden" animate="visible" className="mb-6 w-full max-w-md">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Select Chain</label>
            <select
              value={selectedChain}
              onChange={(e) => setSelectedChain(e.target.value as ChainName)}
              className="w-full p-3 rounded-md bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-800 dark:text-white"
            >
              {Object.keys(chainSelectors).map((chain) => (
                <option key={chain} value={chain}>
                  {chain}
                </option>
              ))}
            </select>
          </motion.div>
          <div className="w-full max-w-4xl space-y-6">
            {products.map((product, index) => (
              <motion.div
                key={product.id}
                custom={index + 3}
                variants={fadeInUp}
                initial="hidden"
                animate="visible"
                className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-md"
              >
                <h2 className="text-xl font-semibold">{product.name}</h2>
                <p className="text-gray-500 dark:text-gray-400 mt-2">{product.description}</p>
                <p className="text-sm mt-2">
                  Price: {formatTokenAmount(product.dynamicPricing ? product.minUSD + (product.maxUSD - product.minUSD) / BigInt(2) : product.minUSD, 6)} USD
                </p>
                <p className="text-sm">Stock: {product.stock}</p>
                <div className="mt-4 flex space-x-4">
                  <motion.button
                    custom={index + 4}
                    variants={fadeInUp}
                    onClick={() => handleBuyProduct(product.id, false)}
                    disabled={isBuying === product.id || !selectedToken}
                    className="bg-purple-600 hover:bg-purple-700 text-white rounded-full py-3 px-6 text-sm font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isBuying === product.id ? 'Purchasing...' : 'Buy Now (Same Chain)'}
                  </motion.button>
                  <motion.button
                    custom={index + 5}
                    variants={fadeInUp}
                    onClick={() => handleBuyProduct(product.id, true)}
                    disabled={isBuying === product.id || !selectedToken || !selectedChain}
                    className="bg-teal-600 hover:bg-teal-700 text-white rounded-full py-3 px-6 text-sm font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isBuying === product.id ? 'Purchasing...' : 'Buy Now (Cross-Chain)'}
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </div>
        </>
      )}
      {status && (
        <motion.p
          custom={products.length + 3}
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
    </div>
  );
}