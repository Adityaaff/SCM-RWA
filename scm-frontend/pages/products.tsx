'use client';

import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { motion } from 'framer-motion';
import ProductCard from '../../components/ProductCard';
import TokenSelector from '../../components/TokenSelector';
import { getContract, formatTokenAmount } from '../../lib/contracts';
import { useWallet } from '../../lib/context/WalletContext';

const fadeInUp = {
  hidden: { opacity: 0, y: 60 },
  visible: (custom: number = 1) => ({
    opacity: 1,
    y: 0,
    transition: { delay: custom * 0.15, type: 'spring', stiffness: 120, damping: 12 },
  }),
};

export default function Products() {
  const { signer, connect } = useWallet();
  const [products, setProducts] = useState([]);
  const [tokens, setTokens] = useState([]);
  const [selectedToken, setSelectedToken] = useState('');
  const [status, setStatus] = useState('');

  useEffect(() => {
    if (signer) {
      const fetchData = async () => {
        try {
          const contract = await getContract(signer);
          const tokenList = await contract.getAllowedTokens();
          setTokens(tokenList);

          const productCount = await contract.productCounter();
          const productArray = [];
          for (let i = 1; i <= productCount; i++) {
            const product = await contract.products(i);
            productArray.push({
              id: Number(product.id),
              seller: product.seller,
              name: product.name,
              description: product.description,
              imageURL: product.imageURL,
              minUSD: Number(ethers.formatUnits(product.minUSD, 6)),
              maxUSD: Number(ethers.formatUnits(product.maxUSD, 6)),
              stock: Number(product.stock),
              dynamicPricing: product.dynamicPricing,
            });
          }
          setProducts(productArray);
        } catch (error) {
          setStatus(`Error: ${error.message}`);
        }
      };
      fetchData();
    }
  }, [signer]);

  const handleBuy = async (productId: number) => {
    if (!signer) {
      setStatus('Please connect your wallet');
      await connect();
      return;
    }
    if (!selectedToken) {
      setStatus('Please select a token');
      return;
    }
    setStatus('Approving token...');
    try {
      const contract = await getContract(signer);
      const tokenContract = new ethers.Contract(selectedToken, AssetTokenABI, signer);
      const decimals = await tokenContract.decimals();
      const priceUSD = products.find((p) => p.id === productId).minUSD;
      const tokenAmount = await contract.getTokenAmountFromUSD(selectedToken, ethers.parseUnits(priceUSD.toString(), 6));

      const approveTx = await tokenContract.approve(DEX_MARKETPLACE_ADDRESS, tokenAmount);
      await approveTx.wait();

      setStatus('Purchasing product...');
      const tx = await contract.buyProductWithToken(productId, selectedToken, tokenAmount);
      await tx.wait();
      setStatus('Purchase successful!');

      const product = await contract.products(productId);
      setProducts((prev) =>
        prev.map((p) => (p.id === productId ? { ...p, stock: Number(product.stock) } : p))
      );
    } catch (error) {
      setStatus(`Error: ${error.message}`);
    }
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={fadeInUp}
      className="max-w-7xl mx-auto"
    >
      <h2 className="text-2xl font-bold mb-4">Products</h2>
      {!signer ? (
        <button
          onClick={connect}
          className="w-full max-w-md bg-blue-600 hover:bg-blue-700 text-white rounded-full py-2 text-sm font-medium transition mb-4"
        >
          Connect Wallet
        </button>
      ) : (
        <>
          <TokenSelector tokens={tokens} selectedToken={selectedToken} onSelect={setSelectedToken} />
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mt-6">
            {products.map((product, index) => (
              <motion.div key={product.id} custom={index} variants={fadeInUp}>
                <ProductCard product={product} onBuy={handleBuy} />
              </motion.div>
            ))}
          </div>
        </>
      )}
      {status && <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">{status}</p>}
    </motion.div>
  );
}