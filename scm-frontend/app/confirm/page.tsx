'use client';

import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { motion } from 'framer-motion';
import { getContract } from '../../lib/contracts';
import { useWallet } from '../../lib/context/WalletContext';
import { formatTokenAmount } from '../../lib/utils';

const fadeInUp = {
  hidden: { opacity: 0, y: 60 },
  visible: (custom: number = 1) => ({
    opacity: 1,
    y: 0,
    transition: { delay: custom * 0.15, type: 'spring', stiffness: 120, damping: 12, mass: 0.8 },
  }),
};

interface Payment {
  productId: number;
  buyer: string;
  amountUSD: bigint;
  amountTokenPaid: bigint;
  tokenPaid: string;
  delivered: boolean;
}

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

export default function Confirm() {
  const { signer, address, connect } = useWallet();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [status, setStatus] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isConfirming, setIsConfirming] = useState<number | null>(null);

  useEffect(() => {
    async function fetchPayments() {
      if (!signer || !address) return;
      setIsLoading(true);
      try {
        const contract = await getContract(signer);
        const productCounter = Number(await contract.productCounter());
        const userPayments: Payment[] = [];
        const productDetails: Product[] = [];

        for (let i = 1; i <= productCounter; i++) {
          const payment = await contract.payments(i);
          if (payment.buyer.toLowerCase() === address.toLowerCase() && !payment.delivered) {
            userPayments.push({
              productId: i,
              buyer: payment.buyer,
              amountUSD: payment.amountUSD,
              amountTokenPaid: payment.amountTokenPaid,
              tokenPaid: payment.tokenPaid,
              delivered: payment.delivered,
            });
            const product = await contract.products(i);
            productDetails.push({
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
            setStatus('');
          }
        }
        setPayments(userPayments);
        setProducts(productDetails);
      } catch (error: any) {
        console.error('Error fetching payments:', error);
        setStatus(`Error: ${error.reason || error.message || 'Failed to fetch payments'}`);
      } finally {
        setIsLoading(false);
      }
    }
    fetchPayments();
  }, [signer, address]);

  const handleConfirmDelivery = async (productId: number) => {
    if (!signer) {
      setStatus('Please connect your wallet');
      await connect();
      return;
    }
    setIsConfirming(productId);
    setStatus('Confirming delivery...');
    try {
      const contract = await getContract(signer);
      const tx = await contract.confirmDelivery(productId);
      await tx.wait();
      setPayments(payments.filter((p) => p.productId !== productId));
      setStatus('Delivery confirmed successfully!');
    } catch (error: any) {
      console.error('Error confirming delivery:', error);
      setStatus(`Error: ${error.reason || error.message || 'Failed to confirm delivery'}`);
    } finally {
      setIsConfirming(null);
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
        Confirm Delivery
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
      ) : payments.length === 0 ? (
        <motion.p custom={1} variants={fadeInUp} initial="hidden" animate="visible" className="text-gray-500 dark:text-gray-400">
          No pending deliveries found.
        </motion.p>
      ) : (
        <div className="w-full max-w-4xl space-y-6">
          {payments.map((payment, index) => {
            const product = products.find((p) => p.id === payment.productId);
            return (
              <motion.div
                key={payment.productId}
                custom={index + 1}
                variants={fadeInUp}
                initial="hidden"
                animate="visible"
                className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-md"
              >
                <h2 className="text-xl font-semibold">{product?.name || `Product ${payment.productId}`}</h2>
                <p className="text-gray-500 dark:text-gray-400 mt-2">{product?.description}</p>
                <p className="text-sm mt-2">
                  Paid: {formatTokenAmount(payment.amountUSD, 6)} USD in {payment.tokenPaid} (
                  {formatTokenAmount(payment.amountTokenPaid, 18)})
                </p>
                <motion.button
                  custom={index + 2}
                  variants={fadeInUp}
                  onClick={() => handleConfirmDelivery(payment.productId)}
                  disabled={isConfirming === payment.productId}
                  className="mt-4 bg-green-600 hover:bg-green-700 text-white rounded-full py-3 px-6 text-sm font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isConfirming === payment.productId ? 'Confirming...' : 'Confirm Delivery'}
                </motion.button>
              </motion.div>
            );
          })}
        </div>
      )}
      {status && (
        <motion.p
          custom={payments.length + 1}
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